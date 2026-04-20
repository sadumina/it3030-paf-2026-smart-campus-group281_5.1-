export default function ResourceFilterBar({
  filters,
  onChange,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Type
          </span>
          <select
            value={filters.type}
            onChange={(event) => onChange("type", event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Lab">Lab</option>
            <option value="Meeting Room">Meeting Room</option>
            <option value="Equipment">Equipment</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Minimum Capacity
          </span>
          <input
            type="number"
            min="0"
            value={filters.minCapacity}
            onChange={(event) => onChange("minCapacity", event.target.value)}
            placeholder="e.g. 30"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Location
          </span>
          <input
            type="text"
            value={filters.location}
            onChange={(event) => onChange("location", event.target.value)}
            placeholder="Search by location"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Status
          </span>
          <select
            value={filters.status}
            onChange={(event) => onChange("status", event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All</option>
            <option value="Active">Active</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </label>
      </div>
    </section>
  );
}
