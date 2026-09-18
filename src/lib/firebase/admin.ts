import admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY!
  );

  admin.initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();