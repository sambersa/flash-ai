import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDb7-j74FbeoFATIkyWvaajdxSQnUih2X0",
  authDomain: "flash-ai-8ae45.firebaseapp.com",
  projectId: "flash-ai-8ae45",
  storageBucket: "flash-ai-8ae45.firebasestorage.app",
  messagingSenderId: "889933690964",
  appId: "1:889933690964:web:5f7d3af4749fe92d38d5c1",
  measurementId: "G-B3G8MRKFK4"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) :getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);