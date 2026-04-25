# Smart Campus Notification System

## Overview

The Smart Campus notification system is a comprehensive, production-ready solution for delivering real-time notifications to users across the campus platform. It features:

- **Multi-type notifications** (alerts, messages, announcements, success, error, warning, info)
- **Priority-based delivery** (critical, high, normal, low)
- **Real-time updates** via WebSocket subscription (mock implementation ready)
- **Toast notifications** with auto-dismiss and manual control
- **Persistent notification panel** with filtering and history
- **Type-safe notification creation** with standardized configuration

---

## Architecture

### Components

```
NotificationCenter
├── manages global notification state
├── subscribes to real-time updates
└── renders NotificationPopup stack

NotificationPopup
├── displays individual notifications
├── handles auto-dismiss based on priority
├── shows priority indicators
└── provides action buttons

NotificationPanel
├── displays notification history
├── supports filtering (all, unread, alerts)
├── manages read/unread status
└── allows batch operations
```

### Services

- **advancedNotificationService.js** - Handles notification creation, types, priorities, and WebSocket subscription logic

---

## Quick Start

### 1. Add to Your Layout

Include `NotificationCenter` at the root of your application (e.g., in `App.jsx`):

```jsx
import { NotificationCenter } from './components/NotificationCenter';

function App() {
  return (
    <div>
      <NotificationCenter />
      {/* Your app routes */}
    </div>
  );
}
```

### 2. Import and Use

In any component:

```jsx
import { createNotification, notificationTypes, notificationPriorities } from '../services/advancedNotificationService';

// Example: Show a success notification
const handleSuccess = () => {
  const notification = createNotification('Booking Confirmed', {
    type: notificationTypes.SUCCESS,
    message: 'Your lab booking has been created',
    priority: notificationPriorities.HIGH,
    duration: 5000, // Auto-dismiss after 5 seconds
    icon: '✓',
  });
  
  window.notificationCenter.addNotification(notification);
};
```

### 3. Add Notification Panel (Optional)

For a persistent notification history panel:

```jsx
import { NotificationPanel } from './components/NotificationPanel';
import { useState } from 'react';

function Dashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsPanelOpen(!isPanelOpen)}>
        Notifications
      </button>
      <NotificationPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  );
}
```

---

## API Reference

### `createNotification(title, config)`

Creates a standardized notification object.

**Parameters:**
- `title` (string, required) - Main notification title
- `config` (object, optional):
  - `type` - Notification type (see types below)
  - `priority` - Priority level (see priorities below)
  - `message` - Additional description text
  - `icon` - Emoji or icon character
  - `duration` - Auto-dismiss time in ms (null = manual dismiss only)
  - `color` - Override color scheme
  - `action` - Action object `{ label: string, onClick: function }`

**Returns:** Notification object

**Example:**
```jsx
const notification = createNotification('Lab Available', {
  type: notificationTypes.ALERT,
  priority: notificationPriorities.HIGH,
  message: 'Lab B05 is now available for booking',
  duration: 0, // Manual dismiss
  icon: '🔔',
  action: {
    label: 'Book Now',
    onClick: () => navigate('/labs'),
  },
});
```

---

## Notification Types

```javascript
notificationTypes = {
  ALERT: 'alerts',           // Important alerts needing attention
  MESSAGE: 'messages',       // User messages
  ANNOUNCEMENT: 'announcements', // Broadcast announcements
  SUCCESS: 'success',        // Success confirmations
  ERROR: 'error',            // Error messages
  WARNING: 'warning',        // Warning notifications
  INFO: 'info',              // General info
}
```

**Visual Examples:**
- **Alert**: Red border, red icon, urgent feel
- **Success**: Green border, green icon, positive feel
- **Warning**: Orange border, orange icon, cautionary feel
- **Info**: Gray border, gray icon, neutral feel

---

## Priority Levels

```javascript
notificationPriorities = {
  LOW: 'low',           // Background color (0.5px bar)
  NORMAL: 'normal',     // Default (0.5px bar)
  HIGH: 'high',         // Orange (1px bar) - stays longer
  CRITICAL: 'critical', // Red (1px bar) - stays longest
}
```

**Behavior:**
```
Critical:  4px red bar top, never auto-dismisses
High:      3px orange bar top, long auto-dismiss (8s)
Normal:    2px blue bar top, medium auto-dismiss (5s)
Low:       1px gray bar top, quick auto-dismiss (3s)
```

---

## Common Patterns

### Lab Booking Confirmation
```jsx
const bookLab = async (labId) => {
  try {
    const response = await api.post(`/labs/${labId}/book`);
    
    window.notificationCenter.addNotification(
      createNotification('Booking Confirmed! 📚', {
        type: notificationTypes.SUCCESS,
        message: `Lab ${response.labName} booked for ${response.date}`,
        priority: notificationPriorities.HIGH,
        duration: 5000,
        action: {
          label: 'View Booking',
          onClick: () => navigate('/my-bookings'),
        },
      })
    );
  } catch (error) {
    window.notificationCenter.addNotification(
      createNotification('Booking Failed ❌', {
        type: notificationTypes.ERROR,
        message: error.message,
        priority: notificationPriorities.HIGH,
        duration: 0,
      })
    );
  }
};
```

