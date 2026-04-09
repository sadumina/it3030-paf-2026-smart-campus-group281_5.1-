# 🚀 Firebase Authentication - Complete Implementation Guide

## Part 1: Backend Setup

### Step 1: Install Firebase Admin SDK Dependency ✅

**Already added to `pom.xml`:**
```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

Build to download dependencies:
```bash
cd backend
./mvnw.cmd clean compile
```

### Step 2: Create Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Settings** (gear icon) → **Project Settings**
4. **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file to: `backend/src/main/resources/firebase-key.json`

**Example structure:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 3: Update Backend Configuration

Update `backend/src/main/resources/application.properties`:

```properties
# Firebase Configuration
firebase.credentials.path=${FIREBASE_SERVICE_ACCOUNT_PATH:src/main/resources/firebase-key.json}
```

### Step 4: Backend Files Created ✅

**Services:**
- `FirebaseAuthenticationService.java` - Verifies Firebase tokens
- `JwtService.java` - Generates Smart Campus JWT tokens (already exists)
- `UserService.java` - Manages user database operations (already exists)

**Controllers:**
- `FirebaseAuthController.java` - Handles Firebase auth endpoints

**DTOs:**
- `FirebaseRegisterRequest.java`
- `FirebaseLoginRequest.java`

**Model Updates:**
- `User.java` - Added `firebaseUid` and `passwordHash` fields

### Step 5: Start Backend

```bash
cd backend
./mvnw.cmd spring-boot:run
```

**Verify Firebase is initialized:**
```bash
# Should return: {"initialized": true, ...}
curl http://localhost:8080/api/auth/firebase-status
```

---

## Part 2: Frontend Setup

### Step 1: Install Firebase SDK ✅

```bash
cd frontend
npm install firebase
```

### Step 2: Create Firebase Config

**File: `frontend/src/config/firebase.js`** ✅

Replace with your credentials from Firebase Console → Project Settings → Web SDK.

### Step 3: Add Environment Variables

Create `frontend/.env` with your Firebase config:

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=YOUR_WEB_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Google OAuth
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

# Backend
VITE_BACKEND_URL=http://localhost:8080
```

### Step 4: Frontend Files Created ✅

**Services:**
- `firebaseAuthService.js` - Handles all auth operations
  - `firebaseRegister()` - Email/password signup
  - `firebaseLogin()` - Email/password login
  - `firebaseLogout()` - Sign out
  - `firebaseGoogleLogin()` - Google OAuth
  - `firebasePasswordReset()` - Password recovery
  - `firebaseAnonymousLogin()` - Guest mode
  - `getUserData()` - Fetch user profile

**Pages:**
- `FirebaseLoginPage.jsx` - Complete login/signup/password reset UI
  - 3 modes: Login, Register, Password Reset
  - Email/password forms
  - Google OAuth button
  - Beautiful Tailwind styling
  - Success/error notifications

**Routes:**
Need to update `AppRoutes.jsx` to use the new Firebase login page

### Step 5: Update App Routes

Edit `frontend/src/routes/AppRoutes.jsx`:

```jsx
import FirebaseLoginPage from '../pages/FirebaseLoginPage';
import { setupAuthStateListener } from '../services/firebaseAuthService';
import { useEffect, useState } from 'react';

export default function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = setupAuthStateListener((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">Loading...</div>
    </div>;
  }

  return (
    <Routes>
      {!user ? (
        <Route path="/*" element={<FirebaseLoginPage />} />
      ) : (
        <>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>} />
          <Route path="/technician" element={<ProtectedRoute requiredRole="TECHNICIAN"><TechnicianPage /></ProtectedRoute>} />
        </>
      )}
    </Routes>
  );
}
```

---

## Part 3: Enable Firebase Services

### Step 1: Enable Authentication Providers

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable:
   - ✅ **Email/Password** (already set up)
   - ✅ **Google** (link existing Google OAuth app)
   - ⭕ **Phone** (optional)
   - ⭕ **Anonymous** (for guest browsing)

### Step 2: Link Google OAuth

1. Firebase Console → **Authentication** → **Sign-in method**
2. Click **Google**
3. Link to your existing Google Cloud OAuth credentials
4. Same `VITE_GOOGLE_CLIENT_ID` will work

### Step 3: Configure Firestore (Optional)

For storing custom user data:

1. Firebase Console → **Firestore Database** → **Create Database**
2. Start in **Test Mode** (for development)
3. Users' additional data stored in `/users/{uid}` collection

---

## Part 4: API Endpoints Reference

### Registration
```bash
POST /api/auth/firebase-register
Content-Type: application/json

{
  "firebaseUid": "O9xN5zV2...",
  "email": "student@uni.edu",
  "name": "John Doe"
}

# Response:
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER"
}
```

