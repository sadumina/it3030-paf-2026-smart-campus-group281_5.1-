const AUTH_KEY = "campusAuth";

export function saveAuth(authResponse) {
  if (!authResponse) {
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(authResponse));
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
}

export function getToken() {
  return getAuth()?.token || "";
}

export function getRole() {
  return getAuth()?.role || "";
}

export function isAuthenticated() {
  return Boolean(getToken());
}
