//Salary calculated based on attendance. in all types.
// 2. All data will be saved in the database, and whenever the user logs in, all data will be shown the same.
// 3. Check all flow properly, and if needed, then improve it. I need a perfect app.
// 4. Add all dynamic sample data of employees. please not store in localStorage any data or sample data. all stored in Firebase. Also give me a flow of how I test all things end-to-end. It means how to log in and then add an emp. I take attendance... like ok?

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

// -- Your real config -----------------------------
const firebaseConfig = {
  // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  apiKey: "AIzaSyDDf0hwca1s012G_mgz55twSsSKrJkdoEk",
  authDomain: "tmp1-6b89d.firebaseapp.com",
  projectId: "tmp1-6b89d",
  storageBucket: "tmp1-6b89d.appspot.com",
  messagingSenderId: "79352463362",
  appId: "1:79352463362:web:0ee6b40a91531fbc4c271b",
  measurementId: "G-Q1B23TYB6L",
};
// -------------------------------------------------

// Ensure we create *one* Firebase App
function createFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = createFirebaseApp();

// ——— Instantiate **only** when we are in the browser ———
const isBrowser = typeof window !== "undefined";

export const db: Firestore | null = isBrowser ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = isBrowser
  ? getStorage(app)
  : null;
export const auth: Auth | null = isBrowser ? getAuth(app) : null;

// Provide fall-backs so imports don’t explode during SSR
// (client-only code will still receive real instances)
