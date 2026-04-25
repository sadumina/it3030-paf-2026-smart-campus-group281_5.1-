import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import ResourceCataloguePage from "../pages/ResourceCataloguePage";
import ResourceBookingRedirectPage from "../pages/ResourceBookingRedirectPage";
import AvailabilityPage from "../pages/AvailabilityPage";
import SupportPage from "../pages/SupportPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminResourceMatrixPage from "../pages/AdminResourceMatrixPage";
import AdminApprovalsPage from "../pages/AdminApprovalsPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import AnalyticsDashboardPage from "../pages/AnalyticsDashboardPage";
import TechnicianDashboardPage from "../pages/TechnicianDashboardPage";
import InnovationLabPage from "../pages/InnovationLabPage";
import ResourceFormPage from "../pages/ResourceFormPage";
import TicketingPage from "../pages/ticketing/TicketingPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { fetchCurrentUser } from "../services/authService";
import { clearAuth, getAuth, getToken, saveAuth } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";
import AdminBookingsPage from "../pages/AdminBookingsPage";
import AdminBookingAnalytics from "../pages/BookingAnalyticspage"

function SessionSync() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isDisposed = false;

    const syncSession = async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      try {
        const me = await fetchCurrentUser(token);
        if (isDisposed || !me?.success) {
          return;
        }

        const existing = getAuth() || {};
        saveAuth({
          ...existing,
          ...me,
          token: me.token || token,
        });

        const role = (me.role || "").toUpperCase();
        const inAdminArea = location.pathname.startsWith("/admin");
        const inTechnicianArea = location.pathname.startsWith("/technician");
        const inUserArea = location.pathname.startsWith("/dashboard");

        if (
          (inAdminArea && role !== "ADMIN" && role !== "SUPER_ADMIN") ||
          (inTechnicianArea && role !== "TECHNICIAN") ||
          (inUserArea && role !== "USER")
        ) {
          navigate(getDashboardPathForRole(role || "USER"), { replace: true });
        }
      } catch {
        if (isDisposed) {
          return;
        }

        clearAuth();
        if (!["/", "/login", "/register"].includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
      }
    };

    syncSession();

    return () => {
      isDisposed = true;
    };
  }, [location.pathname, navigate]);

  return null;
}

const pageTransition = {
  initial: { opacity: 0, y: 18, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.995 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

function PageFrame({ children }) {
  return (
    <motion.div
      className="min-h-screen w-full"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageFrame><LandingPage /></PageFrame>} />
        <Route path="/login" element={<PageFrame><LoginPage /></PageFrame>} />
        <Route path="/register" element={<PageFrame><RegisterPage /></PageFrame>} />
        <Route
          path="/dashboard"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["USER"]}>
                <DashboardPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/dashboard/bookings"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["USER"]}>
                <MyBookingsPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/dashboard/resources"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["USER"]}>
                <ResourceCataloguePage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/dashboard/availability"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["USER"]}>
                <AvailabilityPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/dashboard/book-resource"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["USER"]}>
                <ResourceBookingRedirectPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/dashboard/support"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["USER"]}>
                <SupportPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/tickets"
          element={
            <PageFrame>
              <ProtectedRoute>
                <TicketingPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminResourceMatrixPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/resources/create"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <ResourceFormPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/resources/:id/edit"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <ResourceFormPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminApprovalsPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/technician"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                <TechnicianDashboardPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/innovation-lab"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <InnovationLabPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        {/* 
        /admin/booking-analytics */}
        <Route
          path="/admin/booking-analytics"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminBookingAnalytics />
              </ProtectedRoute>
            </PageFrame>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <PageFrame>
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminBookingsPage />
              </ProtectedRoute>
            </PageFrame>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function AppRoutes() {
  return (
    <Router>
      <SessionSync />
      <AnimatedRoutes />
    </Router>
  );
}
