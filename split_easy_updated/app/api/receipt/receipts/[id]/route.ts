// app/api/receipts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
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
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Transform the data to match your frontend model
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
