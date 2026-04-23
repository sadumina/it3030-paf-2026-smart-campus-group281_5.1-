import { getAuth } from "../services/authStorage";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { userActivity, userActions, userKpis, userSidebar } from "../config/userDashboardConfig";

export default function DashboardPage() {
  return (
    <RoleDashboardLayout
      sectionLabel="User Workspace"
      dashboardTitle="Smart Campus Dashboard"
      dashboardSubtitle="Manage bookings, requests, and alerts in one place."
      roleLabel="USER"
      auth={getAuth()}
      sidebarItems={userSidebar}
      kpis={userKpis}
      quickActions={userActions}
      activityFeed={userActivity}
      chartTitle="Booking and request trend"
      chartCaption="Live booking and request trend."
      chartColor="#fb923c"
    />
  );
}
