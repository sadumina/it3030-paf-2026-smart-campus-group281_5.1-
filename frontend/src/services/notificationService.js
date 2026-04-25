import { getToken } from "./authStorage";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api"}/notifications`;

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 || response.status === 403) {
    throw new Error("Please sign in again to load notifications");
  }
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchMyNotifications() {
  const response = await fetch(`${API_BASE_URL}/my`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function fetchUnreadCount() {
  const response = await fetch(`${API_BASE_URL}/my/unread-count`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function markNotificationAsRead(notificationId) {
  const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function markAllNotificationsAsRead() {
  const response = await fetch(`${API_BASE_URL}/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function createSeedNotification(payload) {
  const response = await fetch(`${API_BASE_URL}/seed`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}
