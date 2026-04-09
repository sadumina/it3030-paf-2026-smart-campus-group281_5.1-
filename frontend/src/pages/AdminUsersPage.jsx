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
        <section className="dashboard-soft-in rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">All Users</h2>
              <p className="mt-0.5 text-xs text-slate-600">Manage user accounts and permissions</p>
            </div>
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <UserRoundCog className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {actionMessage ? (
            <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              ✓ {actionMessage}
            </div>
          ) : null}
          {error ? (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              ✕ {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Change Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => {
                    const isSelf = user.id === auth?.id;
                    const selectedRole = roleDrafts[user.id] || (user.role || "USER").toUpperCase();

                    const getRoleBadgeColor = (role) => {
                      const roleUpper = role.toUpperCase();
                      if (roleUpper === "ADMIN") return "bg-purple-100 text-purple-700 border-purple-200";
                      if (roleUpper === "TECHNICIAN") return "bg-blue-100 text-blue-700 border-blue-200";
                      return "bg-slate-100 text-slate-700 border-slate-200";
                    };

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-slate-900 font-medium">{user.name || "-"}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{user.email || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleBadgeColor((user.role || "USER").toUpperCase())}`}>
                            {(user.role || "USER").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={selectedRole}
                              onChange={(event) => handleRoleDraft(user.id, event.target.value)}
                              disabled={isSelf}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                              className="rounded-md bg-orange-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Apply
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.name || "this user")}
                            disabled={isSelf}
                            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
