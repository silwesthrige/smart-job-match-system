// Use env var if available, otherwise default to local backend
const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_BASE =
  VITE_API_URL && VITE_API_URL.trim() !== ""
    ? VITE_API_URL
    : "http://localhost:8000";

console.log(`[SmartMatch] Using API Base: ${API_BASE}`);

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    throw new Error("Unauthorized: Please log in again.");
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: `Error: ${res.status}` }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signup(data: { name: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await handleResponse(res);
  // Persist token immediately so subsequent calls work
  if (json.access_token) {
    localStorage.setItem("token", json.access_token);
  }
  return json;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("last_matches");
  localStorage.removeItem("cv_id");
}

// ── CV ────────────────────────────────────────────────────────────────────────

export async function uploadCV(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/cv/upload`, {
    method: "POST",
    // Do NOT set Content-Type here — browser sets it with boundary for multipart
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  return handleResponse(res);
}

/**
 * Returns the CV object, or null if none exists.
 * The backend now raises 404 properly; we catch it here.
 */
export async function getCV() {
  const res = await fetch(`${API_BASE}/cv`, {
    headers: getHeaders(),
  });
  // 404 = no CV yet, not an error
  if (res.status === 404) return null;
  return handleResponse(res);
}

/**
 * Delete the current user's CV from the backend.
 */
export async function deleteCV() {
  const res = await fetch(`${API_BASE}/cv`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (res.status === 404) return null; // already gone
  return handleResponse(res);
}

// ── Job Matching ──────────────────────────────────────────────────────────────

export async function getMatches(top_k = 10) {
  const res = await fetch(`${API_BASE}/cv/matches?top_k=${top_k}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

/**
 * Triggers a fresh job fetch from free APIs and returns matches.
 * Call this when the user uploads a new CV or refreshes manually.
 */
export async function findGlobalJobs(limit_per_site = 20) {
  const res = await fetch(
    `${API_BASE}/cv/find_global_jobs?limit_per_site=${limit_per_site}`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );
  return handleResponse(res);
}

export async function getSkillGap() {
  const res = await fetch(`${API_BASE}/cv/skill_gap`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}