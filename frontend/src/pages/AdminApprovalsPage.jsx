import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  ClipboardCheck,
  LayoutGrid,
  Users,
  Siren,
  ScrollText,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { fetchAllBookings, updateBookingStatus } from "../services/bookingService";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck, path: "/admin/approvals" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid, path: "/admin/resources" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText, path: "/tickets", badge: "Tickets" },
];

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

const STATUS_FILTERS = ["ALL", "PENDING", "CONFIRMED", "REJECTED", "CANCELLED"];

export default function AdminApprovalsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await fetchAllBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleStatusUpdate(bookingId, status) {
    if (!window.confirm(`Are you sure you want to set this booking to ${status}?`)) return;
    
    setActionLoading(bookingId);
    try {
      const updated = await updateBookingStatus(bookingId, status);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)));
    } catch (err) {
      alert(err.message || `Failed to update booking to ${status}`);
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...bookings]
      .filter((booking) => statusFilter === "ALL" || booking.status === statusFilter)
      .filter((booking) => {
        if (!query) {
          return true;
        }

        return [
          booking.id,
          booking.resourceName,
          booking.userName,
          booking.userEmail,
          booking.date,
          booking.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;
        return String(b.date || "").localeCompare(String(a.date || ""));
      });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <RoleDashboardLayout
      sectionLabel="Admin Command Center"
      dashboardTitle="Booking Approvals"
      dashboardSubtitle="Review and manage student resource reservations."
      roleLabel="ADMIN"
      auth={getAuth()}
      sidebarItems={adminSidebar}
      kpis={[
        { label: "Pending Requests", value: String(pendingCount), change: "Awaiting review" },
        { label: "Approved", value: String(confirmedCount), change: "Ready to use" },
        { label: "Rejected", value: String(rejectedCount), change: "Declined requests" },
        { label: "Matrix Sync", value: "Live", change: "Auto-refresh" },
      ]}
      quickActions={[]}
      activityFeed={bookings.slice(0, 5).map((b) => ({
        title: `${b.resourceName} · ${b.status}`,
        meta: `${b.userName} · ${b.date}`,
      }))}
      chartTitle="Reservation trend"
      chartCaption="Overview of booking request volumes."
      chartColor="#ea580c"
      showNotifications={false}
      extraContent={
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pending Approvals</h3>
              <button 
                onClick={loadBookings}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Refresh List
              </button>
            </div>

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      statusFilter === status
                        ? "border-orange-600 bg-orange-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {status === "ALL" ? "All" : status}
                  </button>
                ))}
              </div>
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search bookings"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-orange-900/30"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading booking queue...</p>
            ) : error ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
            ) : filteredBookings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No booking records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="pb-3 pr-4 font-semibold text-slate-700 dark:text-slate-300">Resource / Student</th>
                      <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date & Time</th>
                      <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="pb-3 pl-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{booking.resourceName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{booking.userName} ({booking.userEmail})</p>
                          {booking.purpose && (
                             <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 italic">"{booking.purpose}"</p>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {booking.date}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-5">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status] || "bg-slate-100"}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {booking.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                disabled={actionLoading === booking.id}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors"
                                title="Approve"
                              >
                                {actionLoading === booking.id ? (
                                   <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent animate-spin rounded-full" />
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, "REJECTED")}
                                disabled={actionLoading === booking.id}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
