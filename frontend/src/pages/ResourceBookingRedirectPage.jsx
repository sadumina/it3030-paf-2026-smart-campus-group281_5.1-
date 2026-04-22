import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { userActions, userSidebar } from "../config/userDashboardConfig";
import { getAuth } from "../services/authStorage";
import { fetchResourceBookingContext } from "../services/resourceService";
import { createBooking, fetchMyBookings, cancelBooking } from "../services/bookingService";

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export default function ResourceBookingRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resourceId = searchParams.get("resourceId") || "";

  const [resource, setResource] = useState(null);
  const [resourceLoading, setResourceLoading] = useState(Boolean(resourceId));
  const [resourceError, setResourceError] = useState("");

  // Form state
  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // My bookings panel
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Load resource context
  useEffect(() => {
    let active = true;
    if (!resourceId) {
      setResourceLoading(false);
      setResourceError("No resource selected.");
      return;
    }
    async function load() {
      try {
        const data = await fetchResourceBookingContext(resourceId);
        if (active) setResource(data);
      } catch (err) {
        if (active) setResourceError(err.message || "Unable to load resource details.");
      } finally {
        if (active) setResourceLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [resourceId]);

  // Load user's bookings
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchMyBookings();
        if (active) setMyBookings(data);
      } catch {
        // silent — bookings list is secondary
      } finally {
        if (active) setBookingsLoading(false);
      }
    }
    load();
  }, [submitSuccess]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!resourceId) { setSubmitError("No resource selected."); return; }
    if (!date) { setSubmitError("Please select a date."); return; }
    if (!startTime || !endTime) { setSubmitError("Please set start and end times."); return; }
    if (endTime <= startTime) { setSubmitError("End time must be after start time."); return; }

    setSubmitting(true);
    try {
      const result = await createBooking({
        resourceId,
        date,
        startTime,
        endTime,
        purpose: purpose.trim(),
      });
      setSubmitSuccess(result);
      setPurpose("");
    } catch (err) {
      setSubmitError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(bookingId) {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      const updated = await cancelBooking(bookingId);
      setMyBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)));
    } catch (err) {
      alert(err.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  const resourceStatus = String(resource?.status || "").toUpperCase();
  const isUnavailable = resource && resourceStatus !== "ACTIVE";

  return (
    <RoleDashboardLayout
      sectionLabel="User Workspace"
      dashboardTitle="Book a Resource"
      dashboardSubtitle="Reserve a campus resource for your session."
      roleLabel="USER"
      auth={getAuth()}
      sidebarItems={userSidebar}
      kpis={[
        { label: "My Bookings", value: String(myBookings.length), change: "Total requests" },
        {
          label: "Pending",
          value: String(myBookings.filter((b) => b.status === "PENDING").length),
          change: "Awaiting confirmation",
        },
        {
          label: "Confirmed",
          value: String(myBookings.filter((b) => b.status === "CONFIRMED").length),
          change: "Approved",
        },
        {
          label: "Cancelled",
          value: String(myBookings.filter((b) => b.status === "CANCELLED").length),
          change: "Withdrawn",
        },
      ]}
      quickActions={userActions}
      activityFeed={myBookings.slice(0, 4).map((b) => ({
        title: b.resourceName || "Resource",
        meta: `${b.date} · ${b.startTime} – ${b.endTime} · ${b.status}`,
      }))}
      chartTitle="Booking activity"
      chartCaption="Your recent booking requests."
      chartColor="#fb923c"
      showNotifications={false}
      extraContent={
        <div className="space-y-6">
          {/* Resource summary card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {resourceLoading && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading resource details…</p>
            )}
            {!resourceLoading && resourceError && (
              <p className="text-sm text-rose-600 dark:text-rose-300">{resourceError}</p>
            )}
            {!resourceLoading && resource && (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Selected Resource
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {resource.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                    {resource.type} · {resource.location} · Capacity: {resource.capacity ?? "N/A"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    resourceStatus === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                  }`}
                >
                  {resourceStatus}
                </span>
              </div>
            )}
          </div>

          {/* Booking form */}
          {isUnavailable ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              This resource is currently <strong>out of service</strong> and cannot be booked.{" "}
              <button
                type="button"
                onClick={() => navigate("/dashboard/resources")}
                className="underline"
              >
                Browse other resources
              </button>
              .
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Booking Details
              </h3>

              {submitSuccess ? (
                <div className="mt-4 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    ✓ Booking submitted successfully!
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Status: <strong>{submitSuccess.status}</strong> · {submitSuccess.date} ·{" "}
                    {submitSuccess.startTime} – {submitSuccess.endTime}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setSubmitSuccess(null); }}
                      className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                    >
                      Book Another Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/resources")}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Back to Catalogue
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-date"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      value={date}
                      min={getTodayDateString()}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={submitting}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Time row */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="booking-start"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        Start Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="booking-start"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={submitting}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="booking-end"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        End Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="booking-end"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={submitting}
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-purpose"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Purpose{" "}
                      <span className="text-xs font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      id="booking-purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      disabled={submitting}
                      rows={3}
                      placeholder="e.g. Study group session, lab practicals…"
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                    />
                  </div>

                  {/* Error */}
                  {submitError && (
                    <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                      {submitError}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting || !resource}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Submitting…
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/resources")}
                      disabled={submitting}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* My bookings history */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              My Bookings
            </h3>

            {bookingsLoading ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Loading your bookings…
              </p>
            ) : myBookings.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                You have no bookings yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {myBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {booking.resourceName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {booking.date} · {booking.startTime} – {booking.endTime}
                      </p>
                      {booking.purpose && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                          {booking.purpose}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                        >
                          {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
