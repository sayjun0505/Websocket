// // Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  EmailAuthProvider,
  FacebookAuthProvider,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

import firebaseServiceConfig from './firebaseServiceConfig';

// console.log('👉👽 initialize firebase');
// Initialize Firebase
const app = initializeApp(firebaseServiceConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
(async () => {
  await setPersistence(auth, browserLocalPersistence);
})();

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export const providers = {
  email: new EmailAuthProvider(),
  facebook: new FacebookAuthProvider(),
};

// console.log('👉👽 initialize providers', providers);
export default app;
