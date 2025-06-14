import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBQTlhHLyBcI00hV0T9jxI-N3OcXZ5LK7A",
  authDomain: "trendora-3bb12.firebaseapp.com",
  projectId: "trendora-3bb12",
  storageBucket: "trendora-3bb12.firebasestorage.app",
  messagingSenderId: "798184767368",
  appId: "1:798184767368:web:30b324582ba51d84bc043d",
  measurementId: "G-G3TG67EBKZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
