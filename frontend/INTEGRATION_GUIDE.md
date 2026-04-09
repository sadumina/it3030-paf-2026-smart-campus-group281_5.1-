## Notification System Integration Guide

This guide shows how to integrate the notification system into your existing Smart Campus application.

---

## 1. Update Your Main App Component

**File: `frontend/src/App.jsx`**

```jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { NotificationCenter } from './components/NotificationCenter';

function App() {
  return (
    <Router>
      {/* Add NotificationCenter at the top level */}
      <NotificationCenter />
      <AppRoutes />
    </Router>
  );
}

export default App;
```

---

## 2. Update Login Page with Notifications

**File: `frontend/src/pages/LoginPage.jsx`**

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNotification, notificationTypes, notificationPriorities } from '../services/advancedNotificationService';
import authService from '../services/authService';
import { Navbar } from '../components/Navbar';
import './LoginPage.css';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const showNotification = (type, title, message, config = {}) => {
    const notification = createNotification(title, {
      type,
      message,
      priority: config.priority || notificationPriorities.HIGH,
      duration: config.duration || 5000,
      ...config,
    });
    
    if (window.notificationCenter) {
      window.notificationCenter.addNotification(notification);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Success notification
      showNotification(
        notificationTypes.SUCCESS,
        'Login Successful',
        `Welcome back, ${response.user?.name || 'User'}!`,
        { duration: 3000 }
      );

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      // Error notification
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      showNotification(
        notificationTypes.ERROR,
        'Login Failed',
        errorMessage,
        { duration: 0 } // Manual dismiss
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="login-container">
        {/* Your existing login UI */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

---

## 3. Update Registration Page with Notifications

**File: `frontend/src/pages/RegisterPage.jsx`**

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNotification, notificationTypes, notificationPriorities } from '../services/advancedNotificationService';
import authService from '../services/authService';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      // Validation error
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification('Password Mismatch', {
            type: notificationTypes.WARNING,
            message: 'Password and confirm password do not match',
            priority: notificationPriorities.NORMAL,
            duration: 0,
            icon: '⚠',
          })
        );
      }
      return;
    }

    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Success notification with action
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification('Registration Successful! 🎉', {
            type: notificationTypes.SUCCESS,
            message: 'Your account has been created. Redirecting to login...',
            priority: notificationPriorities.HIGH,
            duration: 3000,
            action: {
              label: 'Go to Dashboard',
              onClick: () => navigate('/dashboard'),
            },
          })
        );
      }

      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (window.notificationCenter) {
        window.notificationCenter.addNotification(
          createNotification('Registration Failed', {
            type: notificationTypes.ERROR,
            message: error.response?.data?.message || 'An error occurred',
            priority: notificationPriorities.HIGH,
            duration: 0,
            icon: '✕',
          })
        );
      }
    }
  };

  // ... rest of component
};
```

---

## 4. Create Notification Helper Hook

**File: `frontend/src/hooks/useNotification.js`**

```javascript
import { createNotification, notificationTypes, notificationPriorities } from '../services/advancedNotificationService';

export const useNotification = () => {
  const notify = (title, config = {}) => {
    const notification = createNotification(title, {
      type: notificationTypes.INFO,
      priority: notificationPriorities.NORMAL,
      duration: 5000,
      ...config,
    });

    if (window.notificationCenter) {
      window.notificationCenter.addNotification(notification);
    }
  };

  return {
    success: (title, message, config) =>
      notify(title, {
        type: notificationTypes.SUCCESS,
        message,
        icon: '✓',
        ...config,
      }),

    error: (title, message, config) =>
      notify(title, {
        type: notificationTypes.ERROR,
        message,
        icon: '✕',
        duration: 0,
        ...config,
      }),

    warning: (title, message, config) =>
      notify(title, {
        type: notificationTypes.WARNING,
        message,
        icon: '⚠',
        ...config,
      }),

    info: (title, message, config) =>
      notify(title, {
        type: notificationTypes.INFO,
        message,
        icon: 'ℹ',
        ...config,
      }),

    alert: (title, message, config) =>
      notify(title, {
        type: notificationTypes.ALERT,
        message,
        icon: '🔔',
        priority: notificationPriorities.HIGH,
        duration: 0,
        ...config,
      }),

    announcement: (title, message, config) =>
      notify(title, {
        type: notificationTypes.ANNOUNCEMENT,
        message,
        icon: '📢',
        ...config,
      }),
  };
};
```

**Usage in components:**
```jsx
import { useNotification } from '../hooks/useNotification';

export const MyComponent = () => {
  const { success, error } = useNotification();

  const handleAction = async () => {
    try {
      await api.post('/action');
      success('Done!', 'Action completed successfully');
    } catch (err) {
      error('Failed', 'Something went wrong');
    }
  };

  return <button onClick={handleAction}>Click Me</button>;
};
```

---

## 5. Integrate with Dashboard

**File: `frontend/src/pages/DashboardPage.jsx`**

```jsx
import React, { useState } from 'react';
import { NotificationPanelUpdated as NotificationPanel } from '../components/NotificationPanelUpdated';
import { useNotification } from '../hooks/useNotification';

