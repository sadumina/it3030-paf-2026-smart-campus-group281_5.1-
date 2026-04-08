import axios from "axios";

const API_URL = "http://localhost:8080/api/bookings";

export const createBooking = (data) => axios.post(API_URL, data);
export const getBookingById = (id) => axios.get(`${API_URL}/${id}`);
export const getAllBookings = () => axios.get(API_URL);
export const approveBooking = (id, adminId = "ADMIN-001") =>
  axios.put(`${API_URL}/${id}/approve`, null, {
    params: { adminId },
  });
export const rejectBooking = (id, reason) =>
  axios.put(`${API_URL}/${id}/reject`, null, {
    params: { reason },
  });
export const cancelBooking = (id) => axios.put(`${API_URL}/${id}/cancel`);
