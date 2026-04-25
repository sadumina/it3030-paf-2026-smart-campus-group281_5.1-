# 🔥 Firebase Authentication Integration Guide

## Overview

Firebase Authentication provides secure, user-friendly authentication with multiple providers. Your Smart Campus app will support:
- ✅ Email/Password
- ✅ Google OAuth  
- ✅ Phone Authentication
- ✅ Anonymous Login (guest browsing)
- ✅ Session Management
- ✅ MFA (optional)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMART CAMPUS APP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FRONTEND (React)              BACKEND (Spring Boot)              │
│  ┌──────────────────┐          ┌──────────────────┐              │
│  │ Login/Register   │          │ REST API         │              │
│  │ GoogleAuthBtn    │          │ /api/auth/...    │              │
│  │ Firebase SDK     │          │ JWT Validation   │              │
│  └────────┬─────────┘          └────────┬─────────┘              │
│           │                             │                        │
│           └──────────────────┬──────────┘                        │
│                              │                                   │
│                    ┌─────────▼────────┐                         │
│                    │  FIREBASE AUTH   │                         │
│                    │  - Email/Pass    │                         │
│                    │  - Google OAuth  │                         │
│                    │  - Phone         │                         │
│                    │  - Anonymous     │                         │
│                    └──────────────────┘                         │
│                                                                   │
│  Database: Store user roles, preferences                        │
│  ┌────────────────────────────────┐                             │
│  │ Users (Firebase/Your DB)       │                             │
│  │ - uid (Firebase ID)            │                             │
│  │ - email                        │                             │
│  │ - role (USER/ADMIN/TECHNICIAN) │                             │
│  │ - created_at                   │                             │
│  └────────────────────────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Setup Frontend - Install Firebase SDK

```bash
cd frontend
npm install firebase
```

---

## Step 2: Create Firebase Configuration

Create: `frontend/src/config/firebase.js`
