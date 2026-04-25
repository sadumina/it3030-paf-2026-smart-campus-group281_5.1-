import { useEffect, useState } from "react";
import "../../components/ticketing/ticketing.css";
import { clearAuth, getAuth, getToken, saveAuth } from "../../services/authStorage";
import RoleDashboardLayout from "../../components/dashboard/RoleDashboardLayout";
import StudentTicketView from "./StudentTicketView";
import AdminTicketView from "./AdminTicketView";
import TechnicianTicketView from "./TechnicianTicketView";
import { fetchCurrentUser } from "../../services/authService";
import {
  LayoutDashboard,
  TriangleAlert,
  ClipboardCheck,
  ScrollText,
  Shield,
} from "lucide-react";
import { Navigate } from "react-router-dom";

const userTicketSidebar = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Incident Reports", icon: TriangleAlert, path: "/tickets" },
  { label: "Ticketing Management", icon: ClipboardCheck, path: "/tickets", badge: "Active" },
];

const adminTicketSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Incidents", icon: TriangleAlert, path: "/tickets", badge: "Active" },
  { label: "Assignment Desk", icon: ClipboardCheck, path: "/tickets?desk=assign" },
  { label: "Audit Trail", icon: ScrollText, path: "/tickets?desk=audit" },
];

function normalizeRole(role) {
  return (role || "")
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_");
}

export default function TicketingPage() {
  const [auth, setAuth] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    const token = getToken();

    if (!token) {
      clearAuth();
      setCheckingSession(false);
      return () => {
        active = false;
      };
    }

    fetchCurrentUser(token)
      .then((currentUser) => {
        if (!active) {
          return;
        }
        const nextAuth = {
          ...(getAuth() || {}),
          ...currentUser,
          token: currentUser.token || token,
        };
        saveAuth(nextAuth);
        setAuth(nextAuth);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        clearAuth();
        setAuth(null);
      })
      .finally(() => {
        if (active) {
          setCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Checking incident access...
      </div>
    );
  }

  if (!auth?.success) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(auth?.role || "USER");

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return (
      <RoleDashboardLayout
        sectionLabel="Admin Ticketing"
        dashboardTitle="Incident Assignment Desk"
        dashboardSubtitle="Review submitted support incidents and assign registered technicians."
        roleLabel={role}
        auth={auth}
        sidebarItems={adminTicketSidebar}
        kpis={[]}
        quickActions={[]}
        activityFeed={[]}
        chartTitle=""
        chartCaption=""
        showInsightsPanel={false}
        extraContent={<AdminTicketView embedded />}
      />
    );
  }
  if (role === "TECHNICIAN") return <TechnicianTicketView />;
  return (
    <RoleDashboardLayout
      sectionLabel="Incident Reports"
      dashboardTitle="Ticketing Management"
      dashboardSubtitle="Create, track, and manage your incident tickets."
      roleLabel="USER"
      auth={auth}
      sidebarItems={userTicketSidebar}
      kpis={[]}
      quickActions={[]}
      activityFeed={[]}
      chartTitle=""
      chartCaption=""
      showInsightsPanel={false}
      extraContent={<StudentTicketView embedded />}
    />
  );
}
