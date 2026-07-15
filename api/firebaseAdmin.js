import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// If you have a service account JSON file, you can initialize it like this:
// import serviceAccount from './serviceAccountKey.json' assert { type: "json" };
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Or using env vars:
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        })
      });
    } else {
      console.warn("Initializing Firebase Admin with application default credentials. This may fail if not deployed or without GOOGLE_APPLICATION_CREDENTIALS set.");
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
