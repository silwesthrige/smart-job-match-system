import re
from typing import List

# Common IT skills vocabulary. Extend as needed.
SKILLS = [
    "python","java","javascript","typescript","react","angular","vue","node","express","django","flask","fastapi",
    "aws","azure","gcp","docker","kubernetes","k8s","sql","mysql","postgresql","mongodb","redis","kafka",
    "tensorflow","pytorch","scikit-learn","pandas","numpy","html","css","git","linux","ci/cd","jenkins","gitlab-ci",
    "terraform","ansible","bash","c#","c++","cpp","go","golang","rust","scala","spark","hadoop","graphql","rest","api",
    "microservices","jira","rabbitmq","selenium","pytest","unittest","machine learning","ml","deep learning","nlp","computer vision","cv"
]

# Precompile regex patterns for performance
SKILL_PATTERNS = [(s, re.compile(r"\\b" + re.escape(s) + r"\\b", re.IGNORECASE)) for s in SKILLS]


def extract_skills(text: str) -> List[str]:
    """Extract known skills from given text using keyword matching."""
    if not text:
        return []
    found = set()
    for skill, pat in SKILL_PATTERNS:
        if pat.search(text):
            found.add(skill.lower())
    # Additional heuristics: look for common 'experience with X' patterns
    # find words like 'React.js' -> normalize to 'react'
    # normalize keywords
    return sorted(found)


def compute_skill_gap(cv_skills: List[str], job_skills: List[str]) -> List[str]:
    cv_set = set([s.lower() for s in cv_skills])
    job_set = set([s.lower() for s in job_skills])
    gap = job_set - cv_set
    return sorted(gap)
