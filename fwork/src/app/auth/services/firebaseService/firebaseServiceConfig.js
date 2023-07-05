// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// console.info('👋 [ENVIRONMENT]', process.env.REACT_APP_ENVIRONMENT);

export const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// export const firebaseVapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

// // Initialize Firebase
// const app = initializeApp(config);

// // Initialize Firebase Authentication and get a reference to the service
// export const auth = getAuth(app);

// export const providers = {
//   facebook: new auth.FacebookAuthProvider(),
// };

// export default app;

// console.info('👋 [ENVIRONMENT]', process.env.REACT_APP_ENVIRONMENT);

const firebaseServiceConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

export const firebaseVapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export default firebaseServiceConfig;
