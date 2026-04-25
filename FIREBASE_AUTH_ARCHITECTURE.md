# 🏗️ Firebase Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SMART CAMPUS APPLICATION                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (React + Vite)                        │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │                                                                    │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  FirebaseLoginPage.jsx                                  │    │   │
│  │  │ ┌────────────────────────────────────────────────────┐  │    │   │
│  │  │ │ 1. Login/Register/Password Reset Tabs               │  │    │   │
│  │  │ │ 2. Email/Password Form Fields                       │  │    │   │
│  │  │ │ 3. Google OAuth Button                              │  │    │   │
│  │  │ │ 4. Error/Success Notifications                      │  │    │   │
│  │  │ └────────────────────────────────────────────────────┘  │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                      ▼ ▼ ▼ ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  firebaseAuthService.js                                  │    │   │
│  │  │ ┌────────────────────────────────────────────────────┐  │    │   │
│  │  │ │ • firebaseRegister(email, pwd, name)              │  │    │   │
│  │  │ │ • firebaseLogin(email, pwd)                       │  │    │   │
│  │  │ │ • firebaseGoogleLogin(idToken)                    │  │    │   │
│  │  │ │ • firebasePasswordReset(email)                    │  │    │   │
│  │  │ │ • firebaseLogout()                                │  │    │   │
│  │  │ │ • firebaseAnonymousLogin()                        │  │    │   │
│  │  │ └────────────────────────────────────────────────────┘  │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                      ▼ ▼ ▼ ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  firebase.js (SDK Initialization)                       │    │   │
│  │  │ • Connects to Firebase Project                          │    │   │
│  │  │ • Initializes Auth & Firestore                          │    │   │
│  │  │ • Handles token management                              │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│           ▼ ▼ ▼ ▼                    ▼ ▼ ▼ ▼                           │
│           HTTP REST                  Firebase SDK                       │
│           Calls                       Direct Connection               │
│                                                                         │
│  ┌──────────────────────────┐  ┌───────────────────────────────────┐  │
│  │  BACKEND API             │  │  FIREBASE (Cloud Services)        │  │
│  │  (Spring Boot)           │  │  ┌─────────────────────────────┐ │  │
│  │  ┌────────────────────┐  │  │  │ Firebase Authentication     │ │  │
│  │  │ /api/auth/         │  │  │  │ • Email/Password Storage    │ │  │
│  │  │ • firebase-register│  │  │  │ • Google OAuth Provider     │ │  │
│  │  │ • firebase-login   │  │  │  │ • Phone Auth (optional)     │ │  │
│  │  │ • firebase-google  │  │  │  │ • Anonymous User Mgmt       │ │  │
│  │  │ • firebase-status  │  │  │  │ • Session Management        │ │  │
│  │  └────────────────────┘  │  │  └─────────────────────────────┘ │  │
│  │                          │  │  ┌─────────────────────────────┐ │  │
│  │  ┌────────────────────┐  │  │  │ Firestore Database          │ │  │
│  │  │ FirebaseAuth       │  │  │  │ /users/{uid}                │ │  │
│  │  │ Service            │  │  │  │ • User profiles             │ │  │
│  │  │ • Verify Tokens    │  │  │  │ • Preferences               │ │  │
│  │  │ • Create Custom JWT│  │  │  │ • Activity logs             │ │  │
│  │  │ • Get User Info    │  │  │  └─────────────────────────────┘ │  │
│  │  └────────────────────┘  │  └───────────────────────────────────┘  │
│  │                          │                                          │
│  │  ┌────────────────────┐  │                                          │
│  │  │ JWT Token Gen      │  │                                          │
│  │  │ • Issue JWT        │  │                                          │
│  │  │ • Verify JWT       │  │                                          │
│  │  └────────────────────┘  │                                          │
│  │                          │                                          │
│  │  ┌────────────────────┐  │                                          │
│  │  │ MongoDB            │  │                                          │
│  │  │ • User Accounts    │  │                                          │
│  │  │ • Roles (USER,     │  │                                          │
│  │  │   ADMIN, TECH)     │  │                                          │
│  │  │ • Firebase UID     │  │                                          │
│  │  └────────────────────┘  │                                          │
│  │                          │                                          │
│  └──────────────────────────┘                                          │
│           ▲ ▲ ▲ ▲                                                      │
│           │ │ │ │                                                      │
└───────────┼─┼─┼─┼──────────────────────────────────────────────────────┘
            │ │ │ │
            │ │ │ └─ (3) User Data Sync
            │ │ └─── (2) Verify Token
            │ └───── (1) Get JWT Token
            └─────── (4) Store in Smart Campus DB

