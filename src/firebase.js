import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9soxMmwMRCEaIF0U2Dl91_5bsz8rWQIM",
  authDomain: "autocar-8dda4.firebaseapp.com",
  projectId: "autocar-8dda4",
  storageBucket: "autocar-8dda4.firebasestorage.app",
  messagingSenderId: "389342318111",
  appId: "1:389342318111:web:87e87933ce9cca96b9cf2a",
  measurementId: "G-45C85B9Y1S"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;