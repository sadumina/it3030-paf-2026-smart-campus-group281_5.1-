import { getAuth } from "../services/authStorage";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import {
  HardHat,
  ClipboardList,
  Wrench,
  NotebookPen,
  Package,
  Handshake,
} from "lucide-react";

const technicianSidebar = [
  { label: "My Board", icon: HardHat },
  { label: "Assigned Tickets", badge: "24", icon: ClipboardList },
  { label: "Preventive Tasks", icon: Wrench },
  { label: "Resolution Notes", icon: NotebookPen },
  { label: "Spare Inventory", badge: "9", icon: Package },
  { label: "Shift Handover", icon: Handshake },
];

const technicianKpis = [
  { label: "Open Tickets", value: "24", change: "7 urgent today" },
  { label: "In Progress", value: "13", change: "+3 in last hour" },
  { label: "Avg. Response", value: "19m", change: "Below target" },
  { label: "Resolved Today", value: "31", change: "94% first-fix" },
];

const technicianActions = [
  { title: "Start priority queue", description: "Handle urgent faults first." },
  { title: "Update field notes", description: "Attach key diagnostics and parts used." },
  { title: "Request procurement", description: "Raise low-stock spare requests." },
  { title: "Send shift handover", description: "Pass unresolved work to next team." },
];

const technicianActivity = [
  { title: "Ticket #INC-142 moved to IN_PROGRESS", meta: "4 minutes ago · Building A2" },
  { title: "Projector lens replacement done", meta: "11 minutes ago · Classroom L11" },
  { title: "Battery stock threshold alert", meta: "16 minutes ago · inventory" },
  { title: "Escalation accepted by supervisor", meta: "24 minutes ago · network fault" },
];

export default function TechnicianDashboardPage() {
  return (
    <RoleDashboardLayout
      sectionLabel="Technician Workspace"
      dashboardTitle="Service & Maintenance Dashboard"
      dashboardSubtitle="Manage tickets and resolutions with clear status flow."
      roleLabel="TECHNICIAN"
      auth={getAuth()}
      sidebarItems={technicianSidebar}
      kpis={technicianKpis}
      quickActions={technicianActions}
      activityFeed={technicianActivity}
      chartTitle="Resolution velocity"
      chartCaption="Live ticket completion trend."
      chartColor="#f97316"
    />
  );
}
