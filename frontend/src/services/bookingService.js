import axios from "axios";
import { getToken } from "./authStorage";

const API_URL = "http://localhost:8080/api/bookings";

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
