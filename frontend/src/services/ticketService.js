const API_BASE = "http://localhost:8080/api/tickets";

function authHeader() {
  const raw = localStorage.getItem("campusAuth");
  const token = raw ? JSON.parse(raw)?.token : "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function authHeaderMultipart() {
  const raw = localStorage.getItem("campusAuth");
  const token = raw ? JSON.parse(raw)?.token : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// ─── Tickets ─────────────────────────────────────────────────────────
export async function fetchTickets(params = {}) {
  const query = new URLSearchParams();
  if (params.status   && params.status   !== "ALL") query.set("status",   params.status);
  if (params.priority && params.priority !== "ALL") query.set("priority", params.priority);
  if (params.category && params.category !== "ALL") query.set("category", params.category);
  const qs = query.toString();
  const res = await fetch(`${API_BASE}${qs ? `?${qs}` : ""}`, { headers: authHeader() });
  return handleResponse(res);
}

export async function fetchTicketById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeader() });
  return handleResponse(res);
}

export async function createTicket(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateTicketStatus(id, payload) {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function assignTechnician(id, technicianId) {
  const res = await fetch(`${API_BASE}/${id}/assign`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify({ technicianId }),
  });
  return handleResponse(res);
}

export async function deleteTicket(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (res.status === 204) return true;
  return handleResponse(res);
}

export async function searchTickets(q) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`, { headers: authHeader() });
  return handleResponse(res);
}

export async function fetchTechnicians() {
  const res = await fetch(`${API_BASE}/technicians`, { headers: authHeader() });
  return handleResponse(res);
}

// ─── Image Upload / Delete ─────────────────────────────────────────────
export async function deleteTicketImage(ticketId, filename) {
  const res = await fetch(`${API_BASE}/${ticketId}/images/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function uploadTicketImages(ticketId, files) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${API_BASE}/${ticketId}/upload`, {
    method: "POST",
    headers: authHeaderMultipart(),
    body: formData,
  });
  return handleResponse(res);
}

// ─── Comments ──────────────────────────────────────────────────────────
export async function fetchComments(ticketId) {
  const res = await fetch(`${API_BASE}/${ticketId}/comments`, {
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function addComment(ticketId, content) {
  const res = await fetch(`${API_BASE}/${ticketId}/comments`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}

export async function editComment(ticketId, commentId, content) {
  const res = await fetch(`${API_BASE}/${ticketId}/comments/${commentId}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}

export async function deleteComment(ticketId, commentId) {
  const res = await fetch(`${API_BASE}/${ticketId}/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (res.status === 204) return true;
  return handleResponse(res);
}
