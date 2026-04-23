import { useEffect, useState } from "react";
import {
  Shield,
  ClipboardCheck,
  LayoutGrid,
  Users,
  Siren,
  ScrollText,
  BarChart3,
  Plus,
  Sparkles,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import ResourceCatalogueContent from "../features/resources/components/ResourceCatalogueContent";
import ResourceFormModal from "../features/resources/components/ResourceFormModal";
import StatusChangeModal from "../features/resources/components/StatusChangeModal";
import { deleteResource, fetchResources } from "../services/resourceService";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck, path: "/admin/approvals" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid, path: "/admin/resources" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Innovation Lab", icon: Sparkles, path: "/admin/innovation-lab", badge: "New" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText, path: "/tickets", badge: "Tickets" },
];

const defaultFilters = {
  type: "ALL",
  minCapacity: "",
  location: "",
  status: "ALL",
};

export default function AdminResourceMatrixPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [statusChangeTarget, setStatusChangeTarget] = useState(null);
  const [formTarget, setFormTarget] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function loadResources(activeGuard = () => true, silent = false, filterSnapshot = filters) {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");
      const normalizedCapacity =
        filterSnapshot.minCapacity === "" || Number.isNaN(Number(filterSnapshot.minCapacity))
          ? ""
          : Number(filterSnapshot.minCapacity);

      const data = await fetchResources({
        ...filterSnapshot,
        minCapacity: normalizedCapacity,
      });

      if (activeGuard()) {
        setResources(data);
      }
    } catch (loadError) {
      if (activeGuard()) {
        setError(loadError.message || "Unable to load resource matrix.");
      }
    } finally {
      if (activeGuard() && !silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let active = true;
    const debounceTimer = setTimeout(() => {
      loadResources(() => active);
    }, 350);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [filters]);

  useEffect(() => {
    let active = true;
    const intervalId = setInterval(() => {
      loadResources(() => active, true);
    }, 5000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [filters]);

  function handleFilterChange(field, value) {
    const nextValue =
      field === "minCapacity" ? value.replace(/[^\d]/g, "") : value;

    setFilters((current) => ({
      ...current,
      [field]: nextValue,
    }));
  }


  function handleOpenStatusChange(resource) {
    if (!resource?.id) return;
    setStatusChangeTarget(resource);
  }

  function handleStatusChangeSuccess(updated) {
    setResources((current) =>
      current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
    );
    setStatusChangeTarget(null);
  }

  async function handleEditResource(resource) {
    if (!resource?.id) {
      return;
    }
    setFormTarget(resource);
    setIsFormOpen(true);
  }

  function handleCreateResource() {
    setFormTarget(null);
    setIsFormOpen(true);
  }

  async function handleResourceSaved(saved, { isEditMode } = {}) {
    setActionError("");

    if (isEditMode && saved?.id) {
      setResources((current) =>
        current.map((resource) => (resource.id === saved.id ? { ...resource, ...saved } : resource)),
      );
      return;
    }

    setFilters(defaultFilters);
    try {
      const data = await fetchResources(defaultFilters);
      setResources(data);
    } catch (requestError) {
      setActionError(requestError.message || "Resource saved, but the list could not refresh.");
    }
  }

  async function handleDeleteResource(resource) {
    if (!resource?.id) {
      return;
    }
    const confirmed = window.confirm(`Delete "${resource.name}"?`);
    if (!confirmed) {
      return;
    }

    setActionError("");
    setActionLoading(true);
    try {
      await deleteResource(resource.id);
      setResources((current) => current.filter((item) => item.id !== resource.id));
    } catch (requestError) {
      setActionError(requestError.message || "Unable to delete resource.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <RoleDashboardLayout
      sectionLabel="Admin Command Center"
      dashboardTitle="Resource Matrix"
      dashboardSubtitle="Manage resource details and operational status."
      roleLabel="ADMIN"
      auth={getAuth()}
      sidebarItems={adminSidebar}
      kpis={[
        { label: "Total Resources", value: String(resources.length), change: "Filtered live" },
        {
          label: "Active",
          value: String(resources.filter((resource) => String(resource.status || "").toUpperCase() === "ACTIVE").length),
          change: "Operational now",
        },
        {
          label: "Out Of Service",
          value: String(resources.filter((resource) => String(resource.status || "").toUpperCase() === "OUT_OF_SERVICE").length),
          change: "Needs attention",
        },
        { label: "Matrix Scope", value: "Campus", change: "All categories" },
      ]}
      quickActions={[
        {
          label: "Create Resource",
          icon: Plus,
          onClick: handleCreateResource,
          variant: "primary",
        },
      ]}
      activityFeed={[
        { title: "Use Edit for metadata corrections", meta: "Admin-only action" },
        { title: "Use status toggle for maintenance windows", meta: "ACTIVE / OUT_OF_SERVICE" },
        { title: "Filters apply across all resource cards", meta: "Type, location, capacity, status" },
      ]}
      chartTitle="Resource status trend"
      chartCaption="Overview context for matrix operations."
      chartColor="#ea580c"
      extraContent={
        <>
          <section className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Resource Matrix Controls</h2>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                  Create a new resource here, then manage status, edits, and bookings from the cards below.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateResource}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                <Plus className="h-4 w-4" />
                Create Resource
              </button>
            </div>
          </section>
          <ResourceCatalogueContent
            resources={resources}
            filters={filters}
            onFilterChange={handleFilterChange}
            loading={loading}
            error={error}
            isAdmin
            onEditResource={handleEditResource}
            onStatusChange={handleOpenStatusChange}
            onDeleteResource={handleDeleteResource}
            actionLoading={actionLoading}
            actionError={actionError}
          />
          <StatusChangeModal
            resource={statusChangeTarget}
            isOpen={statusChangeTarget !== null}
            onClose={() => setStatusChangeTarget(null)}
            onSuccess={handleStatusChangeSuccess}
          />
          <ResourceFormModal
            isOpen={isFormOpen}
            resource={formTarget}
            onClose={() => {
              setIsFormOpen(false);
              setFormTarget(null);
            }}
            onSaved={handleResourceSaved}
          />
        </>
      }
    />
  );
}
