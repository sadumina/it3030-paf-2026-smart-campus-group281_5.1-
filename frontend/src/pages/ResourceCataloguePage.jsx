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

  useEffect(() => {
    let active = true;
    const debounceTimer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const normalizedCapacity =
          filters.minCapacity === "" || Number.isNaN(Number(filters.minCapacity))
            ? ""
            : Number(filters.minCapacity);

        const data = await fetchResources({
          ...filters,
          minCapacity: normalizedCapacity,
        });

        if (active) {
          setResources(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load resources right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
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
