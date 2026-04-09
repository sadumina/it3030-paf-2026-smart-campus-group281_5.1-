export const notificationTypes = {
  ALERT: 'alerts',
  MESSAGE: 'messages',
  ANNOUNCEMENT: 'announcements',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const notificationPriorities = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const createNotification = (title, config = {}) => ({
  title,
  type: config.type || notificationTypes.INFO,
  priority: config.priority || notificationPriorities.NORMAL,
  icon: config.icon || null,
  message: config.message || '',
  action: config.action || null,
  duration: config.duration || null,
  color: config.color || getColorByType(config.type),
});

const getColorByType = (type) => {
  const colorMap = {
    [notificationTypes.ALERT]: 'red',
    [notificationTypes.MESSAGE]: 'blue',
    [notificationTypes.ANNOUNCEMENT]: 'green',
    [notificationTypes.SUCCESS]: 'green',
    [notificationTypes.ERROR]: 'red',
    [notificationTypes.WARNING]: 'orange',
    [notificationTypes.INFO]: 'slate',
  };
  return colorMap[type] || 'slate';
};

export const notificationService = {
  // WebSocket simulation - in production, connect to real WebSocket
  subscribeToNotifications: (callback) => {
    // Simulate real-time notifications every 30 seconds
    const interval = setInterval(() => {
      const mockNotifications = [
        createNotification('New approval pending', {
          type: notificationTypes.ALERT,
          priority: notificationPriorities.HIGH,
          message: 'Lab B05 booking request awaiting your review',
        }),
        createNotification('System update completed', {
          type: notificationTypes.ANNOUNCEMENT,
          priority: notificationPriorities.NORMAL,
          message: 'Campus operations dashboard v2.1 deployed',
        }),
        createNotification('Incident escalated', {
          type: notificationTypes.ALERT,
          priority: notificationPriorities.CRITICAL,
          message: 'Building C cooling system requires immediate attention',
        }),
      ];

      const randomNotif = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      if (Math.random() > 0.7) {
        callback(randomNotif);
      }
    }, 30000);

    return () => clearInterval(interval);
  },

  sendNotification: (notification) => {
    // In production: api.post('/notifications/send', notification)
    console.log('Notification:', notification);
  },

  // Batch notifications
  sendBatch: (notifications) => {
    // In production: api.post('/notifications/batch', notifications)
    notifications.forEach(notif => notificationService.sendNotification(notif));
  },
};
