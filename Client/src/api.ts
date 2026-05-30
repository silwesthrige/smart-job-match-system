const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getHeaders() {
  const token = localStorage.getItem("token");
  const headers: any = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function uploadCV(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/cv/upload`, {
    method: "POST",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function getMatches(top_k = 10) {
  const res = await fetch(`${API_BASE}/cv/matches?top_k=${top_k}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Matches fetch failed: ${res.status}`);
  return res.json();
}

export async function findGlobalJobs(limit_per_site = 20) {
  const res = await fetch(`${API_BASE}/cv/find_global_jobs?limit_per_site=${limit_per_site}`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Find jobs failed: ${res.status}`);
  return res.json();
}

export async function getSkillGap() {
  const res = await fetch(`${API_BASE}/cv/skill_gap`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Skill gap failed: ${res.status}`);
  return res.json();
}

export async function signup(data: any) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Signup failed");
  }
  return res.json();
}

export async function login(data: any) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }
  return res.json();
}
