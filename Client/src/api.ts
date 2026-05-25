const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function uploadCV(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/cv/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json(); // { cv_id: '...' }
}

export async function findGlobalJobs(cvId: string, top_k = 10, limit_per_site = 50) {
  const res = await fetch(`${API_BASE}/cv/${cvId}/find_global_jobs?top_k=${top_k}&limit_per_site=${limit_per_site}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Find jobs failed: ${res.status}`);
  return res.json();
}

export async function getSkillGap(cvId: string, top_k = 10) {
  const res = await fetch(`${API_BASE}/cv/${cvId}/skill_gap?top_k=${top_k}`);
  if (!res.ok) throw new Error(`Skill gap failed: ${res.status}`);
  return res.json();
}
