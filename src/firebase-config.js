// ─── Firebase setup ─────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com → Create project
// 2. Build → Authentication → Sign-in method → enable Google + Email/Password
// 3. Build → Firestore Database → Create database (production mode)
// 4. Project Settings → Your apps → Web app → copy config below.
//
// Firestore rules (Firestore → Rules) — private per-user data:
//
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{db}/documents {
//       match /users/{uid}/entries/{docId} {
//         allow read, write: if request.auth != null && request.auth.uid == uid;
//       }
//     }
//   }
//
// Data persists indefinitely in Firestore (multi-year tracking safe).

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: paste your Firebase web config here (see README.md)
const firebaseConfig = {
  apiKey: 'AIzaSyBowp8YbR_Y7OMZ5xn0pjy8QgI_qghTN3w',
  authDomain: 'leetcode-tracker-effe2.firebaseapp.com',
  projectId: 'leetcode-tracker-effe2',
  storageBucket: 'leetcode-tracker-effe2.firebasestorage.app',
  messagingSenderId: '885667872621',
  appId: '1:885667872621:web:67e03111d46d95937f2464',
  measurementId: 'G-J45GSTGJLJ'
}

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY'

let app = null
let auth = null
let db = null
let googleProvider = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
}

export { app, auth, db, googleProvider }
