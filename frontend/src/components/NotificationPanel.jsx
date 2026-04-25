import { useEffect, useState } from "react";
import {
  createSeedNotification,
  fetchMyNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

export default function NotificationPanel({ variant = "panel", onClose, onChanged }) {
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
      onChanged?.(unread.unreadCount || 0);
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

  const isDropdown = variant === "dropdown";
  const containerClassName = isDropdown
    ? "w-[min(calc(100vw-2rem),24rem)] rounded-md border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/15"
    : "rounded-md border border-orange-100 bg-white p-5 shadow-sm";
  const listClassName = isDropdown
    ? "max-h-80 space-y-2 overflow-y-auto pr-1"
    : "space-y-2";

  return (
    <section className={containerClassName}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className={`${isDropdown ? "text-base" : "text-lg"} font-semibold text-slate-900`}>Notifications</h2>
          {isDropdown ? <p className="text-xs text-slate-500">Recent dashboard messages</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
            {unreadCount} unread
          </span>
          {isDropdown ? (
            <button
              type="button"
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              aria-label="Close notifications"
            >
              x
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={handleMarkAll}
          className="rounded-md bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700"
        >
          Mark all read
        </button>
        {!isDropdown ? (
          <button
            onClick={handleCreateDemo}
            className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700"
          >
            Create demo notification
          </button>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading notifications...</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {!loading && notifications.length === 0 ? (
        <p className="text-sm text-slate-500">No notifications yet.</p>
      ) : (
        <div className={listClassName}>
          {notifications.slice(0, isDropdown ? 8 : notifications.length).map((notification) => (
            <article
              key={notification.id}
              className={`rounded-md border p-3 ${
                notification.read ? "border-slate-200 bg-white" : "border-orange-200 bg-orange-50"
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
                    className="rounded-md border border-orange-300 bg-white px-2 py-1 text-xs font-semibold text-orange-700"
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
