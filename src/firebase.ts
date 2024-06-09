import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDnaERcUhJUgoBoh61RY4egGXEiA8GUTlw",
  authDomain: "nwitter-reloaded-a943e.firebaseapp.com",
  projectId: "nwitter-reloaded-a943e",
  storageBucket: "nwitter-reloaded-a943e.appspot.com",
  messagingSenderId: "1012776783446",
  appId: "1:1012776783446:web:c9024623333632e20eb5f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);