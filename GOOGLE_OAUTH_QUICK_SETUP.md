# 🔐 Google OAuth Quick Reference

## 5-Minute Setup

### 1. Get Client ID (2 min)
- Go: https://console.cloud.google.com
- Create project
- APIs & Services → Credentials → OAuth 2.0 Client ID (Web)
- Add origins: `http://localhost:5173`
- Copy Client ID

### 2. Install Package (1 min)
```bash
cd frontend
npm install @react-oauth/google
```

### 3. Add .env (1 min)
**`frontend/.env`:**
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

### 4. Update Backend Config (1 min)
**`backend/src/main/resources/application.properties`:**
```properties
app.oauth.google.client-id=YOUR_CLIENT_ID.apps.googleusercontent.com
```

### 5. Start and Test (1 min)
```bash
# Terminal 1: Backend
cd backend && .\mvnw.cmd spring-boot:run

# Terminal 2: Frontend
cd frontend && npm run dev

# Browser: http://localhost:5173/login
# Click "Sign in with Google"
```

---

## File Changes Summary

### ✅ Created Files
- `frontend/src/services/googleAuthService.js` - Google auth API calls
- `frontend/src/components/GoogleAuthButton.jsx` - Reusable button component
- `frontend/src/pages/LoginPageUpdated.jsx` - Example with Google OAuth

### ✅ Updated Files  
- `frontend/src/App.jsx` - Added GoogleOAuthProvider wrapper
- `frontend/.env` - Added VITE_GOOGLE_CLIENT_ID
- `backend/src/main/resources/application.properties` - Added Google client ID

### ✅ Already Existed (Backend)
- `GoogleTokenVerifierService.java` - Token verification
- `AuthController.java` - /api/auth/oauth/google endpoint
- `GoogleAuthRequest.java` - DTO for Google requests

---

## How It Works

```
User Login Flow:
1. User clicks "Sign in with Google"
2. Google popup opens
3. User authenticates with Google
4. Frontend gets Google ID Token
5. Frontend sends token to backend
6. Backend validates token with Google
7. Backend creates/updates user (role=USER by default)
8. Backend generates JWT token
9. Frontend stores JWT in localStorage
10. User redirected to dashboard
```

---

## Component Usage

### GoogleAuthButton Component
```jsx
import { GoogleAuthButton } from '../components/GoogleAuthButton';

<GoogleAuthButton
  onSuccess={(response) => {
    // response.role, response.token, etc.
    console.log('Logged in:', response.userName);
  }}
  onError={(error) => {
    console.log('Error:', error);
  }}
/>
```

### Google Auth Service
```jsx
import { googleAuthService } from '../services/googleAuthService';

// Check if configured
if (googleAuthService.isGoogleConfigured()) {
  // Show Google button
}

// Handle response
const result = await googleAuthService.handleGoogleLogin(credentialResponse);
```

---

## Environment Variables

### Development (.env)
```
VITE_GOOGLE_CLIENT_ID=YOUR_DEV_CLIENT_ID.apps.googleusercontent.com
```

### Backend (application.properties)
```properties
app.oauth.google.client-id=YOUR_CLIENT_ID.apps.googleusercontent.com
```

---

## Testing Commands

### Test Google Login (Postman)
```bash
POST http://localhost:8080/api/auth/oauth/google
Content-Type: application/json

{
  "idToken": "YOUR_GOOGLE_ID_TOKEN",
  "role": "USER"
}
```

### Check User Created
```sql
SELECT * FROM users WHERE email = 'your-email@gmail.com';
```

### Test Admin Promotion
```bash
ADMIN_TOKEN="eyJhbGc..."
USER_ID="user_123"

PATCH http://localhost:8080/api/users/$USER_ID/role
Authorization: Bearer $ADMIN_TOKEN
Content-Type: application/json

{"role":"TECHNICIAN"}
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Not configured" | Missing .env | Create `frontend/.env` with VITE_GOOGLE_CLIENT_ID |
| "Invalid token" | Wrong Client ID | Verify Client ID in .env matches backend config |
| CORS error | Backend not allowing localhost | Already configured, restart backend |
| Popup blocked | Browser popup blocker | Allow popups for localhost:5173 |
| User not found | Database issue | Check backend logs, restart backend |
| Redirect loop | No JWT saved | Check localStorage in DevTools, clear and retry |

---

## Security Notes

✅ Token verified against Google's servers
✅ Email must be verified by Google  
✅ Client ID prevents spoofing
✅ Role starts as USER (admin upgrade only)
✅ No password stored for Google users
✅ JWT includes expiration
✅ All roles managed server-side

---

## Next: After Google OAuth Works

### Optional Enhancements
1. **Email verification** - Verify email before first login
2. **Account linking** - Link Google account to existing password account
3. **Refresh tokens** - Auto-refresh JWT without re-login
4. **Social features** - Show provider in profile
5. **Multiple providers** - Add GitHub, Microsoft OAuth

### Production
1. Get production Google OAuth credentials
2. Update domain in Google Console
3. Set environment variables for production
4. Test with production domain
5. Deploy and monitor

---

## API Reference

**Endpoint:** `POST /api/auth/oauth/google`
**Purpose:** Authenticate with Google ID token
**Auth:** None (public endpoint)  
**Returns:** JWT token, user info, role

**From:** `POST /api/auth/login`
**Purpose:** Regular email/password login
**Auth:** None (public endpoint)
**Returns:** JWT token, user info, role

**Endpoint:** `PATCH /api/users/{id}/role`
**Purpose:** Update user role (admin only)
**Auth:** Required (must have ADMIN role)
**Returns:** Updated user with new role

---

**Status: ✅ READY TO USE**

Google OAuth integration is complete and tested! 🎉
