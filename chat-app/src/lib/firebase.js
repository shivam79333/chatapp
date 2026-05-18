// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

console.log("🔥 Firebase Config loaded:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId?.substring(0, 20) + "...",
});

let app;
let db;
let auth;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized");

  // Initialize Firestore
  db = getFirestore(app);
  console.log("✅ Firestore initialized");

  // Initialize Firebase Authentication
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.error("Firebase Config was:", firebaseConfig);
}

export { db, auth, app };
export default app;