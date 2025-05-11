// firebase-auth.d.ts

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';

declare module 'firebase/auth' {
  /** Persistance React Native via AsyncStorage */
  export function getReactNativePersistence(
    storage: any
  ): any;

  /** Initialise Auth avec persistance React Native */
  export function initializeAuth(
    app: FirebaseApp,
    options: { persistence: any }
  ): Auth;
}
