# 🔐 Google OAuth Integration Guide - Complete Setup

## Overview

Your Smart Campus app now supports **Google OAuth 2.0 login**. Users can sign in with their Google account instead of creating a new password.

### Architecture
```
User clicks "Sign in with Google"
        ↓
Frontend: GoogleAuthButton renders
        ↓
User authorizes in Google popup
        ↓
Frontend receives Google ID Token
        ↓
Frontend sends token to: POST /api/auth/oauth/google
        ↓
Backend: GoogleTokenVerifierService verifies token
        ↓
Backend: Creates or updates user in database
        ↓
Backend: Generates JWT token
        ↓
Frontend: Stores JWT and redirects to dashboard
        ↓
User logged in as USER role (admin upgrades if needed)
```

---

## Step-by-Step Setup

### 1️⃣ Get Google OAuth Credentials

**Go to Google Cloud Console:**
1. Visit: https://console.cloud.google.com
2. Create new project: **"Smart Campus"**
3. Go to: **APIs & Services** → **Credentials**
4. Click: **+ Create Credentials** → **OAuth 2.0 Client ID**
5. Choose: **Web Application**

**Configure the OAuth consent screen first if prompted:**
- User Type: **External**
- Add scopes: Select **email**, **profile**, **openid**
- Add test users: Your email addresses

**Configure Client ID:**
1. Application type: **Web application**
2. Name: `Smart Campus Web Client`
3. Add **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5173/
   http://localhost:3000
   ```

4. Add **Authorized redirect URIs:**
   ```
   http://localhost:5173/login
   http://localhost:5173/register
   http://localhost:5173/dashboard
   ```

5. **Copy your Client ID** (long string starting with numbers)

---

### 2️⃣ Install Frontend Package

```bash
cd frontend
npm install @react-oauth/google
```

**Verify installation:**
```bash
npm list @react-oauth/google
# Should show: @react-oauth/google@0.x.x
```

---

### 3️⃣ Configure Environment Variables

**Create `frontend/.env`:**
```
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Replace with your actual Client ID from Step 1.**

**Create `frontend/.env.local` (for local development, ignored by git):**
```
# Same as .env for local testing
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

---

### 4️⃣ Configure Backend

**Update `backend/src/main/resources/application.properties`:**
```properties
# Google OAuth Configuration
app.oauth.google.client-id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

**Verify backend component exists:**
```bash
# Check if these files exist:
ls backend/src/main/java/com/backend/backend/service/GoogleTokenVerifierService.java
ls backend/src/main/java/com/backend/backend/controller/AuthController.java
ls backend/src/main/java/com/backend/backend/dto/GoogleAuthRequest.java
```

---

### 5️⃣ Verify Frontend Files Created

Check these files were created:
```bash
# Frontend files for Google OAuth
ls frontend/src/services/googleAuthService.js
ls frontend/src/components/GoogleAuthButton.jsx

# Updated App.jsx with GoogleOAuthProvider
ls frontend/src/App.jsx

# Example login page with Google OAuth
ls frontend/src/pages/LoginPageUpdated.jsx
```

---

### 6️⃣ Update Routes (Optional)

If you want to use the updated login page:

**In `frontend/src/routes/AppRoutes.jsx`:**
```jsx
import LoginPageUpdated from "../pages/LoginPageUpdated";

// Or keep existing LoginPage
// The current LoginPage already has Google OAuth support via script
```

---

## Quick Start Testing

### Terminal 1: Start Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

**Wait for:** `Started BackendApplication in X seconds`

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Wait for:** `Local: http://localhost:5173`

### Terminal 3: Test in Browser
```
1. Open http://localhost:5173/login
2. Click "Sign in with Google" button
3. Select your Google account
4. Should see dashboard
```

---

## Testing Scenarios

### ✅ Scenario 1: First-Time Google Login

**What happens:**
1. User clicks "Sign in with Google"
2. Google popup appears
3. User authenticates with Google
4. Backend creates NEW user with:
   - Email from Google
   - Name from Google  
   - Role = "USER" (default)
   - Password = empty (Google OAuth user)
5. JWT token sent to frontend
6. User redirected to dashboard

**Test:**
```bash
1. Open http://localhost:5173/login
2. Click Google button
3. Sign in with a new Google account
4. Check console: "Login successful"
5. Verify in backend database:
   SELECT * FROM users WHERE email = 'your-google@gmail.com';
   # Should show role='USER'
```

---

### ✅ Scenario 2: Existing Google User Login

**What happens:**
1. User logs in with same Google account
2. Backend FINDS existing user
3. Updates name if different
4. Returns existing JWT token
5. Redirected to dashboard

**Test:**
```bash
1. First login with Google (creates user)
2. Logout by clearing localStorage
3. Login again with same Gmail
4. Should work instantly (same user)
```

---

### ✅ Scenario 3: Google User Role Promotion

**Only admins can do this:**

```bash
# 1. Admin logs in first
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Save the token from response
TOKEN="eyJhbGc..."

# 2. Get the Google user's ID
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"
# Find your-google@gmail.com in the list, note the ID

# 3. Promote them to technician
GOOGLE_USER_ID="user_abc123"
curl -X PATCH http://localhost:8080/api/users/$GOOGLE_USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role":"TECHNICIAN"}'

# 4. Google user logs in again
# Should now have TECHNICIAN role
```

---

### ❌ Scenario 4: Invalid Token

**Test:**
```bash
curl -X POST http://localhost:8080/api/auth/oauth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"fake_token_123"}'

# Response: 401 Unauthorized
# Message: "Invalid Google token"
```

---

### ❌ Scenario 5: Missing Environment Variable

