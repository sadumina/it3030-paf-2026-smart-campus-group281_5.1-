import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  ClipboardCheck,
  BarChart3,
  LayoutGrid,
  Users,
  Siren,
  ScrollText,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { getAllBookings } from "../services/bookingService";
import ResourceUsageList from "../components/analytics/ResourceUsageList";
import BookingStatusPieChart from "../components/analytics/BookingStatusPieChart";
import BookingCalendar from "../components/analytics/BookingCalendar";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  {
    label: "Approvals",
    badge: "18",
    icon: ClipboardCheck,
    path: "/admin/bookings",
  },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText },
];

function normalizeBookings(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function buildResourceUsage(bookings) {
  const usageMap = bookings.reduce((acc, booking) => {
    const resourceId = booking.resourceId || "UNKNOWN";

    if (!acc[resourceId]) {
      acc[resourceId] = {
        resourceId,
        total: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      };
    }

    acc[resourceId].total += 1;

    if (booking.status === "APPROVED") acc[resourceId].approved += 1;
    if (booking.status === "REJECTED") acc[resourceId].rejected += 1;
    if (booking.status === "CANCELLED") acc[resourceId].cancelled += 1;

    return acc;
  }, {});

  return Object.values(usageMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

export default function BookingAnalyticspage() {
  const auth = getAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookingAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getAllBookings();
        setBookings(normalizeBookings(response));
        setError("");
      } catch (err) {
        setError("Failed to load booking analytics data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBookingAnalytics();
  }, []);

  const statusSummary = useMemo(
    () =>
      bookings.reduce(
        (acc, booking) => {
          acc.total += 1;

          if (booking.status === "APPROVED") acc.approved += 1;
          if (booking.status === "REJECTED") acc.rejected += 1;
          if (booking.status === "CANCELLED") acc.cancelled += 1;

          return acc;
        },
        { total: 0, approved: 0, rejected: 0, cancelled: 0 },
      ),
    [bookings],
  );

  const resourceUsage = useMemo(() => buildResourceUsage(bookings), [bookings]);

  const statusPieData = useMemo(
    () => [
      { name: "APPROVED", value: statusSummary.approved },
      { name: "REJECTED", value: statusSummary.rejected },
      { name: "CANCELLED", value: statusSummary.cancelled },
    ],
    [statusSummary],
  );

  const kpis = [
    {
      label: "Total Bookings",
      value: String(statusSummary.total),
      change: "All resources",
    },
    {
      label: "Approved",
      value: String(statusSummary.approved),
      change: "Confirmed",
    },
    {
      label: "Rejected",
      value: String(statusSummary.rejected),
      change: "Declined",
    },
    {
      label: "Cancelled",
      value: String(statusSummary.cancelled),
      change: "Revoked",
    },
  ];

  return (
    <RoleDashboardLayout
      sectionLabel="Admin Analytics"
      dashboardTitle="Booking Analytics"
      dashboardSubtitle="Review booking outcomes, demand patterns, and resource utilization."
      roleLabel="ADMIN"
      auth={auth}
      sidebarItems={adminSidebar}
      kpis={kpis}
      quickActions={[]}
      activityFeed={[
        {
          title: `${statusSummary.total} total bookings`,
          meta: "Current snapshot",
        },
        {
          title: `${statusSummary.approved} approved requests`,
          meta: "Current snapshot",
        },
        {
          title: `${statusSummary.cancelled} cancellations`,
          meta: "Current snapshot",
        },
      ]}
      chartTitle="Booking Overview"
      chartCaption="Live trend preview"
      chartColor="#f97316"
      hideDashboardWidgets={true}
      extraContent={
        <section className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-28 rounded-lg bg-slate-200" />
              <div className="h-28 rounded-lg bg-slate-200" />
              <div className="h-56 rounded-lg bg-slate-200" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <ResourceUsageList resourceUsage={resourceUsage} />
                <BookingStatusPieChart statusData={statusPieData} />
              </div>

              <BookingCalendar bookings={bookings} />
            </div>
          )}
        </section>
      }
    />
  );
}