```

---

## Authentication Flow Diagrams

### Flow 1: Email/Password Registration

```
User                  Frontend              Backend              Firebase
 │                       │                     │                    │
 ├─ Enters Email ──────→ │                     │                    │
 │   Password, Name       │                     │                    │
 │                       │                     │                    │
 │                       ├─ createUserWithEmailAndPassword() ──────→ │
 │                       │                     │                    │
 │                       │◀─ Firebase User ────◀─────────────────────┤
 │                       │    Created                                 │
 │                       │                     │                    │
 │                       ├─ POST /firebase-register ─────────────────→│
 │                       │  (firebaseUid, email, name)               │
 │                       │                                             │
 │                       │                     ├─ Verify Firebase ──→│
 │                       │                     │   credentials       │
 │                       │                     │◀──────────────────── │
 │                       │                     │                    │
 │                       │                     ├─ Create in MongoDB │
 │                       │                     │ (role=USER)        │
 │                       │                     │                    │
 │                       │◀─────────── JWT Response ────────────────│
 │                       │  (token, role)                            │
 │                       │                                            │
 │◀─ Success Msg ────────┤                     │                    │
 │  (stored in localStorage)                   │                    │
```

### Flow 2: Email/Password Login

```
User                  Frontend              Backend              Firebase
 │                       │                     │                    │
 ├─ Enters Email ──────→ │                     │                    │
 │   Password            │                     │                    │
 │                       │                     │                    │
 │                       ├─ signInWithEmailAndPassword() ──────────→│
 │                       │                     │                    │
 │                       │◀─ Get Firebase ID Token ────────────────│
 │                       │                     │                    │
 │                       ├─ POST /firebase-login ──────────────────→│
 │                       │  (email, idToken)   │                    │
 │                       │                     │                    │
 │                       │                     ├─ Verify ID Token ─→│
 │                       │                     │◀──────────────────│
 │                       │                     │                    │
 │                       │                     ├─ Get/Create in │
 │                       │                     │   MongoDB       │
 │                       │                     │                    │
 │                       │◀─────── JWT Response ───────────────────│
 │                       │  (token, role, userRole)                │
 │                       │                                          │
 │◀─ Redirect ───────────┤                     │                   │
 │  to Dashboard        │                     │                   │
```

### Flow 3: Google OAuth Login

```
User                  Frontend              Backend              Firebase
 │                       │                     │                Google
 ├─ Clicks "Google" ───→ │                     │                OAuth
 │                       │                     │                 │
 │                       ├─ Google OAuth Popup ────────────────→ │
 │                       │                    │                  │
 │ [User Authorizes]     │◀─ Google ID Token ────────────────────│
 │                       │                    │                  │
 │                       ├─ Firebase SDK Authentication ────────→│
 │                       │                    │   (ID Token)    │
 │                       │                    │                 │
 │                       │◀─ Firebase User ───◀─────────────────│
 │                       │    Created/Linked   │                 │
 │                       │                    │                  │
 │                       ├─ POST /firebase-google ─────────────→ │
 │                       │  (idToken)         │                  │
 │                       │                    │                  │
 │                       │                    ├─ Verify Token ──→│
 │                       │                    │◀──────────────── │
 │                       │                    │                  │
 │                       │                    ├─ Create in MongoDB
 │                       │                    │ (if new user)     │
 │                       │                    │                  │
 │                       │◀────── JWT Response ────────────────── │
 │                       │  (token, role)     │                  │
 │                       │                    │                  │
 │◀─ Redirect ───────────┤                    │                  │
 │  to Dashboard        │                    │                  │
