import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBOwNJE8eZqduL1x-EifbDxFJxs0GuzAM8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'campusiq-5873b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campusiq-5873b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'campusiq-5873b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '158451085308',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:158451085308:web:0a08773fffae7c995c4c79',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-437EDXH8FQ',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (!db) {
  throw new Error('Firestore initialization failed: db is undefined.');
}

export { auth, db };
export default app;
