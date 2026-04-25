import { getToken } from "./authStorage";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/bookings`;
const RESOURCES_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/resources`;
const ENABLE_DELETED_BOOKINGS_ENDPOINT =
  import.meta.env.VITE_ENABLE_DELETED_BOOKINGS_ENDPOINT === "true";

async function parseResponse(response) {
  const raw = await response.text();
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "string" ? data : data?.message || "Request failed",
    );
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

/** USER: submit a new booking */
export async function createBooking(payload) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

/** USER: list own bookings */
export async function fetchMyBookings() {
  const response = await fetch(`${API_BASE_URL}/my`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await parseResponse(response);
  return Array.isArray(data) ? data : [];
}

export const getMyBookings = fetchMyBookings;

/** USER: update own pending booking details */
export async function updatePendingBooking(bookingId, payload) {
  const response = await fetch(`${API_BASE_URL}/${bookingId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

/** USER: cancel a booking */
export async function cancelBooking(bookingId) {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/cancel`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
}

/** USER: delete booking permanently via REST API */
export async function deleteBooking(bookingId) {
  const response = await fetch(`${API_BASE_URL}/${bookingId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
}

/** ADMIN: list all bookings */
export async function fetchAllBookings() {
  const response = await fetch(API_BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await parseResponse(response);
  return Array.isArray(data) ? data : [];
}

export const getAllBookings = fetchAllBookings;

/** RESOURCE: list resources (axios-like response shape for legacy callers) */
export async function getResources() {
  const response = await fetch(RESOURCES_API_BASE_URL, {
    method: "GET",
    headers: {},
  });
  const data = await parseResponse(response);
  return { data: Array.isArray(data) ? data : [] };
}

/** RESOURCE: capacity lookup (axios-like response shape for legacy callers) */
export async function getResourceCapacity(resourceId, _startTime, _endTime) {
  if (!resourceId) {
    throw new Error("Resource id is required");
  }

  const response = await fetch(
    `${RESOURCES_API_BASE_URL}/${resourceId}/booking-context`,
    {
      method: "GET",
      headers: {},
    },
  );

  const resource = await parseResponse(response);
  const numericCapacity = Number(resource?.capacity);
  const hasCapacity = Number.isFinite(numericCapacity) && numericCapacity > 0;

  return {
    data: {
      available: hasCapacity ? numericCapacity : Number.MAX_SAFE_INTEGER,
      unlimited: !hasCapacity,
    },
  };
}

/** ADMIN: list soft-deleted bookings (optional endpoint) */
export async function getDeletedBookings() {
  if (!ENABLE_DELETED_BOOKINGS_ENDPOINT) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/deleted`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  // Keep UI stable if backend doesn't expose deleted bookings yet.
  if (response.status === 404) {
    return [];
  }

  const data = await parseResponse(response);
  return Array.isArray(data) ? data : [];
}

/** ADMIN: update a booking's status */
export async function updateBookingStatus(bookingId, status, reason = "") {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  return parseResponse(response);
}

export function approveBooking(bookingId) {
  return updateBookingStatus(bookingId, "APPROVED");
}

export function rejectBooking(bookingId, reason) {
  return updateBookingStatus(bookingId, "REJECTED", reason);
}