```

### Flow 4: Password Reset

```
User                  Frontend         Firebase Cloud
 │                       │               Email Service
 │                       │                    │
 ├─ Enters Email ──────→ │                    │
 │                       │                    │
 │                       ├─ sendPasswordResetEmail() ──→ │
 │                       │                    │
 │◀─ Check Email ────────┤                    │
 │                       │                    ├─ Send Reset Email
 │                       │                    │   (with reset link)
 │                       │                    │
 │ [User clicks link] ───┼┬───────────────────┤
 │ [New password] ───────→││ resetPassword()   │
 │                       ││                   ├─ Update Password
 │                       ││                   │
 │◀─ Success Message ────┤                    │
 │ [Can login now]       │                    │
```

---

## Data Flow During Login

```sql
BEFORE LOGIN:
┌─ MongoDB ──────────────────────────────┐
│ User {                                 │
│   id: "507f1f77bcf86cd799439011"      │
│   email: "student@uni.edu"            │
│   name: "John Doe"                     │
│   role: "USER"                         │
│   firebaseUid: "O9xN5zV2Abc123..."    │ ← Links Firebase user
│   passwordHash: "FIREBASE"             │
│   phone: "0771234567"                 │
│ }                                      │
└────────────────────────────────────────┘

DURING LOGIN:
1. Firebase verifies credentials → Issues ID Token
2. Frontend sends ID Token + email to backend
3. Backend verifies token with Firebase
4. Backend generates Smart Campus JWT

AFTER LOGIN (Frontend Storage):
┌─ Browser Local Storage ─────────────────┐
│ {                                       │
│   authToken: "eyJhbGciOiJIUzI1..."     │ ← JWT (Smart Campus)
│   firebaseToken: "eyJhbGciOiJSUzI1..." │ ← ID Token (Firebase)
│   userRole: "USER"                      │
│   firebaseUid: "O9xN5zV2Abc123..."     │
│ }                                       │
└─────────────────────────────────────────┘

SUBSEQUENT REQUESTS (Protected):
┌─ Frontend API Request ──────────────────┐
│ {                                       │
│   method: "GET"                         │
│   url: "/api/protected/resource"        │
│   headers: {                            │
│     Authorization: "Bearer JWT_TOKEN"   │ ← Send JWT
│   }                                     │
│ }                                       │
└─────────────────────────────────────────┘
        │
        ▼
┌─ Backend Verification ──────────────────┐
│ 1. Extract JWT from header              │
│ 2. Verify JWT signature                 │
│ 3. Check expiration time                │
│ 4. Extract user info from payload       │
│ 5. Check role/permissions               │
│ 6. Allow/Reject request                 │
└─────────────────────────────────────────┘
```

---

## Security Layers

```
Layer 1: Firebase Authentication
├─ Email verification (optional)
├─ Password strength requirements
├─ Account detection (prevent duplicates)
├─ Multi-factor authentication (optional)
└─ Session management

Layer 2: Firebase Token Verification (Backend)
├─ Token signature validation
├─ Expiration check
├─ Firebase project ID verification
└─ Custom claims validation

Layer 3: Smart Campus Role-Based Access Control
├─ JWT issued with user role
├─ @PreAuthorize("hasRole('ADMIN')") on endpoints
├─ Role verification on each request
└─ Admin actions logged

Layer 4: Database Security
├─ MongoDB connection authenticated
├─ Sensitive data excluded from API responses
├─ Audit trail of user actions
└─ Encryption at rest (MongoDB Atlas)

