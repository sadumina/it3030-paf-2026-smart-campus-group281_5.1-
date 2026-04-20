import { useEffect, useState } from "react";
import { getAuth } from "../services/authStorage";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import ResourceCatalogueContent from "../features/resources/components/ResourceCatalogueContent";
import { fetchResources } from "../services/resourceService";
import { userActivity, userActions, userKpis, userSidebar } from "../config/userDashboardConfig";

const defaultFilters = {
  type: "ALL",
  minCapacity: "",
  location: "",
  status: "ALL",
};

export default function ResourceCataloguePage() {
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
        setError(loadError.message || "Unable to load resources right now.");
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

  return (
    <RoleDashboardLayout
      sectionLabel="User Workspace"
      dashboardTitle="Resource Catalogue"
      dashboardSubtitle="Browse study spaces, labs, rooms, and equipment from one place."
      roleLabel="USER"
      auth={getAuth()}
      sidebarItems={userSidebar}
      kpis={userKpis}
      quickActions={userActions}
      activityFeed={userActivity}
      chartTitle="Resource demand snapshot"
      chartCaption="Live-style dashboard visuals with a dedicated catalogue below."
      chartColor="#fb923c"
      showNotifications={false}
      extraContent={
        <ResourceCatalogueContent
          resources={resources}
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
          error={error}
        />
      }
    />
  );
}
