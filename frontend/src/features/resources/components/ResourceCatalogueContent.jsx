import ResourceCard from "./ResourceCard";
import ResourceFilterBar from "./ResourceFilterBar";

export default function ResourceCatalogueContent({
  resources,
  filters,
  onFilterChange,
  loading,
  error,
  isAdmin = false,
}) {
  return (
    <section className="space-y-4">
      <ResourceFilterBar filters={filters} onChange={onFilterChange} />

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-slate-700 dark:text-slate-300">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{resources.length}</span> resources
        </p>
        <p className="text-slate-500 dark:text-slate-400">Filters update automatically</p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          Loading resources...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {!loading && !error && resources.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          No resources matched your current search and filter values.
        </div>
      ) : null}

      {!loading && !error && resources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id || resource.name} resource={resource} isAdmin={isAdmin} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
