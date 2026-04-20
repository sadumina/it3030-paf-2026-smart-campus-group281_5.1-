import { useEffect, useState } from "react";
import {
  Shield,
  ClipboardCheck,
  LayoutGrid,
  Users,
  Siren,
  ScrollText,
  BarChart3,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import ResourceCatalogueContent from "../features/resources/components/ResourceCatalogueContent";
import { fetchResources, updateResourceStatus } from "../services/resourceService";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid, path: "/admin/resources" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText },
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

  async function loadResources(activeGuard = () => true, silent = false) {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");
      const normalizedCapacity =
        filters.minCapacity === "" || Number.isNaN(Number(filters.minCapacity))
          ? ""
          : Number(filters.minCapacity);

      const data = await fetchResources({
        ...filters,
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

  async function handleStatusToggle(resource, nextStatus) {
    const updated = await updateResourceStatus(resource?.id, nextStatus);
    setResources((current) =>
      current.map((item) => (item.id === resource.id ? { ...item, ...updated } : item)),
    );
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
      quickActions={[]}
      activityFeed={[
        { title: "Use Edit for metadata corrections", meta: "Admin-only action" },
        { title: "Use status toggle for maintenance windows", meta: "ACTIVE / OUT_OF_SERVICE" },
        { title: "Filters apply across all resource cards", meta: "Type, location, capacity, status" },
      ]}
      chartTitle="Resource status trend"
      chartCaption="Overview context for matrix operations."
      chartColor="#ea580c"
      extraContent={
        <ResourceCatalogueContent
          resources={resources}
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
          error={error}
          isAdmin
          onStatusToggle={handleStatusToggle}
        />
      }
    />
  );
}
