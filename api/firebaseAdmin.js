import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Or using env vars:
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
      privateKey = privateKey.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID.trim(),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
          privateKey: privateKey,
        })
      });
    } else {
      throw new Error(`Missing Firebase Env Vars! Base64: ${!!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64} or PROJECT_ID: ${!!process.env.FIREBASE_PROJECT_ID}`);
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
