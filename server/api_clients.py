import requests
import os
from datetime import datetime
from typing import List, Optional

class JobAPIClient:
    def __init__(self):
        # Using provided key for RapidAPI (JSearch)
        self.rapidapi_key = "df8a47bac0mshcb25413e04970c3p153fe3jsne76e8c1bad7c"
        self.jsearch_host = "jsearch.p.rapidapi.com"

    def fetch_jsearch_jobs(self, query: str = "Software Engineer", country: str = "us", page: int = 1) -> List[dict]:
        """Fetch jobs from JSearch API (via RapidAPI)."""
        url = f"https://{self.jsearch_host}/search"
        # Combine query with country for better results
        search_query = f"{query} jobs in {country}"
        querystring = {"query": search_query, "page": str(page), "num_pages": "1"}
        
        headers = {
            "X-RapidAPI-Key": self.rapidapi_key,
            "X-RapidAPI-Host": self.jsearch_host
        }
        
        try:
            print(f"DEBUG: Calling JSearch API with query: {search_query}")
            response = requests.get(url, headers=headers, params=querystring, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            jobs = []
            for item in data.get("data", []):
                # Ensure we have a description for skill extraction
                desc = item.get("job_description") or ""
                
                jobs.append({
                    "title": item.get("job_title"),
                    "company": item.get("employer_name"),
                    "url": item.get("job_apply_link"),
                    "description": desc,
                    "location": f"{item.get('job_city', '')}, {item.get('job_country', '')}",
                    "salary": f"{item.get('job_min_salary', '')} - {item.get('job_max_salary', '')}" if item.get('job_min_salary') else None,
                    "type": item.get("job_employment_type", "Full-time"),
                    "posted_at": item.get("job_posted_at_datetime_utc"),
                    "created_at": datetime.utcnow()
                })
            print(f"DEBUG: JSearch returned {len(jobs)} jobs")
            return jobs
        except Exception as e:
            print(f"DEBUG: JSearch API error: {e}")
            return []
