import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingDetailsModal({
  booking,
  onClose,
  statusClasses,
  formatDateTime,
}) {
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
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusClasses[booking.status || "PENDING"] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                  >
                    {booking.status || "PENDING"}
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
            <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}