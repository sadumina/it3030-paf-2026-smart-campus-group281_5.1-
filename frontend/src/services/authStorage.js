const AUTH_KEY = "campusAuth";
const LEGACY_TOKEN_KEY = "authToken";

export function saveAuth(authResponse) {
  if (!authResponse) {
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(authResponse));

  // Keep legacy key in sync for older API consumers.
  if (authResponse.token) {
    localStorage.setItem(LEGACY_TOKEN_KEY, authResponse.token);
  }
}

export function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getToken() {
  return getAuth()?.token || localStorage.getItem(LEGACY_TOKEN_KEY) || "";
}

export function getRole() {
  return getAuth()?.role || "";
}

export function isAuthenticated() {
  return Boolean(getToken());
}
