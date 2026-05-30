import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Query
from fastapi.responses import JSONResponse
from bson import ObjectId
from typing import List, Optional
import numpy as np
import asyncio

from db import db, setup_db
from simple_tfidf import compute_tfidf_similarity
import pdfplumber
from io import BytesIO
import scraper
from ml_utils import parse_cv_text, compute_skill_gap, normalize_skill, extract_skills
from auth import router as auth_router, get_current_user
from fastapi.middleware.cors import CORSMiddleware
from models import MatchResult, SkillGapResponse

app = FastAPI(title="Smart Job Match - Backend")
app.include_router(auth_router, prefix="/auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRIORITY_ORDER = {"High": 0, "Medium": 1, "Low": 2}


@app.on_event("startup")
async def startup_event():
    await setup_db()


@app.get("/")
async def read_root():
    return {"message": "Smart Job Match API", "status": "online"}


@app.get("/health")
async def health():
    try:
        await db.command({"ping": 1})
        db_status = "ok"
    except Exception:
        db_status = "unreachable"
    return {"status": "ok", "db": db_status}


@app.get("/cv")
async def get_cv(current_user: dict = Depends(get_current_user)):
    """Retrieve the current user's CV data."""
    cv = await db.cvs.find_one({"user_id": current_user["_id"]})
    if not cv:
        # FIX #3: raise HTTPException consistently (frontend already handles 404 → null)
        raise HTTPException(status_code=404, detail="CV not found")

    cv["_id"] = str(cv["_id"])
    cv["user_id"] = str(cv["user_id"])
    return cv


@app.delete("/cv")
async def delete_cv(current_user: dict = Depends(get_current_user)):
    """Delete the current user's CV."""
    result = await db.cvs.delete_one({"user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="CV not found")
    return {"message": "CV deleted successfully"}


@app.post("/cv/upload")
async def upload_cv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload a CV (PDF or text). Extracts text and stores in MongoDB."""
    print(f"DEBUG: Received CV upload request for user {current_user['email']}")
    content = await file.read()
    text = ""
    try:
        if file.filename.lower().endswith('.pdf'):
            with pdfplumber.open(BytesIO(content)) as pdf:
                pages = [p.extract_text() or '' for p in pdf.pages]
                text = '\n'.join(pages)
        else:
            text = content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"DEBUG: PDF extraction failed: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {e}")

    if not text or text.strip() == '':
        print("DEBUG: No text extracted from CV")
        raise HTTPException(status_code=400, detail="No text extracted from CV")

    print(f"DEBUG: Extracted text length: {len(text)}")
    extracted_data = parse_cv_text(text)
    print(f"DEBUG: Parsed data: {extracted_data.dict()}")

    doc = {
        "user_id": current_user["_id"],
        "filename": file.filename,
        "text": text,
        "extracted_data": extracted_data.dict(),
        "created_at": datetime.utcnow()
    }
    # FIX #1: was "upset=True" (typo) — CV was never being saved!
    result = await db.cvs.update_one(
        {"user_id": current_user["_id"]},
        {"$set": doc},
        upsert=True  # ← FIXED: was "upset=True"
    )

    cv_id = str(result.upserted_id) if result.upserted_id else None
    if not cv_id:
        existing = await db.cvs.find_one({"user_id": current_user["_id"]})
        cv_id = str(existing["_id"])

    print(f"DEBUG: CV saved with id {cv_id}")
    return {"cv_id": cv_id, "message": "CV uploaded and parsed successfully"}


async def _calculate_weighted_match(cv_doc: dict, jobs: List[dict]):
    """Advanced weighted matching logic."""
    if not jobs:
        print("DEBUG: No jobs provided for matching")
        return []

    cv_text = cv_doc.get('text', '')
    cv_data = cv_doc.get('extracted_data', {})
    cv_skills = set(cv_data.get('skills', []))
    print(f"DEBUG: Matching against {len(jobs)} jobs. CV Skills: {cv_skills}")

    job_texts = [j.get('description', '') for j in jobs]
    tfidf_sims = compute_tfidf_similarity(cv_text, job_texts, max_features=5000)

    results = []
    for idx, job in enumerate(jobs):
        job_skills = set(job.get('skills', []) or extract_skills(job.get('description', '')))

        # 1. TF-IDF Score (40%)
        t_score = tfidf_sims[idx]

        # 2. Skill Overlap Score (50%)
        matched_skills = cv_skills.intersection(job_skills)
        missing_skills = job_skills - cv_skills
        s_score = len(matched_skills) / len(job_skills) if job_skills else 0.5

        # 3. Experience Match (10%)
        e_score = 1.0

        final_score = (t_score * 0.4) + (s_score * 0.5) + (e_score * 0.1)

        # FIX #4: include location, type, salary in results so frontend can display them
        results.append({
            "job_id": str(job.get('_id')),
            "title": job.get('title'),
            "company": job.get('company'),
            "url": job.get('url'),
            "location": job.get('location', 'Remote'),
            "type": job.get('type', 'Full-time'),
            "salary": job.get('salary'),
            "score": round(final_score, 4),
            "matched_skills": sorted(list(matched_skills)),
            "missing_skills": sorted(list(missing_skills)),
            "skill_gap": sorted(list(missing_skills))
        })

    results.sort(key=lambda x: x['score'], reverse=True)
    print(f"DEBUG: Matching complete. Top score: {results[0]['score'] if results else 0}")
    return results


@app.get("/cv/matches", response_model=List[MatchResult])
async def get_matches(top_k: int = 10, current_user: dict = Depends(get_current_user)):
    """Return top-k job matches for the current user's CV, or general jobs if no CV found."""
    print(f"DEBUG: Fetching matches for user {current_user['email']}")
    cv = await db.cvs.find_one({"user_id": current_user["_id"]})

    cursor = db.jobs.find().sort("created_at", -1).limit(200)
    jobs = await cursor.to_list(length=200)
    print(f"DEBUG: Found {len(jobs)} total jobs in DB to match against")

    if not cv:
        print("DEBUG: No CV found, returning general jobs list")
        results = []
        for j in jobs:
            results.append({
                "job_id": str(j.get('_id')),
                "title": j.get('title'),
                "company": j.get('company'),
                "url": j.get('url'),
                "location": j.get('location', 'Remote'),
                "type": j.get('type', 'Full-time'),
                "salary": j.get('salary'),
                "score": 0.0,
                "matched_skills": [],
                "missing_skills": j.get('skills', []),
                "skill_gap": j.get('skills', [])
            })
        return results[:top_k]

    matches = await _calculate_weighted_match(cv, jobs)
    return matches[:top_k]


@app.post("/cv/find_global_jobs")
async def find_global_jobs(limit_per_site: int = 20, current_user: dict = Depends(get_current_user)):
    """Fetch jobs from free APIs, upsert to DB, then return matches or general jobs."""
    print(f"DEBUG: find_global_jobs request for user {current_user['email']}")
    cv = await db.cvs.find_one({"user_id": current_user["_id"]})

    # Run job fetching in thread (uses free APIs, no scraping)
    fetched_jobs = await asyncio.to_thread(scraper.fetch_all_jobs, limit_per_site)
    print(f"DEBUG: Job fetcher returned {len(fetched_jobs)} jobs")

    inserted = 0
    for job in fetched_jobs:
        url = job.get('url')
        if not url:
            continue
        await db.jobs.update_one({'url': url}, {'$set': job}, upsert=True)
        inserted += 1

    print(f"DEBUG: Upserted {inserted} jobs into DB")

    cursor = db.jobs.find().sort("created_at", -1).limit(100)
    jobs = await cursor.to_list(length=100)

    if not cv:
        results = []
        for j in jobs:
            results.append({
                "job_id": str(j.get('_id')),
                "title": j.get('title'),
                "company": j.get('company'),
                "url": j.get('url'),
                "location": j.get('location', 'Remote'),
                "type": j.get('type', 'Full-time'),
                "salary": j.get('salary'),
                "score": 0.0,
                "matched_skills": [],
                "missing_skills": j.get('skills', []),
                "skill_gap": j.get('skills', [])
            })
        return {"matches": results[:20]}

    matches = await _calculate_weighted_match(cv, jobs)
    return {"matches": matches[:20]}


@app.get('/cv/skill_gap', response_model=SkillGapResponse)
async def cv_skill_gap(current_user: dict = Depends(get_current_user)):
    """Compute aggregated skill gap analysis."""
    cv = await db.cvs.find_one({"user_id": current_user["_id"]})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    cv_skills = cv.get('extracted_data', {}).get('skills', [])

    cursor = db.jobs.find().sort("created_at", -1).limit(50)
    jobs = await cursor.to_list(length=50)

    needed_counts = {}
    for j in jobs:
        jskills = j.get('skills', []) or extract_skills(j.get('description', ''))
        for s in jskills:
            needed_counts[s] = needed_counts.get(s, 0) + 1

    cv_skills_set = set(cv_skills)
    gap = []
    for skill, count in needed_counts.items():
        if skill not in cv_skills_set:
            priority = "High" if count > 15 else "Medium" if count > 5 else "Low"
            gap.append({"skill": skill, "priority": priority})

    # FIX #2: was using .index() which throws ValueError for unknown priorities
    gap.sort(key=lambda x: PRIORITY_ORDER.get(x["priority"], 3))

    recs = []
    for g in gap[:5]:
        recs.append({
            "title": f"Master {g['skill'].capitalize()} — Udemy",
            "url": f"https://www.udemy.com/courses/search/?q={g['skill']}"
        })

    return {
        "cv_skills": cv_skills,
        "aggregated_needed_skills": sorted(list(needed_counts.keys())),
        "skill_gap": gap[:10],
        "recommendations": recs
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)