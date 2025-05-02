// utils.ts
import { ReceiptItem, ParsedReceipt, ItemAssignment } from "@/types";

export function calculateTotals(items: ReceiptItem[]): {
  subtotal: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => {
    return sum + getItemTotal(item);
  }, 0);

  return {
    subtotal,
    total: subtotal, // Base calculation (tax and tip will be added by the component)
  };
}

export function getItemTotal(item: ReceiptItem): number {
  return item.isMultiplied ? item.price : item.price * item.quantity;
}

export function getTotalAssignedAmount(item: ReceiptItem): number {
  if (!item.assignments) return 0;
  return item.assignments.reduce(
    (sum, assignment) => sum + assignment.amount,
    0
  );
}

export function getRemainingAmount(item: ReceiptItem): number {
  const itemTotal = getItemTotal(item);
  const assignedAmount = (item.assignments || []).reduce(
    (sum, assignment) => sum + assignment.amount,
    0
  );
  return Math.max(0, itemTotal - assignedAmount);
}

export function createUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export const getIdToken = async (forceRefresh = false) => {
  // This assumes you have a function in your AuthContext to get a fresh token
  // You might need to implement this based on your Firebase configuration
  return await fetch("/api/auth/getToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => data.token);
};