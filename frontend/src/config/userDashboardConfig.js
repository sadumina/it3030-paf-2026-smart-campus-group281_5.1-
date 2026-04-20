import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  TriangleAlert,
  CalendarClock,
  LifeBuoy,
  LibraryBig,
} from "lucide-react";

export const userSidebar = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Resource Catalogue", icon: LibraryBig, path: "/dashboard/resources" },
  { label: "My Bookings", badge: "7", icon: CalendarDays },
  { label: "New Reservation", icon: PlusCircle },
  { label: "Incident Reports", icon: TriangleAlert },
  { label: "Availability", icon: CalendarClock },
  { label: "Support", icon: LifeBuoy },
];

export const userKpis = [
  { label: "Active Bookings", value: "07", change: "2 need confirmation" },
  { label: "Pending Requests", value: "04", change: "Awaiting review" },
  { label: "Open Reports", value: "03", change: "1 assigned to technician" },
  { label: "Satisfaction Score", value: "4.8/5", change: "Latest feedback" },
];

export const userActions = [
  { title: "Book a lab slot", description: "Reserve facilities by available time." },
  { title: "Track request status", description: "Check pending, approved, and rejected items." },
  { title: "Report an issue", description: "Create a maintenance ticket quickly." },
  { title: "Check availability", description: "View room occupancy before booking." },
];

export const userActivity = [
  { title: "Lab C12 reservation approved", meta: "5 minutes ago - scheduling" },
  { title: "Incident #REP-087 assigned", meta: "13 minutes ago - building services" },
  { title: "Classroom B03 availability updated", meta: "22 minutes ago - resource system" },
  { title: "Reminder sent for tomorrow booking", meta: "31 minutes ago - smart notifications" },
];
