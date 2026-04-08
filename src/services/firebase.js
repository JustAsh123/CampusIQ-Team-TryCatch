import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOwNJE8eZqduL1x-EifbDxFJxs0GuzAM8",
  authDomain: "campusiq-5873b.firebaseapp.com",
  projectId: "campusiq-5873b",
  storageBucket: "campusiq-5873b.firebasestorage.app",
  messagingSenderId: "158451085308",
  appId: "1:158451085308:web:0a08773fffae7c995c4c79",
  measurementId: "G-437EDXH8FQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
