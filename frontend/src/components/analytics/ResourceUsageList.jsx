function ResourceRow({ resource, index }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-orange-200 hover:shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            #{index + 1} Resource
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {resource.resourceId}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-orange-600">{resource.total}</p>
          <p className="text-[11px] text-slate-500">bookings</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
          Approved: {resource.approved}
        </span>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
          Rejected: {resource.rejected}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
          Cancelled: {resource.cancelled}
        </span>
      </div>
    </article>
  );
}

export default function ResourceUsageList({ resourceUsage = [] }) {
  if (!resourceUsage.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Most Used Resources
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          No booking data available for resources.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Most Used Resources
        </h2>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
          Top {resourceUsage.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {resourceUsage.map((resource, index) => (
          <ResourceRow
            key={resource.resourceId}
            resource={resource}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
