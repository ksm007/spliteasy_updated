// app/api/receipt/receipts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user data
    const auth = await authenticateRequest(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // The auth.user object likely doesn't have a 'uid' property
    // Instead, it probably has a 'firebaseUid' property directly
    // or the user object structure is different from what you're expecting

    // Get the receipt directly using the user ID from auth
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id, // Use auth.user.id instead of looking up user again
      },
      include: {
        participants: true,
        items: {
          include: {
            assignments: {
              include: {
                participant: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { error: "Receipt not found or you don't have access" },
        { status: 404 }
      );
    }

    // Transform data for frontend compatibility
    const transformedReceipt = {
      ...receipt,
      items: receipt.items.map((item) => ({
        ...item,
        assignments: item.assignments.map((assignment) => ({
          participantId: assignment.participantId,
          amount: assignment.amount,
        })),
      })),
    };

    return NextResponse.json({ receipt: transformedReceipt });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}
