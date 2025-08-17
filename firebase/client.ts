import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAk3RjJ1IOG6l9CwaXiwYDL7p_ota5yOrY",
  authDomain: "flash-ai-55022.firebaseapp.com",
  projectId: "flash-ai-55022",
  storageBucket: "flash-ai-55022.firebasestorage.app",
  messagingSenderId: "1005252305928",
  appId: "1:1005252305928:web:c28bff1debcbc087d89dbd",
  measurementId: "G-6QEB7H8QP9"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);