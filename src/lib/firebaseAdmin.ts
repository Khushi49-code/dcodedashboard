// lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error("Missing required Firebase Admin environment variables. Did you run setup-firebase.js?");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", message);
    throw error;
  }
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();
export default admin;