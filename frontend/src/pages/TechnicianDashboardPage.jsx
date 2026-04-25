import { useMemo, useState } from "react";
import {
  ClipboardList,
  Handshake,
  HardHat,
  NotebookPen,
  Package,
  Wrench,
} from "lucide-react";

import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import TechnicianTicketView from "./ticketing/TechnicianTicketView";

const technicianSidebar = [
  { label: "My Board", icon: HardHat, path: "/technician" },
  { label: "Assigned Tickets", badge: "Live", icon: ClipboardList, path: "/technician" },
  { label: "Preventive Tasks", icon: Wrench, path: "/technician" },
  { label: "Resolution Notes", icon: NotebookPen, path: "/technician" },
  { label: "Spare Inventory", badge: "9", icon: Package, path: "/technician" },
  { label: "Shift Handover", icon: Handshake, path: "/technician" },
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
      { label: "Assigned Tickets", value: String(tickets.length), change: "Your workload" },
      { label: "Open", value: String(open), change: "Ready to start" },
      { label: "In Progress", value: String(inProgress), change: "Needs resolution notes" },
      { label: "Resolved", value: String(resolved), change: `${urgent} urgent assigned` },
    ];
  }, [tickets]);

  const activityFeed = useMemo(
    () =>
      tickets.slice(0, 5).map((ticket) => ({
        title: `${ticket.ticketId || "Ticket"} - ${ticket.status}`,
        meta: `${ticket.location || "No location"} - ${ticket.priority || "MEDIUM"}`,
      })),
    [tickets],
  );

  return (
    <RoleDashboardLayout
      sectionLabel="Technician Workspace"
      dashboardTitle="Service & Maintenance Dashboard"
      dashboardSubtitle="Work assigned tickets, start progress, add comments, and submit resolution notes."
      roleLabel="TECHNICIAN"
      auth={getAuth()}
      sidebarItems={technicianSidebar}
      kpis={kpis}
      quickActions={[
        { title: "Open assigned board", description: "Review tickets assigned by admins." },
        { title: "Start progress", description: "Move accepted jobs into active repair." },
        { title: "Add field comments", description: "Keep users and admins updated." },
        { title: "Resolve with notes", description: "Submit repair details before resolution." },
      ]}
      activityFeed={activityFeed}
      chartTitle="Resolution velocity"
      chartCaption="Live ticket completion trend."
      chartColor="#f97316"
      showNotifications={false}
      extraContent={<TechnicianTicketView embedded onTicketsChange={setTickets} />}
    />
  );
}
