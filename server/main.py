import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from bson import ObjectId
from typing import List
import numpy as np
import asyncio

from .db import db
from .simple_tfidf import compute_tfidf_similarity
import pdfplumber
from io import BytesIO
from . import scraper
from .ml_utils import extract_skills, compute_skill_gap
from .auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart Job Match - Backend")
app.include_router(auth_router, prefix="/auth")

# Allow CORS from local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Smart Job Match API"}

@app.get("/health")
async def health():
    # quick DB ping
    try:
        await db.command({"ping": 1})
        db_status = "ok"
    except Exception:
        db_status = "unreachable"
    return {"status": "ok", "db": db_status}

@app.post("/cv/upload")
async def upload_cv(file: UploadFile = File(...)):
    """Upload a CV (PDF or text). Extracts text and stores in MongoDB."""
    content = await file.read()
    text = None
    # Try PDF extraction
    try:
        if file.filename.lower().endswith('.pdf'):
            with pdfplumber.open(BytesIO(content)) as pdf:
                pages = [p.extract_text() or '' for p in pdf.pages]
                text = '\n'.join(pages)
        else:
            text = content.decode('utf-8', errors='ignore')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {e}")

    if not text or text.strip() == '':
        raise HTTPException(status_code=400, detail="No text extracted from CV")

    cv_skills = extract_skills(text)

    doc = {
        "filename": file.filename,
        "text": text,
        "skills": cv_skills,
        "created_at": datetime.utcnow()
    }
    result = await db.cvs.insert_one(doc)
    return {"cv_id": str(result.inserted_id)}


async def _match_by_tfidf(cv_text: str, top_k: int = 10, max_jobs: int = 1000):
    """Internal helper: find top-k job matches for given cv text using TF-IDF."""
    cursor = db.jobs.find({}, {"title": 1, "company": 1, "description": 1, "url": 1, "skills":1}).limit(max_jobs)
    jobs = await cursor.to_list(length=max_jobs)
    if not jobs:
        return []

    job_texts = [j.get('description', '') for j in jobs]
    sims = compute_tfidf_similarity(cv_text, job_texts, max_features=5000)
    top_idx = np.argsort(sims)[::-1][:top_k]

    matches = []
    for idx in top_idx:
        job = jobs[int(idx)]
        matches.append({
            "job_id": str(job.get('_id')),
            "title": job.get('title'),
            "company": job.get('company'),
            "url": job.get('url'),
            "score": float(sims[int(idx)]),
            "skills": job.get('skills', [])
        })
    return matches


@app.get("/cv/{cv_id}/matches")
async def match_jobs(cv_id: str, top_k: int = 10, max_jobs: int = 1000):
    """Return top-k job matches for the given CV id using TF-IDF."""
    try:
        cv = await db.cvs.find_one({"_id": ObjectId(cv_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cv_id")
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    cv_text = cv.get('text', '')
    if not cv_text:
        raise HTTPException(status_code=400, detail="No text found for CV")

    matches = await _match_by_tfidf(cv_text, top_k=top_k, max_jobs=max_jobs)
    return {"matches": matches}


@app.post("/cv/{cv_id}/find_global_jobs")
async def find_global_jobs(cv_id: str, top_k: int = 10, limit_per_site: int = 50, max_jobs: int = 1000):
    """Scrape global job sites, store job postings, then return top-k matches for the CV including skill gaps."""
    try:
        cv = await db.cvs.find_one({"_id": ObjectId(cv_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cv_id")
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    # Run scrapers in thread to avoid blocking the event loop
    scraped_jobs = await asyncio.to_thread(scraper.scrape_all, limit_per_site)

    # Upsert scraped jobs into MongoDB and compute skills
    inserted = 0
    for job in scraped_jobs:
        title = job.get('title')
        company = job.get('company')
        url = job.get('url')
        description = job.get('description') or ''
        skills = job.get('skills') or extract_skills(description)
        if not title or not description or not url:
            continue
        doc = {
            'title': title,
            'company': company,
            'url': url,
            'description': description,
            'skills': skills,
            'created_at': job.get('created_at', datetime.utcnow())
        }
        # upsert by url
        await db.jobs.update_one({'url': url}, {'$set': doc}, upsert=True)
        inserted += 1

    # Now run matching
    cv_text = cv.get('text', '')
    if not cv_text:
        raise HTTPException(status_code=400, detail="No text found for CV")

    matches = await _match_by_tfidf(cv_text, top_k=top_k, max_jobs=max_jobs)

    # compute skill gaps per match
    cv_skills = cv.get('skills', []) or extract_skills(cv.get('text', ''))
    for m in matches:
        job_skills = m.get('skills', [])
        m['skill_gap'] = compute_skill_gap(cv_skills, job_skills)

    return {"inserted_jobs": inserted, "matches": matches}


@app.get('/cv/{cv_id}/skill_gap')
async def cv_skill_gap(cv_id: str, top_k: int = 10):
    """Compute aggregated skill gap between CV and top-k matching jobs."""
    try:
        cv = await db.cvs.find_one({"_id": ObjectId(cv_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cv_id")
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    cv_skills = cv.get('skills', []) or extract_skills(cv.get('text', ''))
    cv_text = cv.get('text', '')
    if not cv_text:
        raise HTTPException(status_code=400, detail="No text found for CV")
    matches = await _match_by_tfidf(cv_text, top_k=top_k)
    # aggregate job skills
    needed = set()
    for m in matches:
        needed.update([s.lower() for s in m.get('skills', [])])
    gap = sorted(needed - set([s.lower() for s in cv_skills]))
    return {"cv_skills": cv_skills, "aggregated_needed_skills": sorted(needed), "skill_gap": gap}


@app.post("/jobs/add")
async def add_job(title: str, company: str = None, url: str = None, description: str = None):
    """Add a job posting manually. Stores it with extracted skills."""
    if not description:
        raise HTTPException(status_code=400, detail="Job description is required")
    skills = extract_skills(description)
    doc = {
        "title": title,
        "company": company,
        "url": url,
        "description": description,
        "skills": skills,
        "created_at": datetime.utcnow()
    }
    res = await db.jobs.insert_one(doc)
    return {"job_id": str(res.inserted_id)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
