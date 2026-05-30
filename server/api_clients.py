import requests
import os
from datetime import datetime
from typing import List, Optional

class JobAPIClient:
    def __init__(self):
        # Using provided key for JSearch
        self.jsearch_key = "df8a47bac0mshcb25413e04970c3p153fe3jsne76e8c1bad7c"
        self.jsearch_host = "jsearch.p.rapidapi.com"
        
        # Adzuna placeholders (user needs to provide these)
        self.adzuna_app_id = os.getenv("ADZUNA_APP_ID", "placeholder_id")
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY", "placeholder_key")

    def fetch_jsearch_jobs(self, query: str = "Python Developer", country: str = "us", page: int = 1) -> List[dict]:
        """Fetch jobs from JSearch API (RapidAPI)."""
        url = f"https://{self.jsearch_host}/search"
        querystring = {"query": f"{query} in {country}", "page": str(page), "num_pages": "1"}
        headers = {
            "X-RapidAPI-Key": self.jsearch_key,
            "X-RapidAPI-Host": self.jsearch_host
        }
        try:
            response = requests.get(url, headers=headers, params=querystring, timeout=10)
            response.raise_for_status()
            data = response.json()
            jobs = []
            for item in data.get("data", []):
                jobs.append({
                    "title": item.get("job_title"),
                    "company": item.get("employer_name"),
                    "url": item.get("job_apply_link"),
                    "description": item.get("job_description"),
                    "location": f"{item.get('job_city', '')}, {item.get('job_country', '')}",
                    "salary": f"{item.get('job_min_salary', '')} - {item.get('job_max_salary', '')}" if item.get('job_min_salary') else None,
                    "type": item.get("job_employment_type", "Full-time"),
                    "posted_at": item.get("job_posted_at_datetime_utc"),
                    "created_at": datetime.utcnow()
                })
            return jobs
        except Exception as e:
            print(f"JSearch API error: {e}")
            return []

    def fetch_adzuna_jobs(self, country: str = "gb", query: str = "Python", page: int = 1) -> List[dict]:
        """Fetch jobs from Adzuna API."""
        if self.adzuna_app_id == "placeholder_id":
            return []
            
        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
        params = {
            "app_id": self.adzuna_app_id,
            "app_key": self.adzuna_app_key,
            "what": query,
            "content-type": "application/json"
        }
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            jobs = []
            for item in data.get("results", []):
                jobs.append({
                    "title": item.get("title"),
                    "company": item.get("company", {}).get("display_name"),
                    "url": item.get("redirect_url"),
                    "description": item.get("description"),
                    "location": item.get("location", {}).get("display_name"),
                    "salary": f"{item.get('salary_min', '')} - {item.get('salary_max', '')}" if item.get('salary_min') else None,
                    "type": "Full-time",
                    "posted_at": item.get("created"),
                    "created_at": datetime.utcnow()
                })
            return jobs
        except Exception as e:
            print(f"Adzuna API error: {e}")
            return []
