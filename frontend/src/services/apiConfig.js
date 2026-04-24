const DEFAULT_BACKEND_URL = "http://localhost:8080";
const DEFAULT_API_BASE_URL = `${DEFAULT_BACKEND_URL}/api`;

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
