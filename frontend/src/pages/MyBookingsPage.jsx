import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  PlusCircle,
  X,
  LayoutDashboard,
  CalendarDays,
  TriangleAlert,
  CalendarClock,
  LifeBuoy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import StudentBookingForm from "../components/booking/StudentBookingForm";
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
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  My Bookings
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  View your booking details and create new booking requests.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadBookings}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:from-orange-500 hover:to-orange-400"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Booking
                </button>
              </div>
            </div>

            <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Total</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm dark:border-orange-500/40 dark:bg-orange-900/20">
                <p className="text-orange-700 dark:text-orange-300">Pending</p>
                <p className="text-xl font-bold text-orange-800 dark:text-orange-200">
                  {stats.pending}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-500/40 dark:bg-emerald-900/20">
                <p className="text-emerald-700 dark:text-emerald-300">
                  Approved
                </p>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  {stats.approved}
                </p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-500/40 dark:bg-rose-900/20">
                <p className="text-rose-700 dark:text-rose-300">Rejected</p>
                <p className="text-xl font-bold text-rose-800 dark:text-rose-200">
                  {stats.rejected}
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading your bookings...
              </p>
            ) : null}
            {error ? (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/20 dark:text-rose-300">
                {error}
              </p>
            ) : null}

            {!loading && bookings.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                No bookings found. Click Add Booking to create your first
                request.
              </div>
            ) : null}

            {!loading && bookings.length > 0 ? (
              <div className="grid gap-3">
                {bookings.map((booking) => {
                  const status = booking.status || "PENDING";
                  return (
                    <article
                      key={booking.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {booking.resourceId}
                        </p>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300 md:grid-cols-2">
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            Booking ID:
                          </span>{" "}
                          {booking.id}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            Student ID:
                          </span>{" "}
                          {booking.studentId || "-"}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            Attendees:
                          </span>{" "}
                          {booking.expectedAttendees ?? "-"}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            Start:
                          </span>{" "}
                          {formatDateTime(booking.startTime)}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            End:
                          </span>{" "}
                          {formatDateTime(booking.endTime)}
                        </p>
                        <p className="md:col-span-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            Purpose:
                          </span>{" "}
                          {booking.purpose || "-"}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        }
      />

      {showAddModal ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" /> Close
              </button>
            </div>
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
        </div>
      ) : null}
    </>
  );
}
