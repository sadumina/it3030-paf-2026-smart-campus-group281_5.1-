import { useEffect, useRef, useState } from "react";
import { BellDot } from "lucide-react";
import { toast } from "react-toastify";
import NotificationPanel from "../NotificationPanel";
import { fetchUnreadCount } from "../../services/notificationService";

export default function DashboardNotificationBell({ enabled = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const previousUnreadCountRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let isDisposed = false;

    const loadUnreadCount = async () => {
      try {
        const unread = await fetchUnreadCount();
        if (!isDisposed) {
          const nextUnreadCount = unread.unreadCount || 0;
          const previousUnreadCount = previousUnreadCountRef.current;
          if (previousUnreadCount !== null && nextUnreadCount > previousUnreadCount) {
            toast.info("New campus alert received", {
              position: "top-right",
              autoClose: 2500,
            });
          }
          previousUnreadCountRef.current = nextUnreadCount;
          setUnreadCount(nextUnreadCount);
        }
      } catch {
        if (!isDisposed) {
          setUnreadCount(0);
        }
      }
    };

    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 12000);

    return () => {
      isDisposed = true;
      window.clearInterval(interval);
    };
  }, [enabled]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!enabled) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-orange-200 bg-orange-50 text-orange-700 transition hover:bg-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-orange-300 dark:hover:bg-slate-700"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <BellDot className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[10px] font-bold leading-none text-white shadow-lg shadow-orange-600/30">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-10 z-50">
          <NotificationPanel
            variant="dropdown"
            onClose={() => setIsOpen(false)}
            onChanged={(nextUnreadCount) => {
              previousUnreadCountRef.current = nextUnreadCount;
              setUnreadCount(nextUnreadCount);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
