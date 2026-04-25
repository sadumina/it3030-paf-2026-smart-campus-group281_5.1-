import React, { useState, useCallback } from 'react';
import { NotificationCenter } from '../components/NotificationCenter';
import { NotificationPanelUpdated as NotificationPanel } from '../components/NotificationPanelUpdated';
import { createNotification, notificationTypes, notificationPriorities } from '../services/advancedNotificationService';

/**
 * DashboardPage - Main dashboard with integrated notification system
 * 
 * Features:
 * - Real-time notification delivery via NotificationCenter
 * - Notification panel for history and management
 * - Quick action buttons to trigger test notifications
 * - Priority-based notification handling (critical, high, normal, low)
 * 
 * Usage:
 * - Click the bell icon to open/close the notification panel
 * - Notifications appear as toast popups in the top-right corner
 * - Each notification auto-dismisses based on priority (if duration set)
 * - Click notification actions to perform quick tasks
 */

export const DashboardPageWithNotifications = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [testNotificationCount, setTestNotificationCount] = useState(0);

  const handleShowNotification = useCallback((type, priority = 'normal') => {
    const notificationConfig = {
      alerts: {
        title: 'Lab Booking Alert',
        message: 'Lab B05 booking is about to start in 15 minutes',
        type: notificationTypes.ALERT,
        icon: '⏰',
        duration: 0, // Manual dismiss required
        action: {
          label: 'Go to Lab',
          onClick: () => console.log('Navigate to lab booking'),
        },
      },
      success: {
        title: 'Booking Successful',
        message: 'Your lab booking has been confirmed for tomorrow',
        type: notificationTypes.SUCCESS,
        icon: '✓',
        duration: 5000,
      },
      announcement: {
        title: 'New Announcement',
        message: 'Campus will be closed for maintenance on Dec 25',
        type: notificationTypes.ANNOUNCEMENT,
        icon: '📢',
        duration: 0,
      },
      error: {
        title: 'Booking Failed',
        message: 'Unable to complete your booking. Please try again.',
        type: notificationTypes.ERROR,
        icon: '✕',
        duration: 5000,
      },
      warning: {
        title: 'Attention Required',
        message: 'Your session will expire in 5 minutes',
        type: notificationTypes.WARNING,
        icon: '⚠',
        duration: 0,
      },
    };

    const config = notificationConfig[type] || notificationConfig.success;
    const notification = createNotification(config.title, {
      ...config,
      priority,
    });

    if (window.notificationCenter) {
      window.notificationCenter.addNotification(notification);
      setTestNotificationCount((prev) => prev + 1);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Notification System */}
      <NotificationCenter />
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campus Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, manage your campus activities
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {testNotificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {testNotificationCount > 9 ? '9+' : testNotificationCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                U
              </div>
              <span className="text-sm font-medium text-gray-900">User</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: '12', icon: '📚' },
            { label: 'Pending Approvals', value: '3', icon: '⏳' },
            { label: 'Active Resources', value: '8', icon: '🏢' },
            { label: 'Notifications', value: testNotificationCount, icon: '📢' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <span className="text-3xl opacity-50">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Testing Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Notification System Demo
          </h2>

          <div className="space-y-4">
            {/* Type Examples */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Notification Types
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'alerts', label: 'Alert' },
                  { type: 'success', label: 'Success' },
                  { type: 'announcement', label: 'Announcement' },
                  { type: 'error', label: 'Error' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleShowNotification(item.type)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                  >
                    Show {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Examples */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                By Priority
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { priority: 'critical', label: '🔴 Critical' },
                  { priority: 'high', label: '🟠 High' },
                  { priority: 'normal', label: '🔵 Normal' },
                  { priority: 'low', label: '⚪ Low' },
                ].map((item) => (
                  <button
                    key={item.priority}
                    onClick={() =>
                      handleShowNotification('alerts', item.priority)
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Notifications */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Advanced
              </h3>
              <button
                onClick={() => {
                  handleShowNotification('alerts', 'critical');
                  handleShowNotification('success', 'high');
                  handleShowNotification('warning', 'normal');
                }}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
              >
                Send Batch (3 notifications)
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Tip:</span> Notifications appear in
                the top-right corner. Click on the bell icon to view notification
                history. The counter badge shows total notifications sent in this
                session.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              title: 'Real-Time Updates',
              description: 'Get instant notifications about important campus events',
              icon: '⚡',
            },
            {
              title: 'Priority Handling',
              description: 'Critical alerts take precedence and stay visible longer',
              icon: '📊',
            },
            {
              title: 'Persistent History',
              description: 'Access your full notification history in the side panel',
              icon: '📋',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPageWithNotifications;
