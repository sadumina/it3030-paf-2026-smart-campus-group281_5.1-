import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchResourceById } from "../../../services/resourceService";
import ResourceDetailModal from "./ResourceDetailModal";

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

export default function ResourceCard({
  resource,
  isAdmin = false,
  onEdit,
  onStatusChange,
  onDelete,
  actionLoading = false,
  actionError = "",
}) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [details, setDetails] = useState(null);

  const typeLabel = getTypeLabel(resource);
  const capacityLabel = resource.capacity ?? "-";
  const currentStatus = getStatusLabel(resource);

  async function handleViewDetails() {
    if (!resource.id) {
      setIsModalOpen(true);
      return;
    }

    try {
      const fetched = await fetchResourceById(resource.id);
      setDetails(fetched);
      setIsModalOpen(true);
    } catch {
      // Keep the flow simple: show card data if details API fails.
      setDetails(resource);
      setIsModalOpen(true);
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleViewDetails}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          View Details
        </button>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => navigate(`/dashboard/book-resource?resourceId=${encodeURIComponent(resource.id || "")}`)}
            disabled={currentStatus !== "ACTIVE"}
            className="inline-flex items-center rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Book This Resource
          </button>
        )}
      </div>

      <ResourceDetailModal
        resource={details || resource}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isAdmin={isAdmin}
        actionLoading={actionLoading}
        actionError={actionError}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </article>
  );
}
