import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarDays, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { userActions, userSidebar } from "../config/userDashboardConfig";
import { getAuth } from "../services/authStorage";
import { cancelBooking, fetchMyBookings } from "../services/bookingService";

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

function sortBookings(a, b) {
  const statusRank = { PENDING: 0, CONFIRMED: 1, REJECTED: 2, CANCELLED: 3 };
  const rankA = statusRank[a.status] ?? 4;
  const rankB = statusRank[b.status] ?? 4;

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  return String(b.date || "").localeCompare(String(a.date || ""));
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(bookingId) {
    if (!window.confirm("Cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const updated = await cancelBooking(bookingId);
      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? { ...booking, ...updated } : booking)),
      );
    } catch (cancelError) {
      alert(cancelError.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((booking) => booking.status === "PENDING").length;
    const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED").length;
    const rejected = bookings.filter((booking) => booking.status === "REJECTED").length;

    return { total, pending, confirmed, rejected };
  }, [bookings]);

  const sortedBookings = useMemo(() => [...bookings].sort(sortBookings), [bookings]);

  return (
    <RoleDashboardLayout
      sectionLabel="User Workspace"
      dashboardTitle="My Bookings"
      dashboardSubtitle="Track your reservation requests and approvals."
      roleLabel="USER"
      auth={getAuth()}
      sidebarItems={userSidebar}
      kpis={[
        { label: "Total Bookings", value: String(stats.total), change: "All requests" },
        { label: "Pending", value: String(stats.pending), change: "Awaiting approval" },
        { label: "Confirmed", value: String(stats.confirmed), change: "Ready to use" },
        { label: "Rejected", value: String(stats.rejected), change: "Needs another slot" },
      ]}
      quickActions={userActions}
      activityFeed={sortedBookings.slice(0, 4).map((booking) => ({
        title: booking.resourceName || "Resource booking",
        meta: `${booking.date || "No date"} - ${booking.status || "PENDING"}`,
      }))}
      chartTitle="Booking activity"
      chartCaption="Current status of your booking requests."
      chartColor="#fb923c"
      showNotifications={false}
      extraContent={
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Booking Requests</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                New reservations start from the resource catalogue.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadBookings}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <Link
                to="/dashboard/resources"
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                <CalendarDays className="h-4 w-4" />
                New Reservation
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Loading your bookings...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          {!loading && !error && sortedBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              You do not have any bookings yet.
            </div>
          ) : null}

          {!loading && !error && sortedBookings.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {booking.resourceName || "Resource"}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {booking.date || "No date selected"}
                      </h3>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING}`}>
                      {booking.status || "PENDING"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900/50">
                      <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                        <CalendarClock className="h-4 w-4 text-orange-500" />
                        Time
                      </p>
                      <p className="mt-1 text-slate-500 dark:text-slate-400">
                        {booking.startTime || "--"} - {booking.endTime || "--"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900/50">
                      <p className="font-medium text-slate-700 dark:text-slate-200">Booking ID</p>
                      <p className="mt-1 break-all text-slate-500 dark:text-slate-400">{booking.id}</p>
                    </div>
                  </div>

                  {booking.purpose ? (
                    <p className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                      {booking.purpose}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    {booking.status === "CONFIRMED" ? (
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">Status updates appear here automatically.</span>
                    )}

                    {booking.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      >
                        <XCircle className="h-4 w-4" />
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      }
    />
  );
}
