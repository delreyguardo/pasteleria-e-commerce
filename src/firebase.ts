import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

// All required keys must be present and not be placeholder strings
const isConfigValid =
  !!firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !!firebaseConfig.projectId;

let app: FirebaseApp | undefined;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseConfigured = false;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;

    // Only log in development — never in production
    if (import.meta.env.DEV) {
      console.log("Firebase initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
  }
} else {
  // Only warn in development
  if (import.meta.env.DEV) {
    console.warn(
      "Firebase configuration is missing or invalid. Falling back to Mock Local Storage Database for demo purposes. " +
        "To use real Firebase, provide VITE_FIREBASE_* environment variables."
    );
  }
}

export { auth, db, isFirebaseConfigured };
