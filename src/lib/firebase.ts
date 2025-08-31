import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-app.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-app',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-app.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdefg',
};

// Initialize Firebase only if we have a valid config
let app: any = null;
let auth: any = null;
let db: any = null;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization failed. Using demo mode.', error);
  // Create mock objects for development
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signInWithPopup: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.reject(new Error('Firebase not configured')),
  };
  
  db = {
    collection: () => ({
      add: () => Promise.reject(new Error('Firebase not configured')),
      get: () => Promise.resolve({ docs: [] }),
      doc: () => ({
        get: () => Promise.resolve({ exists: false }),
        set: () => Promise.reject(new Error('Firebase not configured')),
        update: () => Promise.reject(new Error('Firebase not configured')),
        delete: () => Promise.reject(new Error('Firebase not configured')),
      }),
    }),
  };
}

export { auth, db };
export default app;
