// lib/auth-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import admin from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

export async function authenticateRequest(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = cookies().get("__session")?.value;

    if (!sessionCookie) {
      return { authenticated: false };
    }

    // Verify the session cookie
    const decodedClaims = await admin.auth().verifySessionCookie(
      sessionCookie,
      true // Check if cookie has been revoked
    );

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
    });

    if (!user) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      uid: decodedClaims.uid,
      user,
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return { authenticated: false };
  }
}
