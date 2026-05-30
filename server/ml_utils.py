import re
from typing import List, Dict, Set
from models import CVData

# Skill synonyms map for normalization
SKILL_SYNONYMS = {
    "react.js": "react",
    "reactjs": "react",
    "node.js": "node",
    "nodejs": "node",
    "express.js": "express",
    "vue.js": "vue",
    "vuejs": "vue",
    "golang": "go",
    "c#": "csharp",
    ".net": "dotnet",
    "postgres": "postgresql",
    "k8s": "kubernetes"
}

# Comprehensive skills vocabulary
SKILLS_LIST = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue", "node", "express", "django", "flask", "fastapi",
    "aws", "azure", "gcp", "docker", "kubernetes", "sql", "mysql", "postgresql", "mongodb", "redis", "kafka",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "html", "css", "git", "linux", "ci/cd", "jenkins", "gitlab-ci",
    "terraform", "ansible", "bash", "c#", "c++", "cpp", "go", "rust", "scala", "spark", "hadoop", "graphql", "rest", "api",
    "microservices", "jira", "rabbitmq", "selenium", "pytest", "unittest", "machine learning", "ml", "deep learning", "nlp", "computer vision", "cv"
]

# Precompile regex patterns for performance - improved to handle special characters
SKILL_PATTERNS = [(s, re.compile(r"(?<!\w)" + re.escape(s) + r"(?!\w)", re.IGNORECASE)) for s in SKILLS_LIST]

def normalize_skill(skill: str) -> str:
    skill = skill.lower().strip()
    return SKILL_SYNONYMS.get(skill, skill)

def extract_skills(text: str) -> List[str]:
    """Extract known skills from given text using keyword matching and normalization."""
    if not text:
        return []
    found = set()
    for skill, pat in SKILL_PATTERNS:
        if pat.search(text):
            found.add(normalize_skill(skill))
    
    # Check for synonyms explicitly in text
    for syn, canonical in SKILL_SYNONYMS.items():
        if re.search(r"(?<!\w)" + re.escape(syn) + r"(?!\w)", text, re.IGNORECASE):
            found.add(canonical)
            
    return sorted(list(found))

def extract_experience(text: str) -> List[str]:
    """Extract experience-related sentences or fragments."""
    # Simple regex to find blocks related to experience
    patterns = [
        r"(?:experience|work|employment|history|professional)[\s\w\d]{0,100}(?:\n|:)",
        r"(?:20\d{2}|19\d{2})\s?[-–]\s?(?:present|20\d{2}|current)"
    ]
    # For now, return a list of lines that look like experience
    lines = text.split('\n')
    exp_lines = []
    for line in lines:
        if any(keyword in line.lower() for keyword in ["engineer", "developer", "manager", "analyst", "lead", "senior", "junior"]):
            if any(re.search(p, line, re.IGNORECASE) for p in patterns) or re.search(r"\d+\s?years?", line, re.IGNORECASE):
                exp_lines.append(line.strip())
    return exp_lines[:10] # limit to top 10 fragments

def extract_years_of_experience(text: str) -> float:
    """Estimate total years of experience from text."""
    matches = re.findall(r"(\d+)\+?\s*years?\s+(?:of\s+)?experience", text, re.IGNORECASE)
    if matches:
        return float(max(map(int, matches)))
    return 0.0

def extract_education(text: str) -> List[str]:
    """Extract education-related keywords and degree levels."""
    found = []
    for kw in EDUCATION_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", text, re.IGNORECASE):
            # Try to capture the context
            pattern = r"([^.\n]*\b" + re.escape(kw) + r"\b[^.\n]*)"
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                found.append(match.group(1).strip())
    return sorted(list(set(found)))[:5]

def extract_certifications(text: str) -> List[str]:
    """Extract certification-related keywords."""
    found = []
    for kw in CERTIFICATION_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", text, re.IGNORECASE):
            pattern = r"([^.\n]*\b" + re.escape(kw) + r"\b[^.\n]*)"
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                found.append(match.group(1).strip())
    return sorted(list(set(found)))[:5]

def parse_cv_text(text: str) -> CVData:
    """Full parsing of CV text into CVData model."""
    return CVData(
        skills=extract_skills(text),
        experience=extract_experience(text),
        education=extract_education(text),
        certifications=extract_certifications(text),
        years_of_experience=extract_years_of_experience(text)
    )

def compute_skill_gap(cv_skills: List[str], job_skills: List[str]) -> List[str]:
    cv_set = set([normalize_skill(s) for s in cv_skills])
    job_set = set([normalize_skill(s) for s in job_skills])
    gap = job_set - cv_set
    return sorted(list(gap))
