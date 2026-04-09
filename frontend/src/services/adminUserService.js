import { getToken } from "./authStorage";

const USERS_BASE_URL = "http://localhost:8080/api/users";
const AUTH_BASE_URL = "http://localhost:8080/api/auth";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function fetchAllUsers() {
  const response = await fetch(USERS_BASE_URL, {
    method: "GET",
    headers: authHeaders(),
  });

  return parseResponse(response);
}

export async function removeUser(userId) {
  const response = await fetch(`${USERS_BASE_URL}/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Unable to delete user");
  }

  return true;
}

export async function updateUserRole(userId, role) {
  const response = await fetch(`${AUTH_BASE_URL}/users/${userId}/role`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });

  return parseResponse(response);
}
