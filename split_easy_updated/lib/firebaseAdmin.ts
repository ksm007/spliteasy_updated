// lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    // Either use GOOGLE_APPLICATION_CREDENTIALS env var pointing at your service account JSON...
    // OR inline:
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

export default admin;
