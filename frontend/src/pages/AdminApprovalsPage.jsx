import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle,
  ClipboardCheck,
  Clock,
  LayoutGrid,
  ScrollText,
  Search,
  Shield,
  Siren,
  Users,
  XCircle,
} from "lucide-react";

import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import {
  fetchAllBookings,
  updateBookingStatus,
} from "../services/bookingService";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  {
    label: "Approvals",
    badge: "Bookings",
    icon: ClipboardCheck,
    path: "/admin/approvals",
  },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid, path: "/admin/resources" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Incidents", badge: "Tickets", icon: Siren, path: "/tickets" },
  {
    label: "Audit Trail",
    icon: ScrollText,
    path: "/tickets",
    badge: "Tickets",
  },
];

const STATUS_STYLES = {
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  APPROVED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  CANCELLED:
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function normalizeBookingStatus(status) {
  return status === "CONFIRMED" ? "APPROVED" : status || "PENDING";
}

export default function AdminApprovalsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reasonById, setReasonById] = useState({});

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
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
    const reason = (reasonById[bookingId] || "").trim();

    if (status === "REJECTED" && !reason) {
      alert("Please enter a rejection reason before rejecting this booking.");
      return;
    }

    if (
      !window.confirm(`Are you sure you want to set this booking to ${status}?`)
    ) {
      return;
    }

    setActionLoading(bookingId);
    try {
      const updated = await updateBookingStatus(bookingId, status, reason);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)),
      );
      setReasonById((current) => {
        const next = { ...current };
        delete next[bookingId];
        return next;
      });
    } catch (err) {
      alert(err.message || `Failed to update booking to ${status}`);
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = bookings.filter(
    (b) => normalizeBookingStatus(b.status) === "PENDING",
  ).length;
  const approvedCount = bookings.filter(
    (b) => normalizeBookingStatus(b.status) === "APPROVED",
  ).length;
  const rejectedCount = bookings.filter(
    (b) => normalizeBookingStatus(b.status) === "REJECTED",
  ).length;

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...bookings]
      .filter(
        (booking) =>
          statusFilter === "ALL" ||
          normalizeBookingStatus(booking.status) === statusFilter,
      )
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
          normalizeBookingStatus(booking.status),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const aStatus = normalizeBookingStatus(a.status);
        const bStatus = normalizeBookingStatus(b.status);

        if (aStatus === "PENDING" && bStatus !== "PENDING") return -1;
        if (aStatus !== "PENDING" && bStatus === "PENDING") return 1;
        return String(b.date || "").localeCompare(String(a.date || ""));
      });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <RoleDashboardLayout
      sectionLabel="Admin Command Center"
      dashboardTitle="Booking Approvals"
      dashboardSubtitle="Review pending requests, approve valid slots, or reject with a clear reason."
      roleLabel="ADMIN"
      auth={getAuth()}
      sidebarItems={adminSidebar}
      kpis={[
        {
          label: "Pending Requests",
          value: String(pendingCount),
          change: "Awaiting review",
        },
        {
          label: "Approved",
          value: String(approvedCount),
          change: "Ready to use",
        },
        {
          label: "Rejected",
          value: String(rejectedCount),
          change: "Reason required",
        },
        {
          label: "Matrix Sync",
          value: "Live",
          change: "Conflict checks active",
        },
      ]}
      quickActions={[]}
      activityFeed={bookings.slice(0, 5).map((b) => ({
        title: `${b.resourceName || "Resource"} - ${normalizeBookingStatus(b.status)}`,
        meta: `${b.userName || "User"} - ${b.date || "No date"}`,
      }))}
      chartTitle="Reservation trend"
      chartCaption="Overview of booking request volumes."
      chartColor="#ea580c"
      showNotifications={false}
      extraContent={
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Booking Queue
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Workflow: only PENDING bookings can be updated to APPROVED or
                  REJECTED.
                </p>
              </div>
              <button
                onClick={loadBookings}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 dark:border-slate-700 dark:hover:bg-slate-900"
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
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading booking queue...
              </p>
            ) : error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </p>
            ) : filteredBookings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No booking records found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="pb-3 pr-4 font-semibold text-slate-700 dark:text-slate-300">
                        Resource / Student
                      </th>
                      <th className="px-4 pb-3 font-semibold text-slate-700 dark:text-slate-300">
                        Date & Time
                      </th>
                      <th className="px-4 pb-3 font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </th>
                      <th className="pb-3 pl-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredBookings.map((booking) => {
                      const displayStatus = normalizeBookingStatus(
                        booking.status,
                      );
                      const isBusy = actionLoading === booking.id;

                      return (
                        <tr
                          key={booking.id}
                          className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                        >
                          <td className="py-4 pr-4 align-top">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {booking.resourceName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {booking.userName} ({booking.userEmail})
                            </p>
                            {booking.purpose ? (
                              <p className="mt-1 text-xs italic text-slate-400 dark:text-slate-500">
                                "{booking.purpose}"
                              </p>
                            ) : null}
                            {booking.rejectionReason ? (
                              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">
                                Reason: {booking.rejectionReason}
                              </p>
                            ) : null}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 align-top">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {booking.date}
                            </div>
                            <p className="ml-5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {booking.startTime} - {booking.endTime}
                            </p>
                            {booking.expectedAttendees ? (
                              <p className="ml-5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {booking.expectedAttendees} attendee
                                {booking.expectedAttendees === 1 ? "" : "s"}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[displayStatus] || "bg-slate-100"}`}
                            >
                              {displayStatus}
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-right align-top">
                            {displayStatus === "PENDING" ? (
                              <div className="flex flex-col items-end gap-2">
                                <textarea
                                  rows={2}
                                  value={reasonById[booking.id] || ""}
                                  onChange={(event) =>
                                    setReasonById((current) => ({
                                      ...current,
                                      [booking.id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Reason for rejection"
                                  className="w-full min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(booking.id, "APPROVED")
                                    }
                                    disabled={isBusy}
                                    className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                    title="Approve"
                                  >
                                    {isBusy ? (
                                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                                    ) : (
                                      <CheckCircle className="h-5 w-5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(booking.id, "REJECTED")
                                    }
                                    disabled={isBusy}
                                    className="rounded-lg p-1.5 text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-900/30"
                                    title="Reject"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs italic text-slate-400 dark:text-slate-500">
                                No actions
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
