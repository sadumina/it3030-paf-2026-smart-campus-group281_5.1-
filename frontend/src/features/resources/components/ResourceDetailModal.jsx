import { useMemo } from "react";

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

export default function ResourceDetailModal({ resource, isOpen, onClose }) {
  const availabilityWindows = useMemo(() => getAvailabilityWindows(resource), [resource]);

  if (!isOpen || !resource) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{resource.name}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{resource.type || "Resource"}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(resource.status)}`}>
            {String(resource.status || "ACTIVE").toUpperCase()}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">Location: {resource.location || "N/A"}</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">Capacity: {resource.capacity ?? "N/A"}</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">Availability: {resource.availability || "Available"}</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">Resource ID: {resource.id || "N/A"}</div>
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

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
