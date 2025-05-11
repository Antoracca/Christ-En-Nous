// services/firebase/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 IMPORT LITE
import {
  getFirestore as getFirestoreLite,
} from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: 'AIzaSyCIUcMu5xi_UUVfUn1twv8F6jLqYOeAylE',
  authDomain: 'app-christ-en-nous.firebaseapp.com',
  projectId: 'app-christ-en-nous',
  storageBucket: 'app-christ-en-nous.appspot.com',
  messagingSenderId: '774503250388',
  appId: '1:774503250388:web:932b03c828bc58264f3e41',
};

const app = initializeApp(firebaseConfig);

// Auth RN avec persistance AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// LITE Firestore = pas de WebChannel, pas de warnings, super-rapide
export const db = getFirestoreLite(app);
