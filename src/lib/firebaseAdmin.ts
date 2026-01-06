// lib/firebaseAdmin.js
import admin from "firebase-admin";

// Debug function to check environment variables
function debugEnvVars() {
  console.log("Firebase Admin Environment Variables Check:");
  console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing");
  console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "✓ Set" : "✗ Missing");
  console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "✓ Set" : "✗ Missing");
  
  // Check if private key format looks correct
  if (process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    console.log("Private key starts with:", privateKey.substring(0, 50) + "...");
    console.log("Private key format check:", privateKey.includes("-----BEGIN PRIVATE KEY-----") ? "✓ Valid format" : "✗ Invalid format");
  }
}

if (!admin.apps.length) {
  try {
    // Debug environment variables  
    debugEnvVars();

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    // Validate required fields
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error("Missing required Firebase Admin environment variables");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally add database URL if you're using Realtime Database
      // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
    });
    
    console.log("Firebase Admin initialized successfully");
    console.log("Project ID:", serviceAccount.projectId);
    
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    console.error("Error details:", error.message);
    throw error; // Re-throw to prevent silent failures
  }
} else {
  console.log("Firebase Admin already initialized");
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();
export default admin;