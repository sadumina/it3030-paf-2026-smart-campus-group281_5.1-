import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  LayoutGrid,
  ScrollText,
  Shield,
  Siren,
  Users,
  UserRoundCog,
  BarChart3,
  Sparkles,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { fetchAllUsers, removeUser, updateUserRole } from "../services/adminUserService";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { createNotification, notificationTypes, notificationPriorities } from "../services/advancedNotificationService";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Innovation Lab", icon: Sparkles, path: "/admin/innovation-lab", badge: "New" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText },
];

const ROLE_OPTIONS_ADMIN = ["USER", "TECHNICIAN"];
const ROLE_OPTIONS_SUPER_ADMIN = ["USER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN"];

function normalizeRole(role) {
  return (role || "USER").toUpperCase();
}

function canAdminManageRole(role) {
  const normalized = normalizeRole(role);
  return normalized === "USER" || normalized === "TECHNICIAN";
}

function isPrivilegedRole(role) {
  const normalized = normalizeRole(role);
  return normalized === "ADMIN" || normalized === "SUPER_ADMIN";
}

export default function AdminUsersPage() {
  const auth = getAuth();
  const actorRole = normalizeRole(auth?.role);
  const isSuperAdmin = actorRole === "SUPER_ADMIN";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleDrafts, setRoleDrafts] = useState({});
  const [actionMessage, setActionMessage] = useState("");
  const [activeTab, setActiveTab] = useState("standard");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, userName: null, isLoading: false });

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
    const superAdmins = users.filter((user) => (user.role || "").toUpperCase() === "SUPER_ADMIN").length;
    const technicians = users.filter((user) => (user.role || "").toUpperCase() === "TECHNICIAN").length;
    const regularUsers = users.filter((user) => (user.role || "").toUpperCase() === "USER").length;

    return { total, admins, superAdmins, technicians, regularUsers };
  }, [users]);

  const roleOptions = isSuperAdmin ? ROLE_OPTIONS_SUPER_ADMIN : ROLE_OPTIONS_ADMIN;

  const standardUsers = useMemo(
    () => users.filter((user) => !isPrivilegedRole(user.role)),
    [users]
  );

  const privilegedUsers = useMemo(
    () => users.filter((user) => isPrivilegedRole(user.role)),
    [users]
  );

  const displayedUsers = activeTab === "privileged" ? privilegedUsers : standardUsers;

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
      
      // Show success notification
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification('Role Updated', {
            type: notificationTypes.SUCCESS,
            message: `User role changed to ${nextRole}`,
            priority: notificationPriorities.NORMAL,
            duration: 4000,
            icon: '✓',
          })
        );
      }
    } catch (requestError) {
      const errorMsg = requestError.message || "Unable to update role";
      
      // Show error notification
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification('Update Failed', {
            type: notificationTypes.ERROR,
            message: errorMsg,
            priority: notificationPriorities.HIGH,
            duration: 0,
            icon: '✕',
          })
        );
      }
      setError(errorMsg);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    // Open confirmation modal instead of browser confirm
    setConfirmModal({
      isOpen: true,
      userId,
      userName,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    const { userId } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    setActionMessage("");
    
    try {
      await removeUser(userId);
      await loadUsers();
      setConfirmModal({ isOpen: false, userId: null, userName: null, isLoading: false });
      
      // Show success notification
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification('User Removed', {
            type: notificationTypes.SUCCESS,
            message: `${confirmModal.userName || 'User'} has been removed successfully`,
            priority: notificationPriorities.NORMAL,
            duration: 4000,
            icon: '✓',
          })
        );
      }
    } catch (requestError) {
      const errorMsg = requestError.message || "Unable to delete user";
      setConfirmModal({ isOpen: false, userId: null, userName: null, isLoading: false });
      
      // Show error notification
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification('Deletion Failed', {
            type: notificationTypes.ERROR,
            message: errorMsg,
            priority: notificationPriorities.HIGH,
            duration: 0,
            icon: '✕',
          })
        );
      }
      setError(errorMsg);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, userId: null, userName: null, isLoading: false });
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={`Delete ${confirmModal.userName}?`}
        message={`This action cannot be undone. The user account will be permanently removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="red"
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <RoleDashboardLayout
        sectionLabel={isSuperAdmin ? "Super Admin Command Center" : "Admin Command Center"}
        dashboardTitle="User Management"
        dashboardSubtitle={
          isSuperAdmin
            ? "Manage all accounts including ADMIN and SUPER_ADMIN roles."
            : "Manage USER and TECHNICIAN accounts."
        }
        roleLabel={actorRole}
        auth={auth}
        sidebarItems={adminSidebar}
        kpis={[
          { label: "Total Accounts", value: String(stats.total), change: "All registered users" },
          { label: "Super Admins", value: String(stats.superAdmins), change: "Highest privilege" },
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
              <h2 className="text-sm font-semibold text-slate-900">
                {activeTab === "privileged" ? "Admin and Super Admin Accounts" : "User and Technician Accounts"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                {activeTab === "privileged"
                  ? "High-privilege role management for platform governance"
                  : "Standard account management for day-to-day operations"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("standard")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "standard"
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Users and Technicians ({standardUsers.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isSuperAdmin) {
                    setActiveTab("privileged");
                  }
                }}
                disabled={!isSuperAdmin}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "privileged"
                    ? "border-purple-300 bg-purple-50 text-purple-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Admins and Super Admins ({privilegedUsers.length})
              </button>
              <button
                type="button"
                onClick={loadUsers}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <UserRoundCog className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {!isSuperAdmin ? (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Admin accounts can manage only USER and TECHNICIAN profiles. Privileged account management is SUPER_ADMIN only.
            </div>
          ) : null}

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
                  {displayedUsers.map((user) => {
                    const isSelf = user.id === auth?.id;
                    const selectedRole = roleDrafts[user.id] || (user.role || "USER").toUpperCase();
                    const targetRole = normalizeRole(user.role);
                    const canManageTarget = isSuperAdmin || canAdminManageRole(targetRole);
                    const canApplyRole = !isSelf && canManageTarget;
                    const canRemoveUser = !isSelf && canManageTarget;

                    const getRoleBadgeColor = (role) => {
                      const roleUpper = role.toUpperCase();
                      if (roleUpper === "SUPER_ADMIN") return "bg-rose-100 text-rose-700 border-rose-200";
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
                              disabled={!canApplyRole}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAssignRole(user.id)}
                              disabled={!canApplyRole}
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
                            disabled={!canRemoveUser}
                            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!displayedUsers.length ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                        {activeTab === "privileged"
                          ? "No admin or super admin accounts found."
                          : "No user or technician accounts found."}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
      />
    </>
  );
}
