import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "firebase-admin";

// Ensure Firebase Admin is initialized
// customInitApp();

export async function POST(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify the session cookie
    const decodedClaim = await auth().verifySessionCookie(sessionCookie, true);

    // Create a custom token for the client
    const token = await auth().createCustomToken(decodedClaim.uid);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}
