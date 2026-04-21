import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { userActivity, userActions, userKpis, userSidebar } from "../config/userDashboardConfig";
import { getAuth } from "../services/authStorage";
import { fetchResourceBookingContext } from "../services/resourceService";

export default function ResourceBookingRedirectPage() {
  const [searchParams] = useSearchParams();
  const resourceId = searchParams.get("resourceId") || "";
  const [resource, setResource] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(resourceId));

  useEffect(() => {
    let active = true;

    async function loadBookingContext() {
      if (!resourceId) {
        setLoading(false);
        setError("Missing resource id.");
        return;
      }

      try {
        const data = await fetchResourceBookingContext(resourceId);
        if (active) {
          setResource(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load booking context.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookingContext();
    return () => {
      active = false;
    };
  }, [resourceId]);

  return (
    <RoleDashboardLayout
      sectionLabel="User Workspace"
      dashboardTitle="Resource Booking Handoff"
      dashboardSubtitle="Prepared booking details for Module B integration."
      roleLabel="USER"
      auth={getAuth()}
      sidebarItems={userSidebar}
      kpis={userKpis}
      quickActions={userActions}
      activityFeed={userActivity}
      chartTitle="Booking handoff status"
      chartCaption="This page is ready to connect with Module B booking form."
      chartColor="#fb923c"
      showNotifications={false}
      extraContent={
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Book This Resource</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Module B form is not linked yet. This page passes and loads the selected resource id.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {loading ? <p className="text-slate-600 dark:text-slate-300">Loading booking context...</p> : null}
            {!loading && error ? <p className="text-rose-600 dark:text-rose-300">{error}</p> : null}
            {!loading && !error ? (
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p>
                  <span className="font-semibold">Resource ID:</span> {resource?.id || resourceId}
                </p>
                <p>
                  <span className="font-semibold">Resource Name:</span> {resource?.name || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {String(resource?.status || "ACTIVE").toUpperCase()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Next step: connect this page to Module B booking form and reuse `resourceId` query param.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      }
    />
  );
}
