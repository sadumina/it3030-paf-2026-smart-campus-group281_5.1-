import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, db, watchAuthState } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Firebase Authentication Service
 * Handles all Firebase auth operations and smart campus backend sync
 */

// ============================================================================
// 1. SIGNUP / REGISTER
// ============================================================================

export const firebaseRegister = async (email, password, fullName) => {
  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update profile with display name
    await updateProfile(firebaseUser, {
      displayName: fullName,
    });

    // Store user in Firestore with Smart Campus details
    const userDoc = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: fullName,
      role: 'USER', // Default role for registration
      createdAt: new Date().toISOString(),
      provider: 'email',
      lastLogin: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

    // Register in Smart Campus backend
    const idToken = await firebaseUser.getIdToken();
    const backendResponse = await fetch('/api/auth/firebase-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: fullName,
      }),
    });

    if (!backendResponse.ok) {
      throw new Error('Failed to register in Smart Campus backend');
    }

    const backendData = await backendResponse.json();

    return {
      success: true,
      user: firebaseUser,
      backendToken: backendData.token, // JWT from backend
      message: 'Registration successful!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// ============================================================================
// 2. LOGIN / SIGN IN
// ============================================================================

export const firebaseLogin = async (email, password) => {
  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get Firebase ID token
    const idToken = await firebaseUser.getIdToken();

    // Authenticate with Smart Campus backend
    const backendResponse = await fetch('/api/auth/firebase-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        idToken: idToken, // Firebase ID token for backend verification
      }),
    });

    if (!backendResponse.ok) {
      throw new Error('Failed to authenticate with Smart Campus backend');
    }

    const backendData = await backendResponse.json();

    // Update last login in Firestore
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastLogin: new Date().toISOString(),
    });

    // Store backend JWT
    localStorage.setItem('authToken', backendData.token);
    localStorage.setItem('firebaseToken', idToken);
    localStorage.setItem('userRole', backendData.role);

    return {
      success: true,
      user: firebaseUser,
      role: backendData.role,
      backendToken: backendData.token,
      message: 'Login successful!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// ============================================================================
// 3. LOGOUT / SIGN OUT
// ============================================================================

export const firebaseLogout = async () => {
  try {
    await signOut(auth);

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('userRole');

    return {
      success: true,
      message: 'Logout successful!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// 4. GOOGLE OAUTH LOGIN
// ============================================================================

export const firebaseGoogleLogin = async (googleIdToken) => {
  try {
    // Verify Google token with Smart Campus backend
    const backendResponse = await fetch('/api/auth/firebase-google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: googleIdToken,
      }),
    });

    if (!backendResponse.ok) {
      throw new Error('Google authentication failed');
    }

    const backendData = await backendResponse.json();

    // Store tokens
    localStorage.setItem('authToken', backendData.token);
    localStorage.setItem('firebaseToken', googleIdToken);
    localStorage.setItem('userRole', backendData.role);
    localStorage.setItem('firebaseUid', backendData.firebaseUid);

    return {
      success: true,
      role: backendData.role,
      backendToken: backendData.token,
      firebaseUid: backendData.firebaseUid,
      message: 'Google login successful!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// 5. PHONE AUTHENTICATION
// ============================================================================

export const firebasePhoneSignUp = async (phoneNumber, fullName) => {
  try {
    // This requires setting up reCAPTCHA
    // Return stub for now
    return {
      success: false,
      error: 'Phone authentication requires additional setup (reCAPTCHA)',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// 6. ANONYMOUS LOGIN (Guest Browsing)
// ============================================================================

export const firebaseAnonymousLogin = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;

    // Store anonymous user in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: null,
      displayName: 'Guest User',
      role: 'GUEST',
      createdAt: new Date().toISOString(),
      provider: 'anonymous',
      lastLogin: new Date().toISOString(),
    });

    return {
      success: true,
      user: firebaseUser,
      role: 'GUEST',
      message: 'Anonymous login successful!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// 7. PASSWORD RESET
// ============================================================================

export const firebasePasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// 8. GET CURRENT USER
// ============================================================================

export const getCurrentUser = () => {
  return auth.currentUser;
};

// ============================================================================
// 9. GET USER DATA FROM FIRESTORE
// ============================================================================

export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      return {
        success: true,
        data: userDoc.data(),
      };
    } else {
      return {
        success: false,
        error: 'User not found',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// 10. WATCH AUTH STATE (Used in App.jsx)
// ============================================================================

export const setupAuthStateListener = (callback) => {
  return watchAuthState((firebaseUser) => {
    if (firebaseUser) {
      // User is signed in
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAnonymous: firebaseUser.isAnonymous,
      };
      callback(userData);
    } else {
      // User is signed out
      callback(null);
    }
  });
};

export default {
  firebaseRegister,
  firebaseLogin,
  firebaseLogout,
  firebaseGoogleLogin,
  firebasePhoneSignUp,
  firebaseAnonymousLogin,
  firebasePasswordReset,
  getCurrentUser,
  getUserData,
  setupAuthStateListener,
};
