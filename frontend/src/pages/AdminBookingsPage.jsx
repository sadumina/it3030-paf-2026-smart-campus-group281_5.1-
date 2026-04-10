import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  LayoutGrid,
  ScrollText,
  Shield,
  Siren,
  Users,
  UserRoundCog,
  BarChart3,
  Search,
} from "lucide-react";

import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { ConfirmationModal } from "../components/ConfirmationModal";
import {
  createNotification,
  notificationTypes,
  notificationPriorities,
} from "../services/advancedNotificationService";

import {
  approveBooking,
  cancelBooking,
  getAllBookings,
  rejectBooking,
} from "../services/bookingService";

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

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookingIdDisplay({ id }) {
  const idStr = String(id);
  const prefix = idStr.slice(0, -4);
  const lastFour = idStr.slice(-4);

  return (
    <h3 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">
      {prefix}
      <span className="text-orange-600 dark:text-orange-400">{lastFour}</span>
    </h3>
  );
}

export default function AdminBookingsPage() {
  const auth = getAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reasonById, setReasonById] = useState({});
  const [busyId, setBusyId] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    bookingId: null,
    bookingTitle: "",
    action: null,
    actionType: "", // "cancel"
    isLoading: false,
  });

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllBookings();
      setBookings(response.data || response);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message || "Failed to load bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    let result = bookings;

    // Apply status filter
    if (filter !== "ALL") {
      result = result.filter((booking) => booking.status === filter);
    }

    // Apply search filter (search by booking ID - last 4 digits or full ID)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((booking) => {
        const idStr = String(booking.id).toLowerCase();
        return idStr.includes(query);
      });
    }

    return result;
  }, [bookings, filter, searchQuery]);

  const counts = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        acc[booking.status.toLowerCase()] += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 },
    );
  }, [bookings]);

  const setReason = (bookingId, value) => {
    setReasonById((prev) => ({ ...prev, [bookingId]: value }));
  };

  // Unified action handler with notifications
  const runAction = async (bookingId, actionFn, successMessage) => {
    setBusyId(bookingId);
    setError("");
    setMessage("");

    try {
      await actionFn();
      setMessage(successMessage || "Booking updated successfully.");

      // Clear reason after reject
      setReasonById((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });

      await loadBookings();

      // Success Notification
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification("Success", {
            type: notificationTypes.SUCCESS,
            message: successMessage || "Booking updated successfully.",
            priority: notificationPriorities.NORMAL,
            duration: 4000,
            icon: "✓",
          }),
        );
      }
    } catch (actionError) {
      const errorMsg =
        actionError.response?.data?.message ||
        actionError.response?.data ||
        "Unable to update booking.";

      setError(errorMsg);

      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification("Action Failed", {
            type: notificationTypes.ERROR,
            message: errorMsg,
            priority: notificationPriorities.HIGH,
            duration: 0,
            icon: "✕",
          }),
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = (bookingId) => {
    runAction(
      bookingId,
      () => approveBooking(bookingId),
      "Booking has been approved successfully.",
    );
  };

  const handleReject = (bookingId) => {
    const reason = (reasonById[bookingId] || "").trim();
    if (!reason) {
      setError("Rejection reason is required.");
      return;
    }
    runAction(
      bookingId,
      () => rejectBooking(bookingId, reason),
      "Booking has been rejected.",
    );
  };

  const openCancelConfirm = (bookingId) => {
    setConfirmModal({
      isOpen: true,
      bookingId,
      bookingTitle: `Booking #${bookingId}`,
      action: () => cancelBooking(bookingId),
      actionType: "cancel",
      isLoading: false,
    });
  };

  const handleConfirmCancel = async () => {
    const { bookingId, action } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));

    await runAction(
      bookingId,
      action,
      "Booking has been cancelled successfully.",
    );

    setConfirmModal({
      isOpen: false,
      bookingId: null,
      bookingTitle: "",
      action: null,
      actionType: "",
      isLoading: false,
    });
  };

  const handleCancelModal = () => {
    setConfirmModal({
      isOpen: false,
      bookingId: null,
      bookingTitle: "",
      action: null,
      actionType: "",
      isLoading: false,
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={`Cancel ${confirmModal.bookingTitle}?`}
        message="This action cannot be undone. The approved booking will be cancelled and the resource will be freed."
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        confirmColor="red"
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelModal}
      />

      <RoleDashboardLayout
        sectionLabel="Admin Command Center"
        dashboardTitle="Booking Approvals"
        dashboardSubtitle="Review, approve, reject, and manage all resource bookings."
        roleLabel="ADMIN"
        auth={auth}
        sidebarItems={adminSidebar}
        hideDashboardWidgets={true}
        kpis={[
          {
            label: "Total Bookings",
            value: String(counts.total),
            change: "All time",
          },
          {
            label: "Pending",
            value: String(counts.pending),
            change: "Awaiting review",
          },
          {
            label: "Approved",
            value: String(counts.approved),
            change: "Active bookings",
          },
          {
            label: "Rejected",
            value: String(counts.rejected),
            change: "Declined requests",
          },
        ]}
        quickActions={[]}
        activityFeed={[
          {
            title: "Approve or reject pending requests",
            meta: "Instant status update",
          },
          { title: "Cancel approved bookings", meta: "Frees up the resource" },
          { title: "Rejection requires a reason", meta: "For audit trail" },
        ]}
        chartTitle="Booking Status"
        chartCaption="Distribution of booking statuses"
        chartColor="#ea580c"
        extraContent={
          <section className="dashboard-soft-in rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white to-slate-50/40 dark:from-slate-800 dark:to-slate-900/60 p-4 sm:p-5 shadow-sm ring-1 ring-slate-100/70 dark:ring-slate-700/40">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-700/80 pb-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  All Bookings
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Manage and review resource booking requests
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadBookings}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <UserRoundCog className="h-3.5 w-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-300 shadow-sm transition-all duration-300">
                ✕ {error}
              </div>
            )}
            {message && (
              <div className="mb-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 shadow-sm transition-all duration-300">
                ✓ {message}
              </div>
            )}

            {/* Status Filters and Search Bar */}
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      filter === status
                        ? "bg-orange-600 dark:bg-orange-500 text-white border-orange-600 dark:border-orange-500 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-orange-200 dark:hover:border-orange-600/60"
                    }`}
                  >
                    {status === "ALL" ? "All" : status}
                  </button>
                ))}
              </div>
              <div className="relative w-6/12">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-400 dark:focus:border-orange-600 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-700/40 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 p-8">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-700/70" />
                  <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-700/70" />
                  <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-700/70" />
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 py-12">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No bookings found for the selected filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const isPending = booking.status === "PENDING";
                  const isApproved = booking.status === "APPROVED";
                  const isBusy = busyId === booking.id;
                  const reason = reasonById[booking.id] || "";

                  return (
                    <div
                      key={booking.id}
                      className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 p-4 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/50 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            BOOKING ID
                          </p>
                          <BookingIdDisplay id={booking.id} />
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold ${statusStyles[booking.status] || "bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-100"}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-600/80 p-3 border border-slate-100 dark:border-slate-600/70 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            RESOURCE
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {booking.resourceId}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-600/80 p-3 border border-slate-100 dark:border-slate-600/70 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            ATTENDEES
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {booking.expectedAttendees}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-600/80 p-3 border border-slate-100 dark:border-slate-600/70 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            USER
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {booking.userId}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-600/80 p-3 border border-slate-100 dark:border-slate-600/70 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            START
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {formatDateTime(booking.startTime)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-600/80 p-3 border border-slate-100 dark:border-slate-600/70 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            END
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {formatDateTime(booking.endTime)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-lg border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-600/80 p-3">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          PURPOSE
                        </p>
                        <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                          {booking.purpose}
                        </p>
                      </div>

                      {(booking.approvedBy || booking.rejectionReason) && (
                        <div className="mt-2 rounded-lg border border-slate-100 dark:border-slate-600 bg-white/70 dark:bg-slate-700/70 p-3">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            ADMIN NOTES
                          </p>
                          {booking.approvedBy && (
                            <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                              Approved by:{" "}
                              <span className="font-semibold">
                                {booking.approvedBy}
                              </span>
                            </p>
                          )}
                          {booking.rejectionReason && (
                            <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                              Reason:{" "}
                              <span className="font-semibold">
                                {booking.rejectionReason}
                              </span>
                            </p>
                          )}
                        </div>
                      )}

                      {isPending && (
                        <div className="mt-3 rounded-lg border border-indigo-200 dark:border-indigo-700/70 bg-indigo-50/40 dark:bg-slate-800/50 p-3">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Rejection Reason (if rejecting)
                          </label>
                          <textarea
                            rows={2}
                            value={reason}
                            onChange={(e) =>
                              setReason(booking.id, e.target.value)
                            }
                            placeholder="Please provide a clear reason for rejection..."
                            className="mt-1.5 w-full rounded-md border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700/40 outline-none transition-all duration-200"
                          />
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              disabled={isBusy}
                              className="rounded-md bg-emerald-600 dark:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                            >
                              {isBusy ? "Processing..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              disabled={isBusy}
                              className="rounded-md bg-rose-600 dark:bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 dark:hover:bg-rose-600 disabled:opacity-60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                            >
                              {isBusy ? "Processing..." : "Reject"}
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => openCancelConfirm(booking.id)}
                            disabled={isBusy}
                            className="rounded-md border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            {isBusy ? "Processing..." : "Cancel"}
                          </button>
                        )}

                        {!isPending && !isApproved && (
                          <div className="rounded-md bg-slate-100 dark:bg-slate-600 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                            No more actions available
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        }
      />
    </>
  );
}
