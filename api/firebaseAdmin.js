import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Or using env vars:
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
      // Remove surrounding quotes if accidentally copied
      privateKey = privateKey.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      // Handle escaped newlines
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        })
      });
    } else {
      throw new Error(`Missing Firebase Env Vars! PROJECT_ID: ${!!process.env.FIREBASE_PROJECT_ID}, EMAIL: ${!!process.env.FIREBASE_CLIENT_EMAIL}, KEY: ${!!process.env.FIREBASE_PRIVATE_KEY}`);
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
