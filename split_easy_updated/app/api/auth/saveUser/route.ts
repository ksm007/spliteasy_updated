// app/api/auth/saveUser/route.ts
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  // 1) Verify ID token from Authorization header
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return NextResponse.json(
      { error: "Missing Bearer token" },
      { status: 401 }
    );
  }
  const idToken = match[1];

  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // 2) Read body
  const { uid, email, name } = await request.json();

  // 3) Guard against UID mismatch
  if (uid !== decoded.uid || !email) {
    return NextResponse.json(
      { error: "UID mismatch or missing email" },
      { status: 400 }
    );
  }

  // 4) Upsert on `firebaseUid`
  const user = await prisma.user.upsert({
    where: { firebaseUid: uid },
    update: {
      email,
      name,
    },
    create: {
      firebaseUid: uid,
      email,
      name,
    },
  });

  return NextResponse.json({ user });
}
