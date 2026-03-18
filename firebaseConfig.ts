import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
// @ts-ignore

// Firebase configuration loaded from environment variables (never hardcode keys!)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase safely
let app: any;
let auth: any;

if (!firebaseConfig.apiKey) {
  console.warn("🔥🔥🔥 FIREBASE ERROR: EXPO_PUBLIC_FIREBASE_API_KEY is missing! 🔥🔥🔥");
  console.warn("Ensure you have added your environment variables to EAS Secrets or .env file.");
  // Provide dummy objects to prevent immediate crashes in components
  app = {} as any;
  auth = {
    onAuthStateChanged: () => () => {},
    currentUser: null,
  } as any;
} else {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Auth with persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

// Initialize Analytics only if supported (prevents crash on native)
let analytics: any;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(err => {
  console.log("Analytics not supported in this environment");
});

export { analytics, auth };
export default app;