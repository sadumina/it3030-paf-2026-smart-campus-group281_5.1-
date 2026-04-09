import React, { useState, useCallback, useEffect } from 'react';
import { NotificationPopup } from './NotificationPopup';
import { notificationService } from '../services/advancedNotificationService';

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToNotifications((newNotification) => {
      addNotification(newNotification);
    });

    return unsubscribe;
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const notificationWithId = { ...notification, id };

    setNotifications((prev) => {
      // Keep max 5 notifications in stack
      const updated = [...prev, notificationWithId];
      return updated.slice(-5);
    });
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  }, []);

  // Sort by priority for display
  const sortedNotifications = [...notifications].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="flex flex-col gap-2">
        {sortedNotifications.map((notification) => (
          <NotificationPopup
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Expose addNotification globally for testing */}
      {typeof window !== 'undefined' && !window.notificationCenter && (
        (() => {
          window.notificationCenter = { addNotification };
          return null;
        })()
      )}
    </div>
  );
};
