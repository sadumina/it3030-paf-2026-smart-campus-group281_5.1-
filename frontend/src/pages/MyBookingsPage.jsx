import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  X,
  LayoutDashboard,
  CalendarDays,
  TriangleAlert,
  CalendarClock,
  LifeBuoy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import StudentBookingForm from "../components/booking/StudentBookingForm";
import BookingDetailsModal from "../components/booking/BookingDetailsModal";
import { getAuth } from "../services/authStorage";
import { getMyBookings } from "../services/bookingService";

const statusClasses = {
  PENDING:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-900/20 dark:text-orange-300",
  APPROVED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-900/20 dark:text-emerald-300",
  REJECTED:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/20 dark:text-rose-300",
  CANCELLED:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300",
};

const userSidebar = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  {
    label: "My Bookings",
    badge: "7",
    icon: CalendarDays,
    path: "/dashboard/bookings",
  },
  { label: "New Reservation", icon: PlusCircle },
  { label: "Incident Reports", icon: TriangleAlert },
  { label: "Availability", icon: CalendarClock },
  { label: "Support", icon: LifeBuoy },
];

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const userIdentifier = auth?.id || auth?.email || "";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = async () => {
    if (!userIdentifier) {
      setError("Unable to determine user identity. Please sign in again.");
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getMyBookings(userIdentifier);
      setBookings(response.data || []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError.message ||
          "Failed to load your bookings.",
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [userIdentifier]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(
      (booking) => booking.status === "PENDING",
    ).length;
    const approved = bookings.filter(
      (booking) => booking.status === "APPROVED",
    ).length;
    const rejected = bookings.filter(
      (booking) => booking.status === "REJECTED",
    ).length;

    return { total, pending, approved, rejected };
  }, [bookings]);

  return (
    <>
      <RoleDashboardLayout
        sectionLabel="User Workspace"
        dashboardTitle="My Bookings"
        dashboardSubtitle="View your booking details and create new booking requests."
        roleLabel="USER"
        auth={auth}
        sidebarItems={userSidebar}
        hideDashboardWidgets={true}
        extraContent={
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-950/70 p-4 shadow-sm ring-1 ring-slate-100/70 dark:ring-slate-800/50 md:p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400">
                  User Workspace
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  My Bookings
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  View your booking details and create new booking requests.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadBookings}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-500/40 dark:hover:bg-slate-700"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-500 hover:to-orange-400 hover:shadow-orange-500/30"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Booking
                </button>
              </div>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/80">
                <p className="text-slate-500 dark:text-slate-400">Total</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-xl border border-orange-200/80 bg-orange-50/80 p-3 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-orange-500/30 dark:bg-orange-900/20">
                <p className="text-orange-700 dark:text-orange-300">Pending</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-orange-800 dark:text-orange-200">
                  {stats.pending}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/30 dark:bg-emerald-900/20">
                <p className="text-emerald-700 dark:text-emerald-300">
                  Approved
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200">
                  {stats.approved}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-rose-500/30 dark:bg-rose-900/20">
                <p className="text-rose-700 dark:text-rose-300">Rejected</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-rose-800 dark:text-rose-200">
                  {stats.rejected}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/70">
                <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2">
                  <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/70" />
                  <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/70" />
                </div>
              </div>
            ) : null}
            {error ? (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 shadow-sm dark:border-rose-500/40 dark:bg-rose-900/20 dark:text-rose-300">
                {error}
              </p>
            ) : null}

            {!loading && bookings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                No bookings found. Click Add Booking to create your first
                request.
              </div>
            ) : null}

            {!loading && bookings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {bookings.map((booking) => {
                  const status = booking.status || "PENDING";
                  // Extract just dates and times for shorter display
                  const startDate = booking.startTime
                    ? new Date(booking.startTime)
                    : null;
                  const displayDate =
                    startDate && !Number.isNaN(startDate.getTime())
                      ? startDate.toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                        })
                      : "-";
                  const displayTime =
                    startDate && !Number.isNaN(startDate.getTime())
                      ? startDate.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-";

                  return (
                    <article
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-200/70 dark:hover:border-orange-500/40 dark:border-slate-700/80 dark:bg-slate-800/90"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            {booking.resourceId}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3" />
                            {displayDate} <span className="mx-1">•</span>{" "}
                            <CalendarClock className="h-3 w-3" /> {displayTime}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition-transform duration-200 group-hover:scale-[1.02] ${statusClasses[status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                        >
                          {status}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        }
      />

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center items-end"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xl dark:border-slate-700/60 dark:bg-slate-900"
            >
              <div className="mb-2 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" /> Close
                </button>
              </div>
              <div className="overflow-y-auto pr-1 -mr-1">
                <StudentBookingForm
                  embedded
                  initialUserId={userIdentifier}
                  onClose={() => setShowAddModal(false)}
                  onSuccess={() => {
                    setShowAddModal(false);
                    loadBookings();
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingDetailsModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        statusClasses={statusClasses}
        formatDateTime={formatDateTime}
      />
    </>
  );
}
