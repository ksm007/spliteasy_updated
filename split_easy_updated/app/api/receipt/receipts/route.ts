import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth-middleware";

export async function POST(request: NextRequest) {
  try {
    // Get the Firebase ID token from Authorization header
    const auth = await authenticateRequest(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get receipt data from request
    const data = await request.json();

    // Check if all funds are assigned
    const isFullyAssigned = checkAllFundsAssigned(data.items);

    // Create receipt with nested data
    const receipt = await prisma.receipt.create({
      data: {
        userId: auth.user.id,
        subtotal: data.subtotal,
        tax: data.tax,
        tip: data.tip,
        total: data.total,
        isFullyAssigned,
        participants: {
          create: data.participants.map((participant: any) => ({
            name: participant.name,
          })),
        },
        items: {
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            isMultiplied: item.isMultiplied,
          })),
        },
      },
      include: {
        participants: true,
        items: true,
      },
    });

    // Create assignments
    for (const item of data.items) {
      if (item.assignments && item.assignments.length > 0) {
        const createdItem = receipt.items.find(
          (i) => i.description === item.description
        );

        if (createdItem) {
          for (const assignment of item.assignments) {
            if (assignment.participantId) {
              const originalParticipant = data.participants.find(
                (p: any) => p.id === assignment.participantId
              );

              if (originalParticipant) {
                const dbParticipant = receipt.participants.find(
                  (p) => p.name === originalParticipant.name
                );

                if (dbParticipant) {
                  await prisma.assignment.create({
                    data: {
                      itemId: createdItem.id,
                      participantId: dbParticipant.id,
                      amount: assignment.amount,
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      receiptId: receipt.id,
      isFullyAssigned,
    });
  } catch (error) {
    console.error("Error saving receipt:", error);
    return NextResponse.json(
      { error: "Failed to save receipt" },
      { status: 500 }
    );
  }
}

// Helper function to check if all funds are assigned
function checkAllFundsAssigned(items: any[]): boolean {
  for (const item of items) {
    const itemTotal = item.isMultiplied
      ? item.price
      : item.price * item.quantity;
    const assignedTotal = (item.assignments || []).reduce(
      (sum: number, assignment: any) => sum + assignment.amount,
      0
    );

    // If there's a difference between assigned amount and item total
    if (Math.abs(itemTotal - assignedTotal) > 0.01) {
      return false;
    }
  }
  return true;
}

// app/api/receipt/receipts/route.ts (add GET handler)
export async function GET(request: NextRequest) {
  try {
    // Get Firebase ID token
    const auth = await authenticateRequest(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(auth.user.id, "Fetching receipts for user");

    // Get receipts for this user
    const receipts = await prisma.receipt.findMany({
      where: {
        userId: auth.user.id,
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
