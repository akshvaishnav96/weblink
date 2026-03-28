import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton — safe against HMR double-init in dev
function getFirebaseApp(): FirebaseApp | null {
  try {
    if (!firebaseConfig.apiKey) return null; // not configured yet
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch {
    return null;
  }
}

// Analytics is browser-only — call inside useEffect / client components
export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    return getAnalytics(app);
  } catch {
    return null;
  }
}
