
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "kite-ndagf",
  appId: "REDACTED_FIREBASE_APP_ID",
  storageBucket: "kite-ndagf.firebasestorage.app",
  apiKey: "REDACTED_FIREBASE_API_KEY",
  authDomain: "kite-ndagf.firebaseapp.com",
  messagingSenderId: "REDACTED_SENDER_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
