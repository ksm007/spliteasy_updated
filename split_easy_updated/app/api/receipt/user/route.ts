import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFirebaseUser } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Get the Firebase ID token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the Firebase token and get user
    const firebaseUser = await getFirebaseUser(token);
    if (!firebaseUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all receipts for this user
    const receipts = await prisma.receipt.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        participants: true,
        items: {
          include: {
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json({ receipts });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    );
  }
}
