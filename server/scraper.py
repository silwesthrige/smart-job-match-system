"""
Scrapers and API clients that fetch job postings.
Returns lists of job dicts with keys matching the Job model.
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List
from api_clients import JobAPIClient
from ml_utils import extract_skills

HEADERS = {"User-Agent": "Mozilla/5.0"}

def scrape_remoteok(limit: int = 20) -> List[dict]:
    url = 'https://remoteok.com/remote-dev-jobs'
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        jobs = []
        rows = soup.find_all('tr', class_='job')
        for row in rows[:limit]:
            title_el = row.find('h2', itemprop='title')
            company_el = row.find('h3', itemprop='name')
            link_el = row.find('a', class_='preventLink')
            desc_el = row.find('div', class_='description')
            title = title_el.get_text(strip=True) if title_el else None
            company = company_el.get_text(strip=True) if company_el else None
            url = 'https://remoteok.com' + link_el['href'] if link_el and link_el.get('href') else None
            description = desc_el.get_text(separator=' ', strip=True) if desc_el else ''
            if title and description:
                jobs.append({
                    'title': title,
                    'company': company,
                    'url': url,
                    'description': description,
                    'location': 'Remote',
                    'type': 'Full-time',
                    'created_at': datetime.utcnow()
                })
        return jobs
    except Exception:
        return []

def scrape_weworkremotely(limit: int = 20) -> List[dict]:
    url = 'https://weworkremotely.com/categories/remote-programming-jobs'
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        jobs = []
        sections = soup.find_all('section', class_='jobs')
        for sec in sections:
            links = sec.find_all('a', href=True)
            for a in links:
                if len(jobs) >= limit: break
                href = a['href']
                if not href.startswith('/remote-jobs'): continue
                job_url = 'https://weworkremotely.com' + href
                try:
                    jr = requests.get(job_url, headers=HEADERS, timeout=8)
                    jr.raise_for_status()
                    jsoup = BeautifulSoup(jr.text, 'html.parser')
                    title_el = jsoup.find('h1')
                    company_el = jsoup.find('div', class_='company')
                    desc_el = jsoup.find('div', class_='listing-container') or jsoup.find('div', class_='listing-body')
                    title = title_el.get_text(strip=True) if title_el else None
                    company = company_el.get_text(strip=True) if company_el else None
                    description = desc_el.get_text(separator=' ', strip=True) if desc_el else ''
                    if title and description:
                        jobs.append({
                            'title': title,
                            'company': company,
                            'url': job_url,
                            'description': description,
                            'location': 'Remote',
                            'type': 'Full-time',
                            'created_at': datetime.utcnow()
                        })
                except Exception: continue
        return jobs
    except Exception:
        return []

def scrape_all(limit_per_site: int = 20) -> List[dict]:
    """Run all scrapers and API clients and return combined job dicts."""
    client = JobAPIClient()
    results = []
    
    # 1. Scraping
    results.extend(scrape_remoteok(limit_per_site))
    results.extend(scrape_weworkremotely(limit_per_site))
    
    # 2. APIs
    results.extend(client.fetch_jsearch_jobs(query="Software Engineer", country="us"))
    results.extend(client.fetch_adzuna_jobs(country="us", query="Software Engineer"))
    
    # Extract skills for all results and deduplicate by URL
    seen = set()
    unique = []
    for job in results:
        url = job.get('url')
        if not url or url in seen: continue
        seen.add(url)
        
        # Enrich with skills if missing
        if not job.get('skills'):
            job['skills'] = extract_skills(job.get('description', ''))
            
        unique.append(job)
        
    return unique
