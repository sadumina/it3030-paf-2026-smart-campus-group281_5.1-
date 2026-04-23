import "../../components/ticketing/ticketing.css";
import { getAuth } from "../../services/authStorage";
import RoleDashboardLayout from "../../components/dashboard/RoleDashboardLayout";
import StudentTicketView from "./StudentTicketView";
import AdminTicketView from "./AdminTicketView";
import TechnicianTicketView from "./TechnicianTicketView";
import {
  LayoutDashboard,
  TriangleAlert,
  ClipboardCheck,
  ScrollText,
  Shield,
} from "lucide-react";

const userTicketSidebar = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Incident Reports", icon: TriangleAlert, path: "/tickets" },
  { label: "Ticketing Management", icon: ClipboardCheck, path: "/tickets", badge: "Active" },
];

const adminTicketSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Audit Trail", icon: ScrollText, path: "/tickets" },
  { label: "Ticket Management", icon: ClipboardCheck, path: "/tickets", badge: "Active" },
];

export default function TicketingPage() {
  const auth = getAuth();
  const role = (auth?.role || "USER").toUpperCase();

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return (
      <RoleDashboardLayout
        sectionLabel="Admin Ticketing"
        dashboardTitle="Audit Trail - Ticket Management"
        dashboardSubtitle="Manage and monitor incident tickets with admin controls."
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
