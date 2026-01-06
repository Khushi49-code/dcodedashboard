// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdhiW3Q9ojW6ZxtitF05mUZbukBK2zX5I",
  authDomain: "findgf-ai.firebaseapp.com",
  projectId: "findgf-ai",
  storageBucket: "findgf-ai.firebasestorage.app",
  messagingSenderId: "394318773102",
  appId: "1:394318773102:web:0edf9cdd2e2e0171689f7f",
  measurementId: "G-TKHT4C08HP",  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Analytics only in browser
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default db;
export { app, analytics };
