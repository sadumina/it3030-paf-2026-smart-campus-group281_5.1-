import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import BookingPage from "../pages/BookingPage";
import StudentBookingForm from "../components/booking/StudentBookingForm";
import AdminBookings from "../pages/Admin/Bookings";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/student/booking" element={<StudentBookingForm />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Routes>
    </Router>
  );
}
