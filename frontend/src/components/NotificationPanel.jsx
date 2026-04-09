import { useEffect, useState } from "react";
import {
  createSeedNotification,
  fetchMyNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const [items, unread] = await Promise.all([
        fetchMyNotifications(),
        fetchUnreadCount(),
      ]);
      setNotifications(items);
      setUnreadCount(unread.unreadCount || 0);
    } catch (requestError) {
      setError(requestError.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Unable to mark as read");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Unable to mark all as read");
    }
  };

  const handleCreateDemo = async () => {
    try {
      await createSeedNotification({
        type: "SYSTEM",
        title: "Workflow update",
        message: "Your smart campus workflow has a new event.",
        referenceType: "DASHBOARD",
        referenceId: "DEMO",
      });
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Unable to create demo notification");
    }
  };

  return (
    <section className="rounded-2xl border border-orange-200 bg-white p-5 shadow-[0_14px_30px_rgba(251,146,60,0.12)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        <span className="rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-xs font-semibold text-campusOrange-700">
          {unreadCount} unread
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={handleMarkAll}
          className="rounded-lg bg-campusOrange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-campusOrange-700"
        >
          Mark all read
        </button>
        <button
          onClick={handleCreateDemo}
          className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-campusOrange-700"
        >
          Create demo notification
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading notifications...</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {!loading && notifications.length === 0 ? (
        <p className="text-sm text-slate-500">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-xl border p-3 ${
                notification.read ? "border-orange-100 bg-orange-50/40" : "border-orange-200 bg-orange-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="text-sm text-slate-600">{notification.message}</p>
                </div>
                {!notification.read ? (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="rounded-lg border border-orange-300 bg-white px-2 py-1 text-xs font-semibold text-campusOrange-700"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
