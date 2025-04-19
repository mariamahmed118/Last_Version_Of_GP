import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signupUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const saveDebate = async (userId, debateData) => {
  const debateRef = doc(collection(db, 'users', userId, 'debates'));
  await setDoc(debateRef, debateData);
  return debateRef.id;
};

export const getUserDebates = async (userId) => {
  const debatesRef = collection(db, 'users', userId, 'debates');
  const snapshot = await getDocs(debatesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};