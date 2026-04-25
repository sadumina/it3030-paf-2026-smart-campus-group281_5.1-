import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchCurrentUser } from "../services/authService";
import { clearAuth, getAuth, getToken, isAuthenticated, saveAuth } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [checked, setChecked] = useState(false);
  const [resolvedRole, setResolvedRole] = useState(() => (getAuth()?.role || "").toUpperCase());
  const [validSession, setValidSession] = useState(() => isAuthenticated());

  useEffect(() => {
    let active = true;
    const token = getToken();

    if (!token) {
      setValidSession(false);
      setChecked(true);
      return () => {
        active = false;
      };
    }

    setChecked(false);
    fetchCurrentUser(token)
      .then((currentUser) => {
        if (!active) {
          return;
        }

        const existing = getAuth() || {};
        const nextAuth = {
          ...existing,
          ...currentUser,
          token: currentUser.token || token,
        };
        saveAuth(nextAuth);
        setResolvedRole((nextAuth.role || "").toUpperCase());
        setValidSession(Boolean(currentUser?.success));
      })
      .catch(() => {
        if (!active) {
          return;
        }
        clearAuth();
        setValidSession(false);
      })
      .finally(() => {
        if (active) {
          setChecked(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Checking session...
      </div>
    );
  }

  if (!validSession) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = resolvedRole || (getAuth()?.role || "").toUpperCase();
    if (!allowedRoles.includes(role)) {
      return <Navigate to={getDashboardPathForRole(role)} replace />;
    }
  }

  return children;
}
