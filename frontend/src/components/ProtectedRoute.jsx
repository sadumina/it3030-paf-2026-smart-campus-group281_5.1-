import { Navigate } from "react-router-dom";
import { getAuth, isAuthenticated } from "../services/authStorage";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = (getAuth()?.role || "").toUpperCase();
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