### Real-Time Alerts
```jsx
const subscribeToLabUpdates = () => {
  const unsubscribe = notificationService.subscribeToNotifications((alert) => {
    if (alert.type === notificationTypes.ALERT) {
      // This is a real-time lab alert
      window.notificationCenter.addNotification(alert);
    }
  });
  
  return unsubscribe;
};
```

### Batch Notifications
```jsx
const notifyTeam = async (teamMembers) => {
  const notifications = teamMembers.map((member) =>
    createNotification(`${member.name} joined`, {
      type: notificationTypes.ANNOUNCEMENT,
      priority: notificationPriorities.NORMAL,
      duration: 3000,
    })
  );
  
  notificationService.sendBatch(notifications);
};
```

---

## Integration with Backend

### Connect to Real WebSocket

Replace the mock subscription in `advancedNotificationService.js`:

```javascript
export const notificationService = {
  subscribeToNotifications: (callback) => {
    // Replace mock with real WebSocket
    const ws = new WebSocket(
      `wss://${window.location.host}/api/notifications/subscribe`
    );
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      callback(notification);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => ws.close();
  },
  
  // ... rest of service
};
```

### Backend Notification Delivery

**Spring Boot Example:**
```java
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  
  @PostMapping("/send")
  public ResponseEntity<?> sendNotification(@RequestBody NotificationRequest req) {
    Notification notification = new Notification(
      req.getTitle(),
      req.getMessage(),
      req.getType(),
      req.getPriority(),
      req.getUserId()
    );
    notificationRepository.save(notification);
    websocketService.broadcast(notification);
    return ResponseEntity.ok("Sent");
  }
}
```

---

## Styling & Customization

### Custom Colors

Extend `NotificationPopup` component to add more color themes:

```jsx
const colorClasses = {
  // ... existing colors
  purple: 'border-purple-300 bg-purple-50',
  indigo: 'border-indigo-300 bg-indigo-50',
};
```

### Auto-Dismiss Duration

Set duration when creating notification:

```javascript
// Never auto-dismiss (manual close required)
duration: 0,

// Quick dismiss
duration: 3000, // 3 seconds

// Long display
duration: 10000, // 10 seconds
```

### Max Notifications

The NotificationCenter limits displayed notifications to 5 (configurable):

```javascript
// In NotificationCenter.jsx, line ~20
const updated = [...prev, notificationWithId];
return updated.slice(-5); // Change 5 to desired max
```

---

## Accessibility

The system includes:
- ✓ ARIA labels on all buttons
- ✓ Keyboard-closable notifications (click close button)
- ✓ Screen reader-friendly priority indicators
- ✓ High contrast with priority color bars
- ✓ Clear visual hierarchy

Enhance with:
```jsx
// Announce to screen readers
<div role="alert" aria-live="polite" aria-atomic="true">
  {notification.title}
</div>
```

---

## Testing

### Manual Testing

1. Go to [DashboardPageWithNotifications](./pages/DashboardPageWithNotifications.jsx)
2. Use the demo buttons to test different notification types/priorities
3. Check notification panel for history
4. Verify auto-dismiss behavior

### Unit Test Example

```javascript
import { render, screen } from '@testing-library/react';
import { NotificationPopup } from './NotificationPopup';
import { createNotification } from '../services/advancedNotificationService';

test('notification displays title correctly', () => {
  const notification = createNotification('Test', {
    message: 'Test message',
  });
  
  render(
    <NotificationPopup notification={notification} onClose={() => {}} />
  );
  
  expect(screen.getByText('Test')).toBeInTheDocument();
  expect(screen.getByText('Test message')).toBeInTheDocument();
});
```

---

## Troubleshooting

**Notifications not appearing?**
- Ensure `NotificationCenter` is rendered at app root
- Check browser console for JavaScript errors
- Verify `window.notificationCenter` is available

**Auto-dismiss not working?**
- Check that `duration` is set (not `undefined` or `null`)
- Duration must be in milliseconds

**Styling issues?**
- Verify Tailwind CSS is properly configured
- Check that color classes match Tailwind palette

**WebSocket connection failing?**
- Ensure backend WebSocket endpoint is implemented
- Check CORS headers on backend
- Verify WebSocket URL is correct

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── NotificationCenter.jsx      ← Main notification manager
│   │   ├── NotificationPopup.jsx       ← Individual notification display
│   │   ├── NotificationPanel.jsx       ← History/management panel
│   │   └── NotificationPanelUpdated.jsx ← Enhanced panel version
│   ├── pages/
│   │   └── DashboardPageWithNotifications.jsx ← Demo page
│   └── services/
│       └── advancedNotificationService.js     ← Notification logic
```

---

## Performance Considerations

- **Memory**: NotificationCenter keeps max 5 notifications in state
- **DOM**: Notifications use React keys for efficient re-rendering
- **WebSocket**: Subscriptions are unsubscribed on component unmount
- **Re-renders**: Minimal using `useCallback` and proper memoization

---

## Future Enhancements

- [ ] Sound/vibration alerts for critical notifications
- [ ] Notification grouping by category
- [ ] Swipe-to-dismiss on mobile
- [ ] Notification scheduling
- [ ] Read receipts for team notifications
- [ ] Custom notification plugins/extensions
- [ ] Notification analytics and tracking

---

## Support

For issues or feature requests, contact the development team or check the [main README](../README.md).
