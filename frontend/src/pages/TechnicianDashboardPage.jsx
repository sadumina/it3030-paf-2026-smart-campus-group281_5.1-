import { useMemo, useState } from "react";
import {
  ClipboardList,
  BellDot,
} from "lucide-react";

import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import TechnicianTicketView from "./ticketing/TechnicianTicketView";

const technicianSidebar = [
  { label: "Assigned Incidents", icon: ClipboardList, path: "/technician", badge: "Live" },
  { label: "Updates", icon: BellDot, path: "/technician?view=updates" },
];

function countByStatus(tickets, status) {
  return tickets.filter((ticket) => ticket.status === status).length;
}

export default function TechnicianDashboardPage() {
  const [tickets, setTickets] = useState([]);

  const kpis = useMemo(() => {
    const open = countByStatus(tickets, "OPEN");
    const inProgress = countByStatus(tickets, "IN_PROGRESS");
    const resolved = countByStatus(tickets, "RESOLVED");
    const urgent = tickets.filter((ticket) => ["CRITICAL", "HIGH"].includes(ticket.priority)).length;

    return [
      { label: "Assigned Incidents", value: String(tickets.length), change: "Assigned by admin" },
      { label: "Ready to Start", value: String(open), change: "Open requests" },
      { label: "In Progress", value: String(inProgress), change: "Active technician work" },
      { label: "Resolved", value: String(resolved), change: `${urgent} urgent assigned` },
    ];
  }, [tickets]);

  return (
    <RoleDashboardLayout
      sectionLabel="Technician Workspace"
      dashboardTitle="Assigned Incident Records"
      dashboardSubtitle="Review assigned incidents, update progress, and submit resolution notes."
      roleLabel="TECHNICIAN"
      auth={getAuth()}
      sidebarItems={technicianSidebar}
      kpis={kpis}
      quickActions={[]}
      activityFeed={[]}
      chartTitle=""
      chartCaption=""
      showInsightsPanel={false}
      showNotifications
      showBreadcrumb={false}
      showUtilityActions={false}
      extraContent={<TechnicianTicketView embedded onTicketsChange={setTickets} />}
    />
  );
}