Layer 5: Network Security
├─ HTTPS/TLS encryption (production)
├─ CORS restrictions
├─ Rate limiting (optional)
└─ DDoS protection (production CDN)
```

---

## Key Components Reference

### Frontend Components

| Component | Purpose | Location |
|-----------|---------|----------|
| FirebaseLoginPage | Login/Register/Password Reset UI | `src/pages/FirebaseLoginPage.jsx` |
| GoogleAuthButton | Google OAuth button | `src/components/GoogleAuthButton.jsx` |
| NotificationCenter | Global notifications | `src/components/NotificationCenter.jsx` |

### Frontend Services

| Service | Purpose | Location |
|---------|---------|----------|
| firebaseAuthService | Auth operations | `src/services/firebaseAuthService.js` |
| firebase (config) | Initialize Firebase SDK | `src/config/firebase.js` |
| advancedNotificationService | Create notifications | `src/services/advancedNotificationService.js` |

### Backend Services

| Service | Purpose | Location |
|---------|---------|----------|
| FirebaseAuthenticationService | Verify Firebase tokens | `service/FirebaseAuthenticationService.java` |
| UserService | User CRUD operations | `service/UserService.java` |
| JwtService | Issue Smart Campus JWT | `service/JwtService.java` |

### Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/firebase-register | POST | Register new user |
| /api/auth/firebase-login | POST | Email/password login |
| /api/auth/firebase-google | POST | Google OAuth login |
| /api/auth/firebase-status | GET | Check Firebase health |

---

## States & Status Codes

### HTTP Response Codes

```
200 OK                    ✅ Login/Register successful
400 Bad Request          ❌ Invalid credentials or format
401 Unauthorized         ❌ Token expired or invalid
403 Forbidden            ❌ Insufficient permissions
500 Internal Server      ❌ Firebase/Database error
```

### Authentication States

```
LOGGED_OUT
├─ No tokens in localStorage
├─ No Firebase user authenticated
└─ Redirect to login page

LOGGING_IN
├─ Request sent to backend
├─ Waiting for token response
└─ Show loading spinner

LOGGED_IN
├─ JWT in localStorage
├─ Firebase user authenticated
├─ Can access protected routes
└─ Session persists across refreshes

LOGGING_OUT
├─ Clear localStorage
├─ Firebase signOut() called
└─ Redirect to login page

SESSION_EXPIRED
├─ JWT expired
├─ Refresh token required
└─ Re-login or refresh token automatically
```

---

## Performance Optimization

```
Frontend Optimization:
├─ Lazy load NotificationCenter only when needed
├─ Debounce form inputs
├─ Cache Firebase config
└─ Use React.memo for expensive components

Backend Optimization:
├─ Cache JWT verification results (5 min)
├─ Use MongoDB indexes on email field
├─ Connection pooling for Firebase Admin SDK
└─ Compress API responses

Network Optimization:
├─ Use HTTP/2 (production)
├─ Enable gzip compression
├─ CDN for static assets
└─ Reduce token payload size
```

---

## Deployment Architecture

```
DEVELOPMENT
├─ Frontend: http://localhost:5173
├─ Backend: http://localhost:8080
├─ MongoDB: cloud.mongodb.com (Dev cluster)
└─ Firebase: Dev project

PRODUCTION
├─ Frontend: https://smartcampus.vercel.app
├─ Backend: https://api.smartcampus.edu
├─ MongoDB: cloud.mongodb.com (Prod cluster)
├─ Firebase: Production project
├─ CDN: Cloudflare/CloudFront
└─ SSL/TLS: Let's Encrypt
```

---

## Troubleshooting Decision Tree

```
Auth Not Working?
├─ Token verification fails?
│  ├─ Check firebase-key.json path
│  ├─ Verify Firebase credentials
│  └─ Check project ID matches
│
├─ User not created in MongoDB?
│  ├─ Check userService.saveUser() succeeds
│  ├─ Verify MongoDB connection
│  └─ Check email not duplicate
│
├─ JWT generation fails?
│  ├─ Check JWT_SECRET is set
│  ├─ Verify JwtService.generateToken()
│  └─ Check token expiration time
│
└─ CORS errors?
   ├─ Add frontend URL to @CrossOrigin
   ├─ Check backend CORS configuration
   └─ Verify request headers
```

---

## Summary

✅ **Authentication Flow:** Email → Firebase → Backend JWT → Protected Resources
✅ **Token Management:** Firebase handles auth, Backend issues JWT
✅ **Security Layers:** 5 layers from Firebase to database
✅ **Performance:** Optimized for both development and production
✅ **Scalability:** Works with cloud services (MongoDB Atlas, Firebase)
