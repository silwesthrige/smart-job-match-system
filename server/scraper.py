"""
Job fetchers — JSearch (RapidAPI) + Himalayas + USAJobs
"""

import os
import re
import requests
from datetime import datetime
from typing import List
from ml_utils import extract_skills

RAPIDAPI_KEY = "df8a47bac0mshcb25413e04970c3p153fe3jsne76e8c1bad7c"
TIMEOUT = 15
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

JSEARCH_QUERIES = [
    "software engineer",
    "frontend developer",
    "backend developer",
    "full stack developer",
    "react developer",
    "python developer",
    "data engineer",
    "devops engineer",
]


# ── 1. JSearch via RapidAPI ───────────────────────────────────────────────────

def fetch_jsearch(query: str = "software engineer", limit: int = 10) -> List[dict]:
    try:
        r = requests.get(
            "https://jsearch.p.rapidapi.com/search",
            headers={
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
            params={
                "query": query,
                "num_pages": "1",
                "page": "1",
                "date_posted": "month",
            },
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        jobs = []
        for item in data.get("data", [])[:limit]:
            desc = item.get("job_description", "")
            jobs.append({
                "title": item.get("job_title"),
                "company": item.get("employer_name"),
                "url": item.get("job_apply_link") or item.get("job_google_link"),
                "description": desc,
                "location": _build_location(item),
                "type": _map_type(item.get("job_employment_type", "")),
                "salary": _format_salary(
                    item.get("job_min_salary"),
                    item.get("job_max_salary"),
                    item.get("job_salary_currency", "USD"),
                    item.get("job_salary_period", ""),
                ),
                "skills": extract_skills(desc),
                "created_at": datetime.utcnow(),
            })
        print(f"DEBUG: JSearch '{query}' → {len(jobs)} jobs")
        return jobs
    except Exception as e:
        print(f"DEBUG: JSearch failed for '{query}': {e}")
        return []


# ── 2. Himalayas (no key needed) ──────────────────────────────────────────────

def fetch_himalayas(limit: int = 20) -> List[dict]:
    try:
        r = requests.get(
            "https://himalayas.app/jobs/api",
            params={"limit": min(limit, 20)},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        jobs = []
        for item in data.get("jobs", [])[:limit]:
            desc = _strip_html(item.get("description", ""))
            company = item.get("company", {})
            jobs.append({
                "title": item.get("title"),
                "company": company.get("name") if isinstance(company, dict) else str(company),
                "url": item.get("applicationLink") or item.get("url"),
                "description": desc,
                "location": item.get("locationRestrictions") or "Remote (Worldwide)",
                "type": _map_type(item.get("jobType", "")),
                "salary": item.get("salaryRange"),
                "skills": item.get("categories", []) or extract_skills(desc),
                "created_at": datetime.utcnow(),
            })
        print(f"DEBUG: Himalayas → {len(jobs)} jobs")
        return jobs
    except Exception as e:
        print(f"DEBUG: Himalayas failed: {e}")
        return []


# ── 3. USA Jobs (no key needed) ───────────────────────────────────────────────

def fetch_usajobs(query: str = "software engineer", limit: int = 15) -> List[dict]:
    try:
        r = requests.get(
            "https://data.usajobs.gov/api/search",
            params={
                "Keyword": query,
                "ResultsPerPage": limit,
                "JobCategoryCode": "2210",
            },
            headers={
                "Host": "data.usajobs.gov",
                "User-Agent": "smartmatch-app@example.com",
                "Authorization-Key": "",
            },
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        jobs = []
        items = data.get("SearchResult", {}).get("SearchResultItems", [])
        for item in items[:limit]:
            m = item.get("MatchedObjectDescriptor", {})
            loc_list = m.get("PositionLocation", [{}])
            loc = loc_list[0].get("LocationName", "United States") if loc_list else "United States"
            desc = m.get("UserArea", {}).get("Details", {}).get("JobSummary", "")
            salary_range = m.get("PositionRemuneration", [{}])
            salary = None
            if salary_range:
                mn = salary_range[0].get("MinimumRange")
                mx = salary_range[0].get("MaximumRange")
                if mn and mx:
                    salary = f"${float(mn):,.0f} – ${float(mx):,.0f}/yr"
            jobs.append({
                "title": m.get("PositionTitle"),
                "company": m.get("OrganizationName", "US Government"),
                "url": m.get("PositionURI", "#"),
                "description": desc,
                "location": loc,
                "type": "Full-time",
                "salary": salary,
                "skills": extract_skills(desc),
                "created_at": datetime.utcnow(),
            })
        print(f"DEBUG: USAJobs → {len(jobs)} jobs")
        return jobs
    except Exception as e:
        print(f"DEBUG: USAJobs failed: {e}")
        return []


# ── Orchestrator ──────────────────────────────────────────────────────────────

def fetch_all_jobs(limit_per_source: int = 20) -> List[dict]:
    print(f"DEBUG: Starting job fetch (limit_per_source={limit_per_source})")
    all_jobs: List[dict] = []

    # JSearch — run multiple queries for broad coverage
    for q in JSEARCH_QUERIES:
        all_jobs.extend(fetch_jsearch(query=q, limit=8))

    # Himalayas — remote jobs worldwide
    all_jobs.extend(fetch_himalayas(limit=20))

    # USAJobs — US government tech jobs
    all_jobs.extend(fetch_usajobs(query="software engineer", limit=15))
    all_jobs.extend(fetch_usajobs(query="data analyst", limit=10))

    # Deduplicate by URL
    seen: set = set()
    unique = []
    for job in all_jobs:
        url = job.get("url")
        if not url or url in seen or not job.get("title"):
            continue
        seen.add(url)
        if not job.get("skills"):
            job["skills"] = extract_skills(job.get("description", ""))
        unique.append(job)

    print(f"DEBUG: Total unique jobs fetched: {len(unique)}")
    return unique


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_html(html: str) -> str:
    if not html:
        return ""
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html)).strip()


def _build_location(item: dict) -> str:
    if item.get("job_is_remote"):
        return "Remote"
    parts = [p for p in [
        item.get("job_city", ""),
        item.get("job_state", ""),
        item.get("job_country", ""),
    ] if p]
    return ", ".join(parts) if parts else "Global"


def _map_type(raw: str) -> str:
    mapping = {
        "FULLTIME": "Full-time", "FULL_TIME": "Full-time",
        "PARTTIME": "Part-time", "PART_TIME": "Part-time",
        "CONTRACTOR": "Contract", "CONTRACT": "Contract",
        "INTERN": "Internship", "TEMPORARY": "Contract",
    }
    return mapping.get((raw or "").upper(), "Full-time")


def _format_salary(min_s, max_s, currency: str = "USD", period: str = ""):
    if not min_s and not max_s:
        return None
    sym = {"USD": "$", "GBP": "£", "EUR": "€", "AUD": "A$", "CAD": "C$"}.get(currency, currency + " ")
    label = {"YEAR": "/yr", "MONTH": "/mo", "HOUR": "/hr"}.get((period or "").upper(), "")
    if min_s and max_s:
        return f"{sym}{int(min_s):,} – {sym}{int(max_s):,}{label}"
    return f"{sym}{int(min_s or max_s):,}{label}"


# Alias for backward compatibility
def scrape_all(limit_per_site: int = 20) -> List[dict]:
    return fetch_all_jobs(limit_per_site)