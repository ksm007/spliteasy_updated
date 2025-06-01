// app/actions/receiptActions.ts
"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const paramsSchema = z.object({
  id: z.string(),
});

/**
 * Fetch a single receipt (and its related data) by ID.
 * Throws if unauthorized, not found, etc.
 */
export async function getReceiptById(receiptId: string) {
  // 1) Auth check
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2) Find the Clerk‐user in your DB
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 3) Validate that receiptId is actually a string
  const validation = paramsSchema.safeParse({ id: receiptId });
  if (!validation.success) {
    throw new Error("Invalid receipt ID");
  }

  // 4) Fetch the receipt + related data
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
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

  // 5) Check ownership / existence
  if (!receipt || receipt.userId !== user.id) {
    throw new Error("Receipt not found or unauthorized");
  }

  // 6) Transform the “assignments” array to strip out participant objects
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
  const safeReceipts = JSON.parse(JSON.stringify(transformedReceipt));
  return { success: true, receipt: safeReceipts };
}

/**
 * Update a receipt (PUT) by ID.
 * Accepts a partial payload; you can expand validation as needed.
 */
export async function updateReceiptById(
  receiptId: string,
  body: {
    // put here exactly the fields you expect in the request body
    name?: string;
    total?: number;
    tax?: number;
    tip?: number;
    isFullyAssigned?: boolean;
    // …and so on
  }
) {
  // 1) Auth check
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2) Validate ID
  const validation = paramsSchema.safeParse({ id: receiptId });
  if (!validation.success) {
    throw new Error("Invalid receipt ID");
  }

  // 3) Ensure the receipt exists and belongs to this user
  const existingReceipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
  });
  if (!existingReceipt || existingReceipt.userId !== user.id) {
    throw new Error("Receipt not found or unauthorized");
  }

  // 4) Perform the update
  const updatedReceipt = await prisma.receipt.update({
    where: { id: receiptId },
    data: {
      // Only include fields from `body` that you truly want to update:
      // (you could add zod validation here if you wish)
      name: body.name,
      total: body.total,
      tax: body.tax,
      tip: body.tip,
      isFullyAssigned: body.isFullyAssigned,
      updatedAt: new Date(),
      // …if you need to handle nested updates for participants/items, do that here
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
  const safeReceipt = JSON.parse(JSON.stringify(updatedReceipt));
  return { success: true, receipt: safeReceipt };
}

/**
 * Delete a receipt (DELETE) by ID.
 */
export async function deleteReceiptById(receiptId: string) {
  // 1) Auth check
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2) Validate ID
  const validation = paramsSchema.safeParse({ id: receiptId });
  if (!validation.success) {
    throw new Error("Invalid receipt ID");
  }

  // 3) Ensure the receipt exists and belongs to this user
  const existingReceipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
  });
  if (!existingReceipt || existingReceipt.userId !== user.id) {
    throw new Error("Receipt not found or unauthorized");
  }

  // 4) Delete (and rely on your Prisma cascade rules or do manual cleanup first)
  await prisma.receipt.delete({
    where: { id: receiptId },
  });

  return { success: true };
}
