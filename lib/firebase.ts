import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { getAuth, type Auth } from "firebase/auth"

// -- Your real config -----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDDf0hwca1s012G_mgz55twSsSKrJkdoEk",
  authDomain: "tmp1-6b89d.firebaseapp.com",
  projectId: "tmp1-6b89d",
  storageBucket: "tmp1-6b89d.appspot.com",
  messagingSenderId: "79352463362",
  appId: "1:79352463362:web:0ee6b40a91531fbc4c271b",
  measurementId: "G-Q1B23TYB6L",
}
// -------------------------------------------------

// Ensure we create *one* Firebase App
function createFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig)
  }
  return getApp()
}

const app = createFirebaseApp()

// ——— Instantiate **only** when we are in the browser ———
const isBrowser = typeof window !== "undefined"

export const db: Firestore | null = isBrowser ? getFirestore(app) : null
export const storage: FirebaseStorage | null = isBrowser ? getStorage(app) : null
export const auth: Auth | null = isBrowser ? getAuth(app) : null

// Provide fall-backs so imports don’t explode during SSR
// (client-only code will still receive real instances)
