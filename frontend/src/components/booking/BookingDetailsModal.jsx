import { Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingDetailsModal({
  booking,
  onClose,
  statusClasses,
  formatDateTime,
  onUpdatePending,
  onDeletePending,
  updateBusy = false,
  deleteBusy = false,
}) {
  const currentStatus = booking?.status || "PENDING";
  const isPending = currentStatus === "PENDING";

  return (
    <AnimatePresence>
      {booking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Booking Details
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusClasses[currentStatus] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                  >
                    {currentStatus}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 relative">
              <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
                <p className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
                  Resource
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {booking.resourceId}
                </p>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Booking ID
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {booking.id}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Student ID
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {booking.studentId || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Start Time
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {formatDateTime(booking.startTime)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    End Time
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {formatDateTime(booking.endTime)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Expected Attendees
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {booking.expectedAttendees || "-"}
                  </p>
                </div>
                <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Purpose
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {booking.purpose || "No purpose provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isPending
                    ? "This booking is pending. You can update or delete it."
                    : "Only pending bookings can be updated or deleted."}
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdatePending?.(booking)}
                        disabled={updateBusy || deleteBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-60 dark:border-orange-600/60 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {updateBusy ? "Updating..." : "Update"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePending?.(booking)}
                        disabled={updateBusy || deleteBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-700/60 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deleteBusy ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
