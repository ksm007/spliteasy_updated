import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0OnqVxUYDEpWUehFYUvqZH-9ohzGUNzM",
  authDomain: "spliteasy-82121.firebaseapp.com",
  projectId: "spliteasy-82121",
  storageBucket: "spliteasy-82121.firebasestorage.app",
  messagingSenderId: "392793642472",
  appId: "1:392793642472:web:bf4a73bc5bc9dd6fd7c05d",
  measurementId: "G-DLR199ZPCS",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export default app;
