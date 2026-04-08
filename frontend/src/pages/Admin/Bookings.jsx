import { useEffect, useMemo, useState } from "react";
import {
  approveBooking,
  cancelBooking,
  getAllBookings,
  rejectBooking,
} from "../../services/bookingService";

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-200 text-slate-700 border-slate-300",
};

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookingCard({
  booking,
  onApprove,
  onReject,
  onCancel,
  reason,
  onReasonChange,
  loadingId,
}) {
  const isPending = booking.status === "PENDING";
  const isApproved = booking.status === "APPROVED";
  const isBusy = loadingId === booking.id;

  return (
    <article className="rounded-3xl border border-white/10 bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-sm overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Booking ID
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 break-all">
              {booking.id}
            </h3>
          </div>
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[booking.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}
          >
            {booking.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Resource
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {booking.resourceId}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              User
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {booking.userId}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Start
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDateTime(booking.startTime)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              End
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDateTime(booking.endTime)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Purpose
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {booking.purpose}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Expected attendees
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {booking.expectedAttendees ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>

        {(booking.approvedBy || booking.rejectionReason) && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Admin notes
            </p>
            {booking.approvedBy && (
              <p className="mt-1 text-sm text-slate-700">
                Approved by:{" "}
                <span className="font-semibold text-slate-900">
                  {booking.approvedBy}
                </span>
              </p>
            )}
            {booking.rejectionReason && (
              <p className="mt-1 text-sm text-slate-700">
                Rejection reason:{" "}
                <span className="font-semibold text-slate-900">
                  {booking.rejectionReason}
                </span>
              </p>
            )}
          </div>
        )}

        {isPending && (
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <label className="block text-sm font-semibold text-slate-700">
              Rejection reason
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(event) =>
                onReasonChange(booking.id, event.target.value)
              }
              placeholder="Explain why this request is being rejected"
              className="mt-2 w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400"
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {isPending && (
            <>
              <button
                onClick={() => onApprove(booking.id)}
                disabled={isBusy}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "Updating..." : "Approve"}
              </button>
              <button
                onClick={() => onReject(booking.id)}
                disabled={isBusy}
                className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "Updating..." : "Reject"}
              </button>
            </>
          )}

          {isApproved && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={isBusy}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? "Updating..." : "Cancel approved booking"}
            </button>
          )}

          {!isPending && !isApproved && (
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Final status only. No admin action available.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [reasonById, setReasonById] = useState({});
  const [busyId, setBusyId] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllBookings();
      setBookings(response.data);
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
    if (filter === "ALL") {
      return bookings;
    }

    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const counts = useMemo(() => {
    return bookings.reduce(
      (accumulator, booking) => {
        accumulator.total += 1;
        accumulator[booking.status.toLowerCase()] += 1;
        return accumulator;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 },
    );
  }, [bookings]);

  const setReason = (bookingId, value) => {
    setReasonById((current) => ({
      ...current,
      [bookingId]: value,
    }));
  };

  const runAction = async (bookingId, action) => {
    setBusyId(bookingId);
    setError("");
    setMessage("");

    try {
      await action();
      setMessage("Booking updated successfully.");
      setReasonById((current) => {
        const next = { ...current };
        delete next[bookingId];
        return next;
      });
      await loadBookings();
    } catch (actionError) {
      setError(
        actionError.response?.data?.message ||
          actionError.response?.data ||
          "Unable to update booking.",
      );
    } finally {
      setBusyId("");
    }
  };

  const handleApprove = (bookingId) => {
    return runAction(bookingId, () => approveBooking(bookingId));
  };

  const handleReject = (bookingId) => {
    const reason = (reasonById[bookingId] || "").trim();
    if (!reason) {
      setError("A rejection reason is required.");
      return Promise.resolve();
    }

    return runAction(bookingId, () => rejectBooking(bookingId, reason));
  };

  const handleCancel = (bookingId) => {
    return runAction(bookingId, () => cancelBooking(bookingId));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_55%,_#111827_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/50">
              Admin console
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Booking Review Board
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Review incoming requests, keep pending bookings moving through the
              workflow, and cancel approved bookings when needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loadBookings()}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              Refresh
            </button>
            <button
              onClick={() => window.location.assign("/booking")}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Back to booking page
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total", value: counts.total },
            { label: "Pending", value: counts.pending },
            { label: "Approved", value: counts.approved },
            { label: "Rejected", value: counts.rejected },
            { label: "Cancelled", value: counts.cancelled },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-black">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === status
                  ? "border-white bg-white text-slate-900"
                  : "border-white/15 bg-white/10 text-white/75 hover:bg-white/15"
              }`}
            >
              {status === "ALL" ? "All bookings" : status}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-white/70 backdrop-blur-sm">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-white/70 backdrop-blur-sm">
            No bookings found for this filter.
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                reason={reasonById[booking.id] || ""}
                onReasonChange={setReason}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                loadingId={busyId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
