import { useEffect, useState } from "react";
import { fetchResourceById } from "../../../services/resourceService";

function getStatusStyles(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ACTIVE") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
}

function getTypeStyles(type) {
  const normalized = String(type || "").toUpperCase();

  if (normalized === "LAB") {
    return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
  }

  if (normalized === "LECTURE HALL") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  }

  if (normalized === "EQUIPMENT") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  }

  if (normalized === "MEETING ROOM") {
    return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300";
  }

  return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
}

function getTypeLabel(resource) {
  if (resource.type) {
    return resource.type;
  }

  if (resource.category === "Laboratory") {
    return "Lab";
  }

  if (resource.category === "Study Space") {
    return "Lecture Hall";
  }

  return resource.category || "Resource";
}

function getStatusLabel(resource) {
  if (resource.status) {
    return String(resource.status).toUpperCase();
  }

  if (resource.availability === "Unavailable") {
    return "OUT_OF_SERVICE";
  }

  return "ACTIVE";
}

export default function ResourceCard({ resource, isAdmin = false, onEdit, onStatusToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [currentStatus, setCurrentStatus] = useState(getStatusLabel(resource));
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const typeLabel = getTypeLabel(resource);
  const capacityLabel = resource.capacity ?? "-";

  useEffect(() => {
    setCurrentStatus(getStatusLabel(resource));
  }, [resource]);

  async function handleViewDetails() {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
    if (details || !resource.id) {
      return;
    }

    try {
      setLoadingDetails(true);
      setDetailsError("");
      const fetched = await fetchResourceById(resource.id);
      setDetails(fetched);
    } catch (error) {
      setDetailsError(error.message || "Unable to load details.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleStatusToggle() {
    const nextStatus = currentStatus === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    setStatusError("");
    setStatusUpdating(true);
    try {
      if (onStatusToggle) {
        await onStatusToggle(resource, nextStatus);
      }
      setCurrentStatus(nextStatus);
    } catch (error) {
      setStatusError(error.message || "Unable to update status.");
    } finally {
      setStatusUpdating(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getTypeStyles(typeLabel)}`}
          >
            {typeLabel}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {resource.name}
          </h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(currentStatus)}`}>
          {currentStatus}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
          Location: {resource.location}
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
          Capacity: {capacityLabel}
        </div>
      </div>

      <button
        type="button"
        onClick={handleViewDetails}
        className="mt-4 inline-flex items-center rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
      >
        {isExpanded ? "Hide Details" : "View Details"}
      </button>

      {isAdmin ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onEdit?.(resource)}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={statusUpdating}
            className="inline-flex items-center rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
          >
            {statusUpdating
              ? "Updating..."
              : currentStatus === "ACTIVE"
                ? "Set Out of Service"
                : "Mark Active"}
          </button>
        </div>
      ) : null}
      {statusError ? (
        <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">{statusError}</p>
      ) : null}

      {isExpanded ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
          {loadingDetails ? <p className="text-slate-500 dark:text-slate-400">Loading details...</p> : null}
          {!loadingDetails && detailsError ? (
            <p className="text-rose-600 dark:text-rose-300">{detailsError}</p>
          ) : null}
          {!loadingDetails && !detailsError ? (
            <>
              <p className="text-slate-700 dark:text-slate-300">
                {details?.description || resource.description || "No extra details available."}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Resource ID: {details?.id || resource.id || "N/A"}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
