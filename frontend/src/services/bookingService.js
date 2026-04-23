import { getToken } from "./authStorage";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/bookings`;

async function parseResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : data?.message || "Request failed");
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

/** USER: cancel a booking */
export async function cancelBooking(bookingId) {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/cancel`, {
    method: "PATCH",
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

/** ADMIN: update a booking's status */
export async function updateBookingStatus(bookingId, status) {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return parseResponse(response);
}
