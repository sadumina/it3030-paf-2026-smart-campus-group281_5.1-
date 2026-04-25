import axios from "axios";
import { getAuth, getToken } from "./authStorage";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"}/bookings`;

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const createBooking = (data) => axios.post(API_URL, data, authConfig());
export const getBookingById = (id) =>
  axios.get(`${API_URL}/${id}`, authConfig());
export const getAllBookings = () => axios.get(API_URL, authConfig());
export const getMyBookings = (userId) =>
  axios.get(`${API_URL}/my`, {
    params: { userId },
    ...authConfig(),
  });
export const approveBooking = (id, adminId = "ADMIN-001") =>
  axios.put(`${API_URL}/${id}/approve`, null, {
    params: { adminId },
    ...authConfig(),
  });
export const rejectBooking = (id, reason) =>
  axios.put(`${API_URL}/${id}/reject`, null, {
    params: { reason },
    ...authConfig(),
  });
export const cancelBooking = (id) =>
  axios.put(`${API_URL}/${id}/cancel`, null, authConfig());

// Student soft-deletes a PENDING booking (permanently removed after 7 days)
export const deleteBooking = (id, userId) =>
  axios.delete(`${API_URL}/${id}`, {
    params: { userId },
    ...authConfig(),
  });

// Admin: fetch all soft-deleted bookings
export const getDeletedBookings = () =>
  axios.get(`${API_URL}/deleted`, authConfig());

const toData = (response) => response?.data ?? response;

// Backward-compatible aliases used by older pages.
export const fetchAllBookings = () => getAllBookings().then(toData);
export const fetchMyBookings = (userId) => {
  const resolvedUserId = userId || getAuth()?.id || "";
  return getMyBookings(resolvedUserId).then(toData);
};

export const updateBookingStatus = (id, status, reason = "") => {
  if (status === "APPROVED") {
    return approveBooking(id).then(toData);
  }

  if (status === "REJECTED") {
    return rejectBooking(id, reason).then(toData);
  }

  if (status === "CANCELLED") {
    return cancelBooking(id).then(toData);
  }

  return Promise.reject(new Error(`Unsupported booking status: ${status}`));
};
