// app/api/receipts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create receipt with nested data
    const receipt = await prisma.receipt.create({
      data: {
        subtotal: data.subtotal,
        tax: data.tax,
        tip: data.tip,
        total: data.total,
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

    // Create assignments separately since they relate to both items and participants
    for (const item of data.items) {
      if (item.assignments && item.assignments.length > 0) {
        const createdItem = receipt.items.find(
          (i) => i.description === item.description
        );

        if (createdItem) {
          for (const assignment of item.assignments) {
            if (assignment.participantId) {
              // Find the corresponding participant in the database
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
    });
  } catch (error) {
    console.error("Error saving receipt:", error);
    return NextResponse.json(
      { error: "Failed to save receipt" },
      { status: 500 }
    );
  }
}

// app/api/receipts/route.ts (add to existing file)
export async function GET() {
  try {
    const receipts = await prisma.receipt.findMany({
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
