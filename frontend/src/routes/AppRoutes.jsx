import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ResourceCataloguePage from "../pages/ResourceCataloguePage";
import ResourceBookingRedirectPage from "../pages/ResourceBookingRedirectPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminResourceMatrixPage from "../pages/AdminResourceMatrixPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import AnalyticsDashboardPage from "../pages/AnalyticsDashboardPage";
import TechnicianDashboardPage from "../pages/TechnicianDashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { fetchCurrentUser } from "../services/authService";
import { clearAuth, getAuth, getToken, saveAuth } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";

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
          (inAdminArea && role !== "ADMIN") ||
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

export default function AppRoutes() {
  return (
    <Router>
      <SessionSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/resources"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <ResourceCataloguePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/book-resource"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <ResourceBookingRedirectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminResourceMatrixPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AnalyticsDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
