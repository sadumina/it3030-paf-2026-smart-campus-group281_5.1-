function getStatusStyles(status) {
  if (status === "Active") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
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
    return resource.status;
  }

  if (resource.availability === "Unavailable") {
    return "Out of Service";
  }

  return "Active";
}

export default function ResourceCard({ resource }) {
  const typeLabel = getTypeLabel(resource);
  const statusLabel = getStatusLabel(resource);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-300">
            {typeLabel}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {resource.name}
          </h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(statusLabel)}`}>
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{resource.description}</p>

      <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
          Location: {resource.location}
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
          Capacity: {resource.capacity ?? "-"}
        </div>
      </div>
    </article>
  );
}
