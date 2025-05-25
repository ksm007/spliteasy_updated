// app/api/receipt/receipts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth-middleware";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate params
    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: "Invalid receipt ID" },
        { status: 400 }
      );
    }

    // Fetch receipt
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
        items: {
          include: {
            assignments: {
              include: { participant: true },
            },
          },
        },
      },
    });

    // Authorization check
    if (!receipt || receipt.userId !== auth.user.id) {
      return NextResponse.json(
        { error: "Receipt not found or unauthorized" },
        { status: 404 }
      );
    }

    // Transform data
    const transformedReceipt = {
      ...receipt,
      items: receipt.items.map((item) => ({
        ...item,
        assignments: item.assignments.map(({ participantId, amount }) => ({
          participantId,
          amount,
        })),
      })),
    };

    // Add caching headers
    const response = NextResponse.json({ receipt: transformedReceipt });
    response.headers.set("Cache-Control", "private, max-age=60");
    return response;
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate params
    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: "Invalid receipt ID" },
        { status: 400 }
      );
    }

    // Check if receipt exists and belongs to user
    const existingReceipt = await prisma.receipt.findUnique({
      where: { id: params.id },
    });

    if (!existingReceipt || existingReceipt.userId !== auth.user.id) {
      return NextResponse.json(
        { error: "Receipt not found or unauthorized" },
        { status: 404 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Update receipt
    // Note: This is a simplified example. You would need to add validation for the body
    // and handle updates to related records like items and participants as needed.
    const updatedReceipt = await prisma.receipt.update({
      where: { id: params.id },
      data: {
        // Add the fields you want to update here
        // For example:
        // name: body.name,
        // total: body.total,
        // tax: body.tax,
        // tip: body.tip,
        // isFullyAssigned: body.isFullyAssigned,
        updatedAt: new Date(),
      },
      include: {
        participants: true,
        items: {
          include: {
            assignments: {
              include: { participant: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ receipt: updatedReceipt });
  } catch (error) {
    console.error("Error updating receipt:", error);
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate params
    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: "Invalid receipt ID" },
        { status: 400 }
      );
    }

    // Check if receipt exists and belongs to user
    const existingReceipt = await prisma.receipt.findUnique({
      where: { id: params.id },
    });

    if (!existingReceipt || existingReceipt.userId !== auth.user.id) {
      return NextResponse.json(
        { error: "Receipt not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete receipt and related records
    // Note: This depends on your database cascade settings
    // You might need to delete related records manually first
    await prisma.receipt.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return NextResponse.json(
      { error: "Failed to delete receipt" },
      { status: 500 }
    );
  }
}

