/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBd7byB8OPDiEYshxboT7gKAXiw_H-2wj8",
  authDomain: "moncsi-kepzes.firebaseapp.com",
  projectId: "moncsi-kepzes",
  storageBucket: "moncsi-kepzes.firebasestorage.app",
  messagingSenderId: "374902983897",
  appId: "1:374902983897:web:ead0a2e125b406f1e6c2c8",
  measurementId: "G-1QTXB41390"
};

const isFirebaseConfigured = true;

// Initialize Firebase only if configured
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

