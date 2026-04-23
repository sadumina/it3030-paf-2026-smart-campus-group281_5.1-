import { getAuth } from "../services/authStorage";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import {
  Shield,
  ClipboardCheck,
  LayoutGrid,
  Users,
  Siren,
  ScrollText,
  BarChart3,
  Sparkles,
} from "lucide-react";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck, path: "/admin/approvals" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid, path: "/admin/resources" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Innovation Lab", icon: Sparkles, path: "/admin/innovation-lab", badge: "New" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText, path: "/tickets", badge: "Tickets" },
];

const adminKpis = [
  { label: "Pending Approvals", value: "38", change: "+12% today" },
  { label: "Active Incidents", value: "19", change: "4 escalated" },
  { label: "Resource Utilization", value: "84%", change: "Peak at 2 PM" },
  { label: "SLA Adherence", value: "96.4%", change: "Stable" },
];

const adminActions = [
  { title: "Review booking queue", description: "Approve or reject pending requests." },
  { title: "Publish advisory", description: "Notify users about temporary closures." },
  { title: "Assign technician", description: "Distribute urgent tasks quickly." },
  { title: "Export compliance", description: "Download weekly governance report." },
];

const adminActivity = [
  { title: "Lab B07 request approved", meta: "2 minutes ago · Federico R." },
  { title: "Technician reassigned for Building C", meta: "9 minutes ago · auto rule" },
  { title: "Escalation: Main Hall cooling", meta: "15 minutes ago · high priority" },
  { title: "Role updates submitted for 3 users", meta: "27 minutes ago · security" },
];

export default function AdminDashboardPage() {
  const auth = getAuth();
  const currentRole = (auth?.role || "ADMIN").toUpperCase();
  const isSuperAdmin = currentRole === "SUPER_ADMIN";

  return (
    <RoleDashboardLayout
      sectionLabel={isSuperAdmin ? "Super Admin Command Center" : "Admin Command Center"}
      dashboardTitle="Campus Operations Dashboard"
      dashboardSubtitle={
        isSuperAdmin
          ? "Global governance, privileged access, and full control in one place."
          : "Approvals, incidents, and control in one place."
      }
      roleLabel={currentRole}
      auth={auth}
      sidebarItems={adminSidebar}
      kpis={adminKpis}
      quickActions={adminActions}
      activityFeed={adminActivity}
      chartTitle="System throughput"
      chartCaption="Live booking and incident trend."
      chartColor="#ea580c"
    />
  );
}
