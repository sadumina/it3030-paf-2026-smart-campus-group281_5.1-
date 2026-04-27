const LOCAL_API_ROOT = "http://localhost:8080";
const RAILWAY_API_ROOT =
  "https://it3030-paf-2026-smart-campus-group28151-production.up.railway.app";

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function resolveApiRoot() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    const trimmedBase = trimTrailingSlash(configuredBaseUrl);
    return trimmedBase.endsWith("/api")
      ? trimmedBase.slice(0, -4)
      : trimmedBase;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return LOCAL_API_ROOT;
    }
  }

  return RAILWAY_API_ROOT;
}

export const API_ROOT = resolveApiRoot();
export const API_BASE_URL = `${API_ROOT}/api`;

export function buildAssetUrl(path = "") {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`;
}
