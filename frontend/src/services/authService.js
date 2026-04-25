const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api"}/auth`;

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function googleLogin(idToken, role = "USER") {
  const response = await fetch(`${API_BASE_URL}/oauth/google`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ idToken, role }),
  });

  return parseResponse(response);
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return parseResponse(response);
}
