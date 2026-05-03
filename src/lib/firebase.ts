import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9_Zex3aXWXAUQK3pjFs8m_i9NPK2gNKg",
  authDomain: "tracex-10c51.firebaseapp.com",
  projectId: "tracex-10c51",
  storageBucket: "tracex-10c51.firebasestorage.app",
  messagingSenderId: "826609904842",
  appId: "1:826609904842:web:bf2ff43a81dab33245d833"
};

// Initialize Firebase for the browser
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
