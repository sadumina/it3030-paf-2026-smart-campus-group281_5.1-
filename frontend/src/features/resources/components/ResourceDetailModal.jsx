import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

function getStatusStyles(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ACTIVE") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  }
  return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
}

function getAvailabilityWindows(resource) {
  const windows = resource?.availabilityWindows;
  if (Array.isArray(windows) && windows.length > 0) {
    return windows;
  }
  return ["Mon-Fri: 8:00 AM - 6:00 PM"];
}

export default function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  isAdmin = false,
  actionLoading = false,
  actionError = "",
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const navigate = useNavigate();
  const availabilityWindows = useMemo(() => getAvailabilityWindows(resource), [resource]);

  if (!isOpen || !resource) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{resource.name}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{resource.type || "Resource"}</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(resource.status)}`}>
              {String(resource.status || "ACTIVE").toUpperCase()}
            </span>
            {resource.statusReason && String(resource.status || "ACTIVE").toUpperCase() === "OUT_OF_SERVICE" && (
              <span className="text-xs italic text-rose-500 max-w-[250px] leading-tight">
                {resource.statusReason}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">Location: {resource.location || "N/A"}</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">Capacity: {resource.capacity ?? "N/A"}</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">Availability: {resource.availability || "Available"}</div>
          <div className="break-all rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
            Resource ID: {resource.id || "N/A"}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Availability Windows</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {availabilityWindows.map((windowItem) => (
              <li key={windowItem}>- {windowItem}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Description</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {resource.description || "No additional details available."}
          </p>
        </div>

        {isAdmin ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onEdit?.(resource)}
              disabled={actionLoading}
              className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onStatusChange?.(resource)}
              disabled={actionLoading}
              className="inline-flex items-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              Change Status
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(resource)}
              disabled={actionLoading}
              className="inline-flex items-center rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
            >
              Delete
            </button>
          </div>
        ) : null}

        {!isAdmin ? (
          <div className="mt-5 border-t border-slate-200 pt-3 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/book-resource?resourceId=${encodeURIComponent(resource.id || "")}`)}
              className="inline-flex items-center rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
            >
              Book This Resource
            </button>
          </div>
        ) : null}

        {actionError ? (
          <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">{actionError}</p>
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
