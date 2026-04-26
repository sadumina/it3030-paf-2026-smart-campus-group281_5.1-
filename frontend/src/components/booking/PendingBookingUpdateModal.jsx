import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, X } from "lucide-react";

function toDateInputValue(booking) {
  if (!booking) return "";
  if (booking.date) return String(booking.date).slice(0, 10);

  const start = String(booking.startTime || "");
  if (start.includes("T")) {
    return start.slice(0, 10);
  }

  return "";
}

function toTimeInputValue(value) {
  const text = String(value || "");
  if (!text) return "";

  if (text.includes("T")) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${hour}:${minute}`;
    }
    const timePart = text.split("T")[1] || "";
    return timePart.slice(0, 5);
  }

  return text.slice(0, 5);
}

export default function PendingBookingUpdateModal({
  booking,
  isOpen,
  onClose,
  onSubmit,
  loading,
  errorMessage,
}) {
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen || !booking) return;

    setForm({
      date: toDateInputValue(booking),
      startTime: toTimeInputValue(booking.startTime),
      endTime: toTimeInputValue(booking.endTime),
      purpose: booking.purpose || "",
      expectedAttendees: Number(booking.expectedAttendees) || 1,
    });
    setLocalError("");
  }, [isOpen, booking]);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!form.date || !form.startTime || !form.endTime) {
      setLocalError("Date, start time, and end time are required.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setLocalError("End time must be after start time.");
      return;
    }

    if (Number(form.expectedAttendees) < 1) {
      setLocalError("Expected attendees must be at least 1.");
      return;
    }

    await onSubmit({
      date: form.date,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
      purpose: form.purpose.trim(),
      expectedAttendees: Number(form.expectedAttendees),
    });
  }

  return (
    <AnimatePresence>
      {isOpen && booking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center items-end"
          onClick={() => {
            if (!loading) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700/60 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700/80">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400">
                  Pending Booking
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Update Booking
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-2 text-xs text-orange-700 dark:border-orange-500/30 dark:bg-orange-900/20 dark:text-orange-300">
                Only bookings with status PENDING can be updated.
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  Date
                  <input
                    type="date"
                    min={minDate}
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-orange-900/40"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  Expected Attendees
                  <input
                    type="number"
                    min={1}
                    value={form.expectedAttendees}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        expectedAttendees: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-orange-900/40"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  Start Time
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startTime: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-orange-900/40"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  End Time
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        endTime: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-orange-900/40"
                  />
                </label>
              </div>

              <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                Purpose
                <textarea
                  rows={3}
                  value={form.purpose}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      purpose: event.target.value,
                    }))
                  }
                  placeholder="Purpose of this booking"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-orange-900/40"
                />
              </label>

              {(localError || errorMessage) && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/20 dark:text-rose-300">
                  {localError || errorMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:opacity-60"
                >
                  <Pencil className="h-4 w-4" />
                  {loading ? "Updating..." : "Update Booking"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
