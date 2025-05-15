import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDe5zWlWwn8B5uFFa3Rdd0at2ntou1xT1w",
  authDomain: "back-end-3314b.firebaseapp.com",
  projectId: "back-end-3314b",
  storageBucket: "back-end-3314b.appspot.com",
  messagingSenderId: "347522424475",
  appId: "1:347522424475:web:368aed68cd33d0a939703e",
  measurementId: "G-J9ZEPYNTM1",
};

let app;
let auth;
let db;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);
  db = getFirestore(app);
}

export { app, auth, db };