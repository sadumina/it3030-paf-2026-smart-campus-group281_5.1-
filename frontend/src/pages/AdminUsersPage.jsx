import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  LayoutGrid,
  ScrollText,
  Shield,
  Siren,
  Users,
  UserRoundCog,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { fetchAllUsers, removeUser, updateUserRole } from "../services/adminUserService";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck },
  { label: "Resource Matrix", icon: LayoutGrid },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText },
];

const ROLE_OPTIONS = ["USER", "TECHNICIAN", "ADMIN"];

export default function AdminUsersPage() {
  const auth = getAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleDrafts, setRoleDrafts] = useState({});
  const [actionMessage, setActionMessage] = useState("");

  const loadUsers = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);

      const drafts = data.reduce((acc, user) => {
        acc[user.id] = (user.role || "USER").toUpperCase();
        return acc;
      }, {});
      setRoleDrafts(drafts);
    } catch (requestError) {
      setError(requestError.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => (user.role || "").toUpperCase() === "ADMIN").length;
    const technicians = users.filter((user) => (user.role || "").toUpperCase() === "TECHNICIAN").length;
    const regularUsers = users.filter((user) => (user.role || "").toUpperCase() === "USER").length;

    return { total, admins, technicians, regularUsers };
  }, [users]);

  const handleRoleDraft = (userId, nextRole) => {
    setRoleDrafts((previous) => ({
      ...previous,
      [userId]: nextRole,
    }));
  };

  const handleAssignRole = async (userId) => {
    setActionMessage("");
    try {
      const nextRole = roleDrafts[userId] || "USER";
      await updateUserRole(userId, nextRole);
      await loadUsers();
      setActionMessage("User role updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update role");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(`Delete ${userName}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setActionMessage("");
    try {
      await removeUser(userId);
      await loadUsers();
      setActionMessage("User removed successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete user");
    }
  };

  return (
    <RoleDashboardLayout
      sectionLabel="Admin Command Center"
      dashboardTitle="User Management"
      dashboardSubtitle="View all accounts, update roles, and remove users."
      roleLabel="ADMIN"
      auth={auth}
      sidebarItems={adminSidebar}
      kpis={[
        { label: "Total Accounts", value: String(stats.total), change: "All registered users" },
        { label: "Admins", value: String(stats.admins), change: "Privileged access" },
        { label: "Technicians", value: String(stats.technicians), change: "Support staff" },
        { label: "Users", value: String(stats.regularUsers), change: "Standard accounts" },
      ]}
      quickActions={[]}
      activityFeed={[
        { title: "Use role assign to update access instantly", meta: "Role changes are JWT-based" },
        { title: "Delete removes account permanently", meta: "Use with caution" },
        { title: "Current admin cannot be deleted", meta: "Self-protection enabled" },
      ]}
      chartTitle="User trend"
      chartCaption="Live account activity trend."
      chartColor="#ea580c"
      extraContent={
        <section className="dashboard-soft-in rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_14px_28px_rgba(251,146,60,0.12)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-slate-900">All Users</h2>
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-campusOrange-700"
            >
              <UserRoundCog className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {actionMessage ? <p className="mb-3 text-xs font-semibold text-emerald-700">{actionMessage}</p> : null}
          {error ? <p className="mb-3 text-xs font-semibold text-red-600">{error}</p> : null}

          {loading ? (
            <p className="text-sm text-slate-500">Loading users...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-orange-100">
              <table className="min-w-full divide-y divide-orange-100 text-sm">
                <thead className="bg-orange-50/70">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Current Role</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Assign Role</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 bg-white">
                  {users.map((user) => {
                    const isSelf = user.id === auth?.id;
                    const selectedRole = roleDrafts[user.id] || (user.role || "USER").toUpperCase();

                    return (
                      <tr key={user.id}>
                        <td className="px-3 py-2 text-slate-800">{user.name || "-"}</td>
                        <td className="px-3 py-2 text-slate-600">{user.email || "-"}</td>
                        <td className="px-3 py-2">
                          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-campusOrange-700">
                            {(user.role || "USER").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole}
                              onChange={(event) => handleRoleDraft(user.id, event.target.value)}
                              disabled={isSelf}
                              className="rounded-lg border border-orange-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                            >
                              {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAssignRole(user.id)}
                              disabled={isSelf}
                              className="rounded-lg bg-campusOrange-600 px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.name || "this user")}
                            disabled={isSelf}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
    />
  );
}
