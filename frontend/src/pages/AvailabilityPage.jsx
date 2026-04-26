import { getAuth } from "../services/authStorage";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { userActions, userSidebar } from "../config/userDashboardConfig";
import { AvailabilityPanel } from "./DashboardPage";

export default function AvailabilityPage() {
  return (
    <RoleDashboardLayout
      sectionLabel="User Workspace"
      dashboardTitle="Resource Availability"
      dashboardSubtitle="Check available resources, open slots, and booking readiness."
      roleLabel="USER"
      auth={getAuth()}
      sidebarItems={userSidebar}
      kpis={[
        { label: "Available Today", value: "12", change: "Rooms and equipment ready" },
        { label: "Booked Today", value: "08", change: "Confirmed reservations" },
        { label: "Pending Approval", value: "03", change: "Awaiting admin review" },
        { label: "Maintenance", value: "02", change: "Temporarily unavailable" },
      ]}
      quickActions={userActions}
      activityFeed={[
        { title: "Innovation Lab B is open this afternoon", meta: "2:00 PM - 4:00 PM" },
        { title: "Seminar Room 2 free after lunch", meta: "12:30 PM - 3:00 PM" },
        { title: "Projector Kit A is ready", meta: "Media Desk" },
      ]}
      chartTitle="Availability Trend"
      chartCaption="Resource readiness and booking demand today."
      chartColor="#fb923c"
      showInsightsPanel={false}
      extraContent={<AvailabilityPanel />}
    />
  );
}
