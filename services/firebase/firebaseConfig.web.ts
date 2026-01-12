// services/firebase/firebaseConfig.web.ts
// Version WEB de la config Firebase (utilise browserLocalPersistence)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCIUcMu5xi_UUVfUn1twv8F6jLqYOeAylE',
  authDomain: 'app-christ-en-nous.firebaseapp.com',
  projectId: 'app-christ-en-nous',
  storageBucket: 'app-christ-en-nous.appspot.com',
  messagingSenderId: '774503250388',
  appId: '1:774503250388:web:932b03c828bc58264f3e41',
};

const app = initializeApp(firebaseConfig);

// ✅ Sur web, utiliser getAuth avec browserLocalPersistence
export const auth = getAuth(app);

// Configurer la persistance pour le web
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Firebase persistence error:', error);
});

export const db = getFirestore(app);
