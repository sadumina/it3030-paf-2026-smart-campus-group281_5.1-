import { getToken } from "./authStorage";
import { API_BASE_URL } from "./apiConfig";

const RESOURCES_BASE_URL = `${API_BASE_URL}/resources`;

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch resources");
  }

  return data;
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getReadHeaders() {
  return {};
}

export async function fetchResources(filters = {}) {
  const params = new URLSearchParams();

  if (filters.type && filters.type !== "ALL") {
    params.set("type", filters.type);
  }

  if (filters.minCapacity !== "" && filters.minCapacity !== null && filters.minCapacity !== undefined) {
    params.set("minCapacity", filters.minCapacity);
  }

  if (filters.location?.trim()) {
    params.set("location", filters.location.trim());
  }

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  const requestUrl = params.toString() ? `${RESOURCES_BASE_URL}?${params.toString()}` : RESOURCES_BASE_URL;

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: getReadHeaders(),
  });

  const data = await parseResponse(response);
  return Array.isArray(data) ? data : [];
}

export async function fetchResourceById(resourceId) {
  if (!resourceId) {
    throw new Error("Resource id is required");
  }

  const response = await fetch(`${RESOURCES_BASE_URL}/${resourceId}`, {
    method: "GET",
    headers: getReadHeaders(),
  });

  const data = await parseResponse(response);
  return data && typeof data === "object" ? data : null;
}

export async function updateResourceStatus(resourceId, status) {
  if (!resourceId) {
    throw new Error("Resource id is required");
  }

  const response = await fetch(`${RESOURCES_BASE_URL}/${resourceId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await parseResponse(response);
  return data && typeof data === "object" ? data : null;
}

export async function changeResourceStatus(resourceId, status, reason = "") {
  if (!resourceId) {
    throw new Error("Resource id is required");
  }

  const body = { status };
  if (reason && reason.trim()) {
    body.reason = reason.trim();
  }

  const response = await fetch(`${RESOURCES_BASE_URL}/${resourceId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  const data = await parseResponse(response);
  return data && typeof data === "object" ? data : null;
}

export async function updateResource(resourceId, payload) {
  if (!resourceId) {
    throw new Error("Resource id is required");
  }

  const response = await fetch(`${RESOURCES_BASE_URL}/${resourceId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload || {}),
  });

  const data = await parseResponse(response);
  return data && typeof data === "object" ? data : null;
}

export async function deleteResource(resourceId) {
  if (!resourceId) {
    throw new Error("Resource id is required");
  }

  const response = await fetch(`${RESOURCES_BASE_URL}/${resourceId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Unable to delete resource");
  }

  return true;
}

export async function fetchResourceBookingContext(resourceId) {
  if (!resourceId) {
    throw new Error("Resource id is required");
  }

  const response = await fetch(`${RESOURCES_BASE_URL}/${resourceId}/booking-context`, {
    method: "GET",
    headers: getReadHeaders(),
  });

  const data = await parseResponse(response);
  return data && typeof data === "object" ? data : null;
}

export async function createResource(payload) {
  const response = await fetch(RESOURCES_BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload || {}),
  });

  const data = await parseResponse(response);
  return data && typeof data === "object" ? data : null;
}
