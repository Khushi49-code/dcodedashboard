// lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;

    if (
      !process.env.FIREBASE_PROJECT_ID_2 ||
      !process.env.FIREBASE_CLIENT_EMAIL_2 ||
      !privateKeyBase64
    ) {
      throw new Error(
        "Missing required Firebase Admin environment variables."
      );
    }

    const privateKey = Buffer.from(
      privateKeyBase64,
      "base64"
    ).toString("utf-8");

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID_2,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL_2,
      privateKey,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Error details:", message);

    throw error;
  }
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();

export default admin;