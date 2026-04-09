import { Navigate } from "react-router-dom";
import { getAuth, isAuthenticated } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = (getAuth()?.role || "").toUpperCase();
    if (!allowedRoles.includes(role)) {
      return <Navigate to={getDashboardPathForRole(role)} replace />;
    }
  }

  return children;
}
