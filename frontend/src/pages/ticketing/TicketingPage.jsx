import "../../components/ticketing/ticketing.css";
import { getAuth } from "../../services/authStorage";
import RoleDashboardLayout from "../../components/dashboard/RoleDashboardLayout";
import StudentTicketView from "./StudentTicketView";
import AdminTicketView from "./AdminTicketView";
import TechnicianTicketView from "./TechnicianTicketView";
import SuperAdminTicketView from "./SuperAdminTicketView";
import { userSidebar } from "../../config/userDashboardConfig";
import { adminSidebar, superAdminSidebar } from "../AdminDashboardPage";
import { technicianSidebar } from "../TechnicianDashboardPage";

export default function TicketingPage() {
  const auth = getAuth();
  const role = (auth?.role || "USER").toUpperCase();

  if (role === "SUPER_ADMIN") {
    return (
      <RoleDashboardLayout
        sectionLabel="Super Admin Command Center"
        dashboardTitle="Global Ticket & User Control"
        dashboardSubtitle="Full oversight — manage all tickets and all user accounts."
        roleLabel="SUPER_ADMIN"
        auth={auth}
        sidebarItems={superAdminSidebar}
        kpis={[]}
        quickActions={[]}
        activityFeed={[]}
        chartTitle=""
        chartCaption=""
        showInsightsPanel={false}
        extraContent={<SuperAdminTicketView embedded />}
      />
    );
  }

  if (role === "ADMIN") {
    return (
      <RoleDashboardLayout
        sectionLabel="Admin Ticketing"
        dashboardTitle="Audit Trail - Ticket Management"
        dashboardSubtitle="Manage and monitor incident tickets with admin controls."
        roleLabel="ADMIN"
        auth={auth}
        sidebarItems={adminSidebar}
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
  if (role === "TECHNICIAN") {
    return (
      <RoleDashboardLayout
        sectionLabel="Technician Workspace"
        dashboardTitle="My Assigned Tickets"
        dashboardSubtitle="Manage and resolve your assigned campus incidents."
        roleLabel="TECHNICIAN"
        auth={auth}
        sidebarItems={technicianSidebar}
        kpis={[]}
        quickActions={[]}
        activityFeed={[]}
        chartTitle=""
        chartCaption=""
        showInsightsPanel={false}
        extraContent={<TechnicianTicketView embedded />}
      />
    );
  }
  return (
    <RoleDashboardLayout
      sectionLabel="Incident Reports"
      dashboardTitle="Ticketing Management"
      dashboardSubtitle="Create, track, and manage your incident tickets."
      roleLabel="USER"
      auth={auth}
      sidebarItems={userSidebar}
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