### Login
```bash
POST /api/auth/firebase-login
Content-Type: application/json

{
  "firebaseUid": "O9xN5zV2...",
  "email": "student@uni.edu",
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5Yk5UM0Y..."
}

# Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER"
}
```

### Google OAuth
```bash
POST /api/auth/firebase-google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5Yk5UM0Y..."
}

# Response:
{
  "success": true,
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER"
}
```

### Check Firebase Status
```bash
GET /api/auth/firebase-status

# Response:
{
  "initialized": true,
  "message": "Firebase is initialized and ready"
}
```

---

## Part 5: Testing Firebase Auth

### Test 1: Register New User
```bash
# 1. User signs up on frontend with email/password
# 2. Firebase SDK creates user account
# 3. Frontend calls /api/auth/firebase-register
# 4. Backend stores user in MongoDB
# 5. User receives JWT token
```

**Expected:**
- User created in MongoDB
- User created in Firebase Console → Authentication
- JWT token returned for API calls

### Test 2: Login with Email/Password
```bash
# 1. User enters email/password on login page
# 2. Firebase SDK authenticates
# 3. Frontend gets Firebase ID token
# 4. Frontend calls /api/auth/firebase-login
# 5. Backend verifies token and issues JWT
```

### Test 3: Login with Google
```bash
# 1. User clicks "Sign in with Google"
# 2. Google OAuth popup
# 3. User authorizes
# 4. Frontend gets Google ID token
# 5. Frontend calls /api/auth/firebase-google
# 6. Backend links Firebase → Smart Campus user
```

### Test 4: Password Reset
```bash
# 1. User clicks "Forgot Password?"
# 2. Enters email
# 3. Firebase sends reset link
# 4. User resets password
# 5. Next login with new password works
```

---

## Part 6: Security Best Practices

### ✅ Already Implemented:
1. **Role Validation** - Users default to USER role
2. **Token Verification** - Firebase tokens verified server-side
3. **JWT Integration** - Backend issues own JWT with Smart Campus claims
4. **CORS Protection** - Endpoints restricted to frontend domain
5. **Password Protection** - Not stored in MongoDB for OAuth users
6. **Persistent Login** - Sessions survive page refresh

### 🔒 Additional Recommendations:
1. **Enable MFA** (optional)
   ```
   Firebase Console → Authentication → MFA (optional)
   ```

2. **Configure Security Rules** (if using Firestore)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth.uid == uid;
       }
     }
   }
   ```

3. **Set Email Verification** (optional)
   ```
   Firebase Console → Authentication → Templates → Email Verification
   ```

4. **Enable Account Recovery**
   ```
   Enabled by default in Firebase Console
   ```

---

## Part 7: Troubleshooting

### Issue: Firebase not initialized
**Solution:**
```bash
# Check firebase-key.json path
# Check FIREBASE_SERVICE_ACCOUNT_PATH environment variable
# Verify backend started successfully
curl http://localhost:8080/api/auth/firebase-status
```

### Issue: Token verification fails
**Solution:**
```
1. Check Firebase ID token expiration (1 hour default)
2. Verify credentials.json is valid
3. Check Firebase project ID matches
```

### Issue: Google OAuth not working
**Solution:**
```
1. Verify VITE_GOOGLE_CLIENT_ID in .env
2. Add localhost:5173 to authorized JavaScript origins
3. Check if Google sign-in is enabled in Firebase
```

### Issue: User not created in MongoDB
**Solution:**
```
1. Check backend JWT token expiration
2. Verify MongoDB connection
3. Check user email not already registered
```

---

## Part 8: Deployment

### Frontend (.env for production):
```env
VITE_FIREBASE_API_KEY=prod_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_BACKEND_URL=https://api.smartcampus.edu
```

### Backend (application.properties):
```properties
firebase.credentials.path=/opt/config/firebase-key.json
server.port=8080
```

### Docker (optional):
```dockerfile
FROM openjdk:17
COPY backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
RUN curl https://...firebase-key.json -o /opt/config/firebase-key.json
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Summary

✅ **Completed:**
- [x] Firebase Admin SDK added to pom.xml
- [x] FirebaseAuthenticationService created
- [x] FirebaseAuthController with 3 endpoints
- [x] Backend User model updated with firebaseUid
- [x] Firebase config file created
- [x] Firebase auth service with 7 operations
- [x] Complete login page component
- [x] Environment variable templates
- [x] DTOs for Firebase requests

⏳ **Next Steps:**
1. Add Firebase credentials to backend
2. Add Firebase config to frontend .env
3. Enable Firebase auth providers
4. Update routes to use new login page
5. Test all auth flows
6. Deploy to production

🎯 **Features Enabled:**
- ✅ Email/Password registration & login
- ✅ Google OAuth integration
- ✅ Password reset via email
- ✅ Persistent login (survives refresh)
- ⏳ Phone authentication (requires reCAPTCHA setup)
- ⏳ Anonymous guest login
- ⏳ Multi-factor authentication (MFA)
