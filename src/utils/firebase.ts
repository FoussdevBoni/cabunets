import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBlmw-NyVjrwcI8cHE1SX7Ag0Q1qz2bPm0',
  authDomain: 'sasatro-fb819.firebaseapp.com',
  databaseURL: 'https://sasatro-fb819-default-rtdb.firebaseio.com',
  projectId: 'sasatro-fb819',
  storageBucket: 'sasatro-fb819.appspot.com',
  messagingSenderId: '704906508448',
  appId: '1:704906508448:web:e74f138c0816b1df0831c5',
  measurementId: 'G-6GVESEPYDM',
};
const app = initializeApp(firebaseConfig);

// Constante pour realtime Database
// Constante pour authentification
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const database = getDatabase(app);

