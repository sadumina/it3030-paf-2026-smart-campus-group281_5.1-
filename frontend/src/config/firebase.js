import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase Web API Key
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and set persistence
export const auth = getAuth(app);

// Enable persistent login (survives page refresh)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Firebase persistence error:', error);
  });

// Initialize Firestore (optional, for storing custom user data)
export const db = getFirestore(app);

// Export auth state listener utility
export const watchAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
