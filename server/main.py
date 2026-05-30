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

# Allow CORS from local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/cv/upload")
async def upload_cv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload a CV (PDF or text). Extracts text and stores in MongoDB."""
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
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {e}")

    if not text or text.strip() == '':
        raise HTTPException(status_code=400, detail="No text extracted from CV")

    extracted_data = parse_cv_text(text)

    doc = {
        "user_id": current_user["_id"],
        "filename": file.filename,
        "text": text,
        "extracted_data": extracted_data.dict(),
        "created_at": datetime.utcnow()
    }
    # Update existing CV or insert new one for the user
    result = await db.cvs.update_one(
        {"user_id": current_user["_id"]},
        {"$set": doc},
        upset=True
    )
    
    cv_id = str(result.upserted_id) if result.upserted_id else None
    if not cv_id:
        existing = await db.cvs.find_one({"user_id": current_user["_id"]})
        cv_id = str(existing["_id"])
        
    return {"cv_id": cv_id, "message": "CV uploaded and parsed successfully"}

async def _calculate_weighted_match(cv_doc: dict, jobs: List[dict]):
    """Advanced weighted matching logic."""
    if not jobs:
        return []

    cv_text = cv_doc.get('text', '')
    cv_data = cv_doc.get('extracted_data', {})
    cv_skills = set(cv_data.get('skills', []))
    cv_years = cv_data.get('years_of_experience', 0.0)

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
        
        # 3. Experience Match (10%) - very basic heuristic
        # If job has 'years' in description, try to compare
        e_score = 1.0 # default
        
        final_score = (t_score * 0.4) + (s_score * 0.5) + (e_score * 0.1)
        
        results.append({
            "job_id": str(job.get('_id')),
            "title": job.get('title'),
            "company": job.get('company'),
            "url": job.get('url'),
            "score": round(final_score, 4),
            "matched_skills": sorted(list(matched_skills)),
            "missing_skills": sorted(list(missing_skills)),
            "skill_gap": sorted(list(missing_skills))
        })
    
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    return results

@app.get("/cv/matches", response_model=List[MatchResult])
async def get_matches(top_k: int = 10, current_user: dict = Depends(get_current_user)):
    """Return top-k job matches for the current user's CV."""
    cv = await db.cvs.find_one({"user_id": current_user["_id"]})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found. Please upload a CV first.")

    # Fetch some jobs to match against (e.g., last 200)
    cursor = db.jobs.find().sort("created_at", -1).limit(200)
    jobs = await cursor.to_list(length=200)
    
    matches = await _calculate_weighted_match(cv, jobs)
    return matches[:top_k]

@app.post("/cv/find_global_jobs")
async def find_global_jobs(limit_per_site: int = 20, current_user: dict = Depends(get_current_user)):
    """Scrape and fetch global jobs, then return matches."""
    cv = await db.cvs.find_one({"user_id": current_user["_id"]})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found. Please upload a CV first.")

    # Run scrapers
    scraped_jobs = await asyncio.to_thread(scraper.scrape_all, limit_per_site)

    # Upsert jobs
    for job in scraped_jobs:
        url = job.get('url')
        if not url: continue
        await db.jobs.update_one({'url': url}, {'$set': job}, upsert=True)

    # Re-fetch recent jobs to match
    cursor = db.jobs.find().sort("created_at", -1).limit(100)
    jobs = await cursor.to_list(length=100)
    
    matches = await _calculate_weighted_match(cv, jobs)
    return {"matches": matches[:10]}

@app.get('/cv/skill_gap', response_model=SkillGapResponse)
async def cv_skill_gap(current_user: dict = Depends(get_current_user)):
    """Compute aggregated skill gap analysis."""
    cv = await db.cvs.find_one({"user_id": current_user["_id"]})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    cv_skills = cv.get('extracted_data', {}).get('skills', [])
    
    # Fetch recent jobs to aggregate needed skills
    cursor = db.jobs.find().sort("created_at", -1).limit(50)
    jobs = await cursor.to_list(length=50)
    
    needed_counts = {}
    for j in jobs:
        jskills = j.get('skills', []) or extract_skills(j.get('description', ''))
        for s in jskills:
            needed_counts[s] = needed_counts.get(s, 0) + 1
            
    # Gap = skills in jobs but not in CV
    cv_skills_set = set(cv_skills)
    gap = []
    for skill, count in needed_counts.items():
        if skill not in cv_skills_set:
            priority = "High" if count > 15 else "Medium" if count > 5 else "Low"
            gap.append({"skill": skill, "priority": priority})
            
    gap.sort(key=lambda x: ("High", "Medium", "Low").index(x["priority"]))
    
    # Recommendations (mock URLs for now)
    recs = []
    for g in gap[:5]:
        recs.append({
            "title": f"Master {g['skill'].capitalize()} on Udemy",
            "url": f"https://www.udemy.com/results/?q={g['skill']}"
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
