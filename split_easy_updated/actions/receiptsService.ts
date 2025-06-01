// lib/receiptService.ts
"use server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createReceipt(data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const isFullyAssigned = checkAllFundsAssigned(data.items);

  const receipt = await prisma.receipt.create({
    data: {
      userId: user.id,
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

  for (const item of data.items) {
    if (item.assignments?.length > 0) {
      const createdItem = receipt.items.find(
        (i) => i.description === item.description
      );

      if (createdItem) {
        for (const assignment of item.assignments) {
          const originalParticipant = data.participants.find(
            (p: any) => p.id === assignment.participantId
          );
          const dbParticipant = receipt.participants.find(
            (p) => p.name === originalParticipant?.name
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

  return {
    success: true,
    receiptId: receipt.id,
    isFullyAssigned,
  };
}

export async function getReceipts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const receipts = await prisma.receipt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      participants: true,
      items: {
        include: {
          assignments: true,
        },
      },
    },
  });
  const safeReceipts = JSON.parse(JSON.stringify(receipts));
  return { success: true, receipts: safeReceipts };
}

// Helper
function checkAllFundsAssigned(items: any[]): boolean {
  return items.every((item) => {
    const itemTotal = item.isMultiplied
      ? item.price
      : item.price * item.quantity;
    const assignedTotal = (item.assignments || []).reduce(
      (sum: number, assignment: any) => sum + assignment.amount,
      0
    );
    return Math.abs(itemTotal - assignedTotal) <= 0.01;
  });
}