**Test:**
```bash
# If VITE_GOOGLE_CLIENT_ID is not set:
1. Open http://localhost:5173/login
2. Google button area shows:
   "Google OAuth not configured. Set VITE_GOOGLE_CLIENT_ID in .env file."
3. Button is disabled
```

---

## File Structure

```
frontend/
├── .env                              ← Google Client ID
├── src/
│   ├── App.jsx                       ← Updated with GoogleOAuthProvider
│   ├── components/
│   │   └── GoogleAuthButton.jsx      ← Reusable Google button NEW
│   ├── services/
│   │   └── googleAuthService.js      ← Google API calls NEW
│   └── pages/
│       ├── LoginPage.jsx             ← Existing (script-based)
│       └── LoginPageUpdated.jsx      ← Updated (new library) NEW

backend/
├── src/main/resources/
│   └── application.properties        ← Google Client ID config
├── src/main/java/.../service/
│   └── GoogleTokenVerifierService.java  ← Token verification
├── src/main/java/.../controller/
│   └── AuthController.java           ← /api/auth/oauth/google endpoint
└── src/main/java/.../dto/
    └── GoogleAuthRequest.java        ← Google auth request DTO
```

---

## Troubleshooting

### ❌ "Google OAuth not configured"

**Solution:**
```bash
# Check .env file exists
cat frontend/.env

# Should contain:
VITE_GOOGLE_CLIENT_ID=YOUR_ID.apps.googleusercontent.com

# If missing, create it and restart dev server:
npm run dev
```

---

### ❌ "Invalid Google token"

**Possible causes:**
1. Client ID mismatch
2. Token expired
3. Token from wrong app

**Solution:**
```bash
# Verify Client ID in frontend .env matches backend:
cat frontend/.env          # Frontend client ID
cat backend/src/main/resources/application.properties  # Backend client ID

# They should be IDENTICAL

# If different, update backend and restart
```

---

### ❌ CORS Error: "Access to XMLHttpRequest blocked"

**Solution:**
Backend already configured with CORS. If still blocked:

In `AuthController.java`:
```java
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
```

Restart backend if you added the annotation.

---

### ❌ Google Popup Not Appearing

**Check:**
1. Is `.env` file in `frontend/` directory? (NOT in root)
2. Is `VITE_GOOGLE_CLIENT_ID` set correctly?
3. Did you restart `npm run dev`?
4. Check browser console (F12) for errors

**Solution:**
```bash
# Restart dev server
Ctrl+C
npm run dev
```

---

### ❌ Redirect Loop After Login

**Check:**
1. Is JWT token being saved? Open DevTools → Application → LocalStorage
2. Should see: `auth_token`, `auth_user`, etc.

**Solution:**
```bash
# Clear localStorage and try again
# In browser console:
localStorage.clear()
sessionStorage.clear()
# Refresh page and login again
```

---

### ❌  "User not found" after Google login

**Check:**
1. Is database accessible?
2. Did backend save the user?

**Solution:**
```bash
# Check database
SELECT * FROM users WHERE email = 'your-google@gmail.com';

# If empty, check backend logs for errors
# Restart backend
```

---

## Database Check

**After Google login, verify user created:**

```sql
-- SQLite/MySQL
SELECT id, name, email, role, created_at FROM users 
WHERE email = 'your-google-email@gmail.com';

-- Expected output:
-- id: 123abc
-- name: Your Google Name
-- email: your-google-email@gmail.com
-- role: USER
-- created_at: 2024-04-09 ...
```

---

## Debugging Mode

**Enable detailed logging:**

**Backend `application.properties`:**
```properties
logging.level.com.backend.backend=DEBUG
logging.level.org.springframework.security=DEBUG
```

**Frontend console:**
```javascript
// In browser console:
// Will show all auth events
localStorage.setItem('debug', '*');

// To disable:
localStorage.removeItem('debug');
```

---

## Production Checklist

- [ ] Add production Google Client ID to `.env.production`
- [ ] Add production OAuth consent screen in Google Cloud
- [ ] Add production domain to authorized origins
- [ ] Add production domain to redirect URIs
- [ ] Update `application-prod.properties` with production Client ID
- [ ] Test with production domain before deployment
- [ ] Set up email verification (optional enhancement)
- [ ] Implement refresh token handling (optional)
- [ ] Add rate limiting on `/api/auth/oauth/google` endpoint

---

## API Endpoints

### POST /api/auth/oauth/google
**Google OAuth authentication endpoint**

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1In0...",
  "role": "USER"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Google login successful",
  "token": "eyJhbGc...",
  "userId": "user_123abc",
  "userName": "John Doe",
  "userEmail": "john@gmail.com",
  "role": "USER"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid Google token",
  "token": null,
  "userId": null,
  "userName": null,
  "userEmail": null,
  "role": null
}
```

---

## Security Features

✅ Google token verified against Google's servers
✅ Email must be verified by Google
✅ Client ID validation prevents spoofing
✅ Role forced to USER for new registrations
✅ No password stored for Google users
✅ JWT token expires after configured period
✅ HTTPS recommended for production

---

## Next Steps

1. ✅ Install `@react-oauth/google`
2. ✅ Create `.env` with Google Client ID
3. ✅ Test login with Google
4. ✅ Verify user created in database
5. ✅ Test role promotion (admin endpoint)
6. ✅ Test logout and re-login

**You're all set! 🚀**

---

## Support

For issues:
1. Check browser console (F12) for errors
2. Check backend logs in terminal
3. Verify `.env` file and Client ID
4. Restart both frontend and backend
5. Clear browser cache and localStorage

