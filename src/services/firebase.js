import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration — hardcoded (no env vars)
const firebaseConfig = {
  apiKey: "AIzaSyBOwNJE8eZqduL1x-EifbDxFJxs0GuzAM8",
  authDomain: "campusiq-5873b.firebaseapp.com",
  projectId: "campusiq-5873b",
  storageBucket: "campusiq-5873b.firebasestorage.app",
  messagingSenderId: "158451085308",
  appId: "1:158451085308:web:0a08773fffae7c995c4c79",
  measurementId: "G-437EDXH8FQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
