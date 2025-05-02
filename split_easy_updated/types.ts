// types.ts
export interface ReceiptItem {
  description: string;
  quantity: number;
  price: number;
  isMultiplied: boolean;
  assignments: ItemAssignment[];  // Multiple assignments per item
}
// types.ts
export interface ItemAssignment {
  participantId: string; // Empty string means unassigned
  amount: number; // Specific amount assigned to this participant
}

export type ParsedReceipt = {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

export type Participant = {
  id: string;
  name: string;
};

export interface ItemAllocation {
  itemIndex: number;
  participantId: string;
  percentage: number;
}