export const DashboardPage = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { success, alert } = useNotification();

  const handleBookLab = async (labId) => {
    try {
      const response = await api.post(`/labs/${labId}/book`);
      success('Booking Confirmed', `Lab booked for ${response.date}`, {
        action: {
          label: 'View Details',
          onClick: () => navigate(`/booking/${response.id}`),
        },
      });
    } catch (error) {
      alert('Booking Failed', error.message, {
        duration: 0,
      });
    }
  };

  return (
    <div>
      {/* Header with notification bell */}
      <header className="flex justify-between items-center p-4 bg-white shadow">
        <h1>Dashboard</h1>
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900"
        >
          🔔
        </button>
      </header>

      {/* Notification panel */}
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      {/* Dashboard content */}
      <main className="p-4">
        {/* Your dashboard content */}
      </main>
    </div>
  );
};
```

---

## 6. API Interceptor for Notifications

**File: `frontend/src/services/apiInterceptor.js`**

```javascript
import axios from 'axios';
import { createNotification, notificationTypes } from './advancedNotificationService';

export const setupApiInterceptor = (api) => {
  // Response interceptor for automatic error notifications
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (window.notificationCenter && status >= 400) {
        let title = 'Error';
        let type = notificationTypes.ERROR;

        if (status === 404) {
          title = 'Not Found';
        } else if (status === 401) {
          title = 'Unauthorized';
          // Could trigger logout here
        } else if (status === 429) {
          title = 'Too Many Requests';
          type = notificationTypes.WARNING;
        } else if (status >= 500) {
          title = 'Server Error';
        }

        window.notificationCenter.addNotification(
          createNotification(title, {
            type,
            message,
            priority: status >= 500 ? 'high' : 'normal',
            duration: 0,
          })
        );
      }

      return Promise.reject(error);
    }
  );
};

// Usage in main.jsx or App.jsx
// setupApiInterceptor(api);
```

---

## 7. Notification Context (Optional Advanced)

**File: `frontend/src/context/NotificationContext.jsx`**

```jsx
import React, { createContext, useContext } from 'react';
import { useNotification } from '../hooks/useNotification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notification = useNotification();

  return (
    <NotificationContext.Provider value={notification}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
```

**Usage with Provider in App.jsx:**
```jsx
import { NotificationProvider } from './context/NotificationContext';
import { NotificationCenter } from './components/NotificationCenter';

function App() {
  return (
    <NotificationProvider>
      <NotificationCenter />
      <AppRoutes />
    </NotificationProvider>
  );
}
```

---

## 8. Real-World Examples

### Lab Booking Flow
```jsx
const bookLab = async () => {
  const { success, error } = useNotification();
  
  try {
    const result = await labService.book(labId, date);
    success(
      'Lab Booked Successfully',
      `Confirmed for ${date} from ${result.startTime} to ${result.endTime}`,
      {
        action: {
          label: 'Add to Calendar',
          onClick: () => exportCalendar(result),
        },
      }
    );
  } catch (err) {
    error('Booking Failed', err.message);
  }
};
```

### Resource Request Notification
```jsx
const requestResource = async () => {
  const { alert } = useNotification();
  
  const response = await resourceService.request(resourceId);
  alert(
    'Request Pending Approval',
    `Your request for ${resource.name} is awaiting admin approval`,
    { priority: 'high', duration: 0 }
  );
};
```

### Batch Operations
```jsx
const approveBookings = async (bookingIds) => {
  const { success } = useNotification();
  
  await Promise.all(bookingIds.map(id => bookingService.approve(id)));
  success(
    'Batch Approval Complete',
    `${bookingIds.length} bookings have been approved`,
    { duration: 3000 }
  );
};
```

---

## File Checklist

- [ ] `frontend/src/components/NotificationCenter.jsx`
- [ ] `frontend/src/components/NotificationPopup.jsx`
- [ ] `frontend/src/components/NotificationPanelUpdated.jsx`
- [ ] `frontend/src/services/advancedNotificationService.js`
- [ ] `frontend/src/hooks/useNotification.js` (recommended)
- [ ] Updated `frontend/src/App.jsx`
- [ ] Updated `frontend/src/pages/LoginPage.jsx` (as example)
- [ ] Updated `frontend/src/pages/DashboardPage.jsx` (as example)

---

## Testing Checklist

- [ ] Notifications appear in top-right corner
- [ ] Toast auto-dismisses after specified duration
- [ ] Manual close button works
- [ ] Notification panel shows history
- [ ] Notifications filter correctly
- [ ] Priority indicators display
- [ ] Action buttons work
- [ ] WebSocket ready for real-time connection

---

## Next Steps

1. Copy all notification system files to your frontend project
2. Update `App.jsx` to include `<NotificationCenter />`
3. Use `useNotification` hook in your components
4. Test with login/registration flows
5. Connect WebSocket to backend when ready
6. Customize colors and styling as needed
