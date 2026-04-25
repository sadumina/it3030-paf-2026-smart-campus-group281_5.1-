import React, { useState, useEffect } from 'react';
import { createNotification } from '../services/advancedNotificationService';

export const NotificationPopup = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => handleClose(), notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const colorClasses = {
    red: 'border-red-300 bg-red-50',
    green: 'border-green-300 bg-green-50',
    blue: 'border-blue-300 bg-blue-50',
    orange: 'border-orange-300 bg-orange-50',
    slate: 'border-slate-300 bg-slate-50',
  };

  const iconClasses = {
    red: 'text-red-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    slate: 'text-slate-600',
  };

  const priorityIndicators = {
    critical: 'h-1 bg-red-600',
    high: 'h-1 bg-orange-500',
    normal: 'h-0.5 bg-blue-500',
    low: 'h-0.5 bg-slate-400',
  };

  const color = notification.color || 'slate';

  return (
    <div
      className={`transition-all duration-300 ${
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0'
      }`}
    >
      <div
        className={`border-l-4 rounded-lg shadow-lg p-4 mb-3 max-w-md ${
          colorClasses[color]
        } border-l-${color}-500`}
      >
        {/* Priority bar */}
        <div
          className={`absolute left-0 top-0 rounded-tl-lg ${priorityIndicators[notification.priority]}`}
          style={{
            width: '4px',
            height: notification.priority === 'critical' || notification.priority === 'high' ? '4px' : '2px',
          }}
        />

        <div className="flex items-start gap-3 pt-1">
          {/* Icon */}
          {notification.icon && (
            <div className={`text-lg ${iconClasses[color]} flex-shrink-0 mt-0.5`}>
              {notification.icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {notification.title}
            </h3>
            {notification.message && (
              <p className="text-gray-700 text-xs mt-1 line-clamp-2">
                {notification.message}
              </p>
            )}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className={`mt-2 text-xs font-medium text-${color}-600 hover:text-${color}-700 underline`}
              >
                {notification.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 text-${color}-400 hover:text-${color}-600 transition-colors`}
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
