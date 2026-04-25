import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  LayoutGrid,
  ScrollText,
  Shield,
  Siren,
  Sparkles,
  Users,
  AlertTriangle,
  Filter,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { fetchAllUsers } from "../services/adminUserService";

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

const LAST_LOGIN_RISK_DAYS = 14;

function getDaysSinceLogin(lastLoginAt) {
  const value = Number(lastLoginAt || 0);
  if (!value) {
    return null;
  }

  const msInDay = 24 * 60 * 60 * 1000;
  return Math.floor((Date.now() - value) / msInDay);
}

function getRiskInfo(profile) {
  const role = (profile?.role || "USER").toUpperCase();
  const days = getDaysSinceLogin(profile?.lastLoginAt);

  if (days === null) {
    return {
      level: "HIGH",
      reason: "No login recorded",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  }

  if (days > LAST_LOGIN_RISK_DAYS) {
    return {
      level: role === "SUPER_ADMIN" ? "HIGH" : "MEDIUM",
      reason: `Inactive for ${days} days`,
      className: role === "SUPER_ADMIN" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200",
    };
  }

  return {
    level: "LOW",
    reason: `Active ${days} day(s) ago`,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
}

export default function InnovationLabPage() {
  const auth = getAuth();
  const role = (auth?.role || "ADMIN").toUpperCase();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userLoadError, setUserLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoadingUsers(true);
        setUserLoadError("");
        const users = await fetchAllUsers();
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        setUserLoadError(error.message || "Unable to load privileged profiles");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadProfiles();
  }, []);

  const privilegedProfiles = useMemo(() => {
    const filtered = allUsers
      .filter((user) => {
        const normalizedRole = (user?.role || "").toUpperCase();
        return normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN";
      })
      .filter((user) => {
        const query = search.trim().toLowerCase();
        if (!query) {
          return true;
        }

        return (
          (user?.name || "").toLowerCase().includes(query) ||
          (user?.email || "").toLowerCase().includes(query)
        );
      })
      .filter((user) => {
        if (riskFilter === "ALL") {
          return true;
        }
        return getRiskInfo(user).level === riskFilter;
      })
      .sort((a, b) => {
        const aTime = Number(a?.lastLoginAt || 0);
        const bTime = Number(b?.lastLoginAt || 0);
        return bTime - aTime;
      });

    return filtered;
  }, [allUsers]);

  const riskSummary = useMemo(() => {
    return allUsers
      .filter((user) => {
        const normalizedRole = (user?.role || "").toUpperCase();
        return normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN";
      })
      .reduce(
        (acc, profile) => {
          const risk = getRiskInfo(profile);
          acc[risk.level] += 1;
          return acc;
        },
        { LOW: 0, MEDIUM: 0, HIGH: 0 }
      );
  }, [allUsers]);

  const activeInLast7Days = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return privilegedProfiles.filter((profile) => {
      const lastLoginAt = Number(profile?.lastLoginAt || 0);
      return lastLoginAt > 0 && now - lastLoginAt <= sevenDaysMs;
    }).length;
  }, [privilegedProfiles]);

  const suggestedActions = useMemo(() => {
    const actions = [];

    const highRiskProfiles = privilegedProfiles.filter((profile) => getRiskInfo(profile).level === "HIGH");
    if (highRiskProfiles.length > 0) {
      actions.push({
        title: `Review ${highRiskProfiles.length} high-risk privileged account(s)`,
        detail: "Accounts with no login record or long inactivity need immediate review.",
      });
    }

    const superAdmins = privilegedProfiles.filter((profile) => (profile.role || "").toUpperCase() === "SUPER_ADMIN");
    if (superAdmins.length === 1) {
      actions.push({
        title: "Only one SUPER_ADMIN detected",
        detail: "Create a second backup SUPER_ADMIN account for resilience.",
      });
    }

    if (actions.length === 0) {
      actions.push({
        title: "Privileged access posture is healthy",
        detail: "No urgent remediation required based on current activity.",
      });
    }

    return actions;
  }, [privilegedProfiles]);

  const formatLastLogin = (lastLoginAt) => {
    const value = Number(lastLoginAt || 0);
    if (!value) {
      return "No login record";
    }

    const date = new Date(value);
    return date.toLocaleString();
  };

  const formatLastLoginDay = (lastLoginAt) => {
    const value = Number(lastLoginAt || 0);
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString();
  };

  return (
    <RoleDashboardLayout
      sectionLabel={isSuperAdmin ? "Super Admin Innovation Lab" : "Admin Innovation Lab"}
      dashboardTitle="Smart User Management"
      dashboardSubtitle="Track privileged profiles, risk levels, and login activity with actionable insights."
      roleLabel={role}
      auth={auth}
      sidebarItems={adminSidebar}
      kpis={[
        { label: "Privileged Accounts", value: String(privilegedProfiles.length), change: "ADMIN + SUPER_ADMIN" },
        { label: "Active in 7 Days", value: String(activeInLast7Days), change: "Recently logged in" },
        { label: "High Risk", value: String(riskSummary.HIGH), change: "Needs immediate review" },
        { label: "Low Risk", value: String(riskSummary.LOW), change: "Healthy accounts" },
      ]}
      quickActions={[
        { title: "Review high-risk accounts", description: "Open flagged accounts and verify role necessity." },
        { title: "Confirm super admin redundancy", description: "Ensure at least two SUPER_ADMIN users exist." },
        { title: "Clean inactive privileged users", description: "Downgrade unused privileged accounts when needed." },
      ]}
      activityFeed={[
        { title: "Privileged profile visibility enabled", meta: "ADMIN + SUPER_ADMIN tracking" },
        { title: "Risk labels generated from login activity", meta: "Smart governance signal" },
        { title: "Suggested actions generated automatically", meta: "Operator guidance" },
      ]}
      chartTitle="Privileged account activity"
      chartCaption="Live posture view based on role and login freshness."
      chartColor="#ea580c"
      showInsightsPanel={false}
      extraContent={
        <div className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Privileged Profiles</h2>
                <p className="mt-1 text-xs text-slate-600">
                  ADMIN and SUPER_ADMIN profiles with last recorded login timestamps.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email"
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <label className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600">
                  <Filter className="h-3.5 w-3.5" />
                  <select
                    value={riskFilter}
                    onChange={(event) => setRiskFilter(event.target.value)}
                    className="bg-transparent text-xs outline-none"
                  >
                    <option value="ALL">All Risk</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
              </div>
            </div>

            {userLoadError ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {userLoadError}
              </div>
            ) : null}

            {loadingUsers ? (
              <div className="mt-4 py-8 text-center text-sm text-slate-500">Loading privileged profiles...</div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Risk</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Last Login Day</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Last Login Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Risk Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {privilegedProfiles.map((profile) => {
                      const normalizedRole = (profile?.role || "").toUpperCase();
                      const risk = getRiskInfo(profile);
                      const roleBadgeClass =
                        normalizedRole === "SUPER_ADMIN"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-purple-100 text-purple-700 border-purple-200";

                      return (
                        <tr key={profile.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{profile.name || "-"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{profile.email || "-"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${roleBadgeClass}`}>
                              {normalizedRole || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${risk.className}`}>
                              {risk.level}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700">{formatLastLoginDay(profile.lastLoginAt)}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{formatLastLogin(profile.lastLoginAt)}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{risk.reason}</td>
                        </tr>
                      );
                    })}
                    {!privilegedProfiles.length ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                          No ADMIN or SUPER_ADMIN profiles found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Smart Suggested Actions</h2>
            <p className="mt-1 text-xs text-slate-600">
              Recommendations are generated from current privileged account posture.
            </p>
            <div className="mt-4 space-y-3">
              {suggestedActions.map((action) => (
                <article key={action.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-orange-100 p-1.5 text-orange-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{action.title}</h3>
                      <p className="mt-1 text-xs text-slate-600">{action.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      }
    />
  );
}
