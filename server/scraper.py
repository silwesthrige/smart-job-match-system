"""
Scrapers that fetch job postings (no DB writes). They return lists of job dicts with keys:
'title', 'company', 'url', 'description', 'created_at'.
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List

HEADERS = {"User-Agent": "Mozilla/5.0"}


def scrape_remoteok(limit: int = 50) -> List[dict]:
    url = 'https://remoteok.com/remote-dev-jobs'
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
                'created_at': datetime.utcnow()
            })
    return jobs


def scrape_weworkremotely(limit: int = 50) -> List[dict]:
    url = 'https://weworkremotely.com/categories/remote-programming-jobs'
    r = requests.get(url, headers=HEADERS, timeout=10)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    jobs = []
    # listings are often in section with class 'jobs'
    sections = soup.find_all('section', class_='jobs')
    for sec in sections:
        links = sec.find_all('a', href=True)
        for a in links:
            if len(jobs) >= limit:
                break
            href = a['href']
            # skip anchors that are not job detail links
            if not href.startswith('/remote-jobs') and '/remote-jobs' not in href:
                continue
            job_url = 'https://weworkremotely.com' + href
            # fetch job detail to get description
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
                        'created_at': datetime.utcnow()
                    })
            except Exception:
                continue
        if len(jobs) >= limit:
            break
    return jobs


def scrape_all(limit_per_site: int = 50) -> List[dict]:
    """Run all scrapers (synchronously) and return combined job dicts with extracted skills."""
    from .ml_utils import extract_skills
    results = []
    try:
        rj = scrape_remoteok(limit_per_site)
        for job in rj:
            job['skills'] = extract_skills(job.get('description', ''))
        results.extend(rj)
    except Exception:
        pass
    try:
        wj = scrape_weworkremotely(limit_per_site)
        for job in wj:
            job['skills'] = extract_skills(job.get('description', ''))
        results.extend(wj)
    except Exception:
        pass
    # deduplicate by url
    seen = set()
    unique = []
    for job in results:
        url = job.get('url')
        if not url:
            continue
        if url in seen:
            continue
        seen.add(url)
        unique.append(job)
    return unique
