import { getAuth } from "../services/authStorage";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  TriangleAlert,
  CalendarClock,
  LifeBuoy,
} from "lucide-react";

const userSidebar = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My Bookings", badge: "7", icon: CalendarDays },
  { label: "New Reservation", icon: PlusCircle },
  { label: "Incident Reports", icon: TriangleAlert },
  { label: "Availability", icon: CalendarClock },
  { label: "Support", icon: LifeBuoy },
];

const userKpis = [
  { label: "Active Bookings", value: "07", change: "2 need confirmation" },
  { label: "Pending Requests", value: "04", change: "Awaiting review" },
  { label: "Open Reports", value: "03", change: "1 assigned to technician" },
  { label: "Satisfaction Score", value: "4.8/5", change: "Latest feedback" },
];

const userActions = [
  { title: "Book a lab slot", description: "Reserve facilities by available time." },
  { title: "Track request status", description: "Check pending, approved, and rejected items." },
  { title: "Report an issue", description: "Create a maintenance ticket quickly." },
  { title: "Check availability", description: "View room occupancy before booking." },
];

const userActivity = [
  { title: "Lab C12 reservation approved", meta: "5 minutes ago · scheduling" },
  { title: "Incident #REP-087 assigned", meta: "13 minutes ago · building services" },
  { title: "Classroom B03 availability updated", meta: "22 minutes ago · resource system" },
  { title: "Reminder sent for tomorrow booking", meta: "31 minutes ago · smart notifications" },
];

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
