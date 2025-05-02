"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, SplitSquareHorizontal, Trash2 } from "lucide-react";
import { formatCurrency, getItemTotal, getRemainingAmount } from "./utils";
import {
  ItemAssignment,
  ParsedReceipt,
  Participant,
  ReceiptItem,
} from "@/types";

interface ReceiptTableProps {
  receipt: ParsedReceipt;
  updateReceiptItem: (index: number, updatedItem: Partial<ReceiptItem>) => void;
  deleteReceiptItem: (index: number) => void; // Added delete function prop
  participants: Participant[];
  updateTaxAndTip: (key: "tax" | "tip", value: number) => void;
}

export default function ReceiptTable({
  receipt,
  updateReceiptItem,
  deleteReceiptItem, // Added delete function
  participants,
  updateTaxAndTip,
}: ReceiptTableProps) {
  // Add assignment to an item
  const addAssignment = (itemIndex: number) => {
    const item = receipt.items[itemIndex];
    const remainingAmount = getRemainingAmount(item);

    if (remainingAmount <= 0) return;

    const assignments = [...(item.assignments || [])];
    assignments.push({
      participantId: "",
      amount: remainingAmount,
    });

    updateReceiptItem(itemIndex, { assignments });
  };

  // Remove an assignment from an item
  const removeAssignment = (itemIndex: number, assignmentIndex: number) => {
    const item = receipt.items[itemIndex];
    const assignments = [...(item.assignments || [])];
    assignments.splice(assignmentIndex, 1);

    updateReceiptItem(itemIndex, { assignments });
  };

  // Update an assignment
  const updateAssignment = (
    itemIndex: number,
    assignmentIndex: number,
    updates: Partial<ItemAssignment>
  ) => {
    const item = receipt.items[itemIndex];
    const assignments = [...(item.assignments || [])];
    assignments[assignmentIndex] = {
      ...assignments[assignmentIndex],
      ...updates,
    };

    updateReceiptItem(itemIndex, { assignments });
  };

  // Get available participants (exclude those already assigned to this item)
  const getAvailableParticipants = (
    itemIndex: number,
    currentAssignmentIndex: number
  ) => {
    const item = receipt.items[itemIndex];
    const assignments = item.assignments || [];

    // Get IDs of participants already assigned to this item (except the current one being edited)
    const assignedParticipantIds = assignments
      .filter((_, index) => index !== currentAssignmentIndex)
      .map((a) => a.participantId)
      .filter((id) => id); // Filter out empty strings

    // Return only participants that are not already assigned
    return participants.filter((p) => !assignedParticipantIds.includes(p.id));
  };

  // Split equally function
  const splitEqually = (itemIndex: number) => {
    const item = receipt.items[itemIndex];

    // Get assigned participants (filter out empty participantId)
    const assignments = (item.assignments || []).filter((a) => a.participantId);

    if (assignments.length === 0) {
      // No assigned participants, do nothing
      return;
    }

    const itemTotal = getItemTotal(item);
    const equalShare = itemTotal / assignments.length;

    // Update each assignment with equal share
    const updatedAssignments = assignments.map((a) => ({
      ...a,
      amount: equalShare,
    }));

    // Update the item
    updateReceiptItem(itemIndex, { assignments: updatedAssignments });
  };

  // Add a new empty row for a missed item
  const addNewItem = () => {
    const newItem = {
      description: "",
      quantity: 1,
      price: 0,
      isMultiplied: false,
      assignments: [],
    };

    if (typeof window !== "undefined") {
      const event = new CustomEvent("addNewReceiptItem", { detail: newItem });
      window.dispatchEvent(event);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Table style={{ width: "100%" }}>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            {participants.length > 0 && <TableHead>Assigned To</TableHead>}
            <TableHead>Qty</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Multiplied?</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipt.items.map((item, i) => (
            <TableRow key={i}>
              <TableCell>
                <Input
                  value={item.description}
                  onChange={(e) => {
                    updateReceiptItem(i, {
                      description: e.target.value,
                    });
                  }}
                  className="w-full"
                />
              </TableCell>
              {participants.length > 0 && (
                <TableCell>
                  <div className="space-y-2">
                    {(item.assignments || []).map(
                      (assignment, assignmentIndex) => (
                        <div
                          key={assignmentIndex}
                          className="flex items-center gap-2"
                        >
                          <Select
                            value={assignment.participantId || "unassigned"}
                            onValueChange={(value) => {
                              updateAssignment(i, assignmentIndex, {
                                participantId:
                                  value === "unassigned" ? "" : value,
                              });
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select person" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">
                                Unassigned
                              </SelectItem>
                              {getAvailableParticipants(i, assignmentIndex).map(
                                (p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={assignment.amount}
                            onChange={(e) => {
                              updateAssignment(i, assignmentIndex, {
                                amount: parseFloat(e.target.value) || 0,
                              });
                            }}
                            className="w-20"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAssignment(i, assignmentIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}

                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAssignment(i)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add person
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => splitEqually(i)}
                      >
                        <SplitSquareHorizontal className="h-4 w-4 mr-1" /> Split
                        Equally
                      </Button>
                    </div>

                    {getRemainingAmount(item) > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Unassigned: {formatCurrency(getRemainingAmount(item))}
                      </div>
                    )}
                  </div>
                </TableCell>
              )}
              <TableCell>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    updateReceiptItem(i, {
                      quantity: parseFloat(e.target.value) || 0,
                    });
                  }}
                  className="w-16 text-right"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => {
                    updateReceiptItem(i, {
                      price: parseFloat(e.target.value) || 0,
                    });
                  }}
                  className="w-24 text-right"
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={item.isMultiplied}
                  onCheckedChange={(checked) => {
                    updateReceiptItem(i, { isMultiplied: !!checked });
                  }}
                />
              </TableCell>
              <TableCell>{formatCurrency(getItemTotal(item))}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReceiptItem(i)}
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell
              colSpan={participants.length > 0 ? 6 : 5}
              className="text-right font-medium"
            >
              Subtotal
            </TableCell>
            <TableCell>{formatCurrency(receipt.subtotal)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={participants.length > 0 ? 5 : 4}
              className="text-right font-medium"
            >
              Tax
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={receipt.tax}
                onChange={(e) => {
                  updateTaxAndTip("tax", parseFloat(e.target.value) || 0);
                }}
                className="w-24 text-right"
              />
            </TableCell>
            <TableCell>{formatCurrency(receipt.tax)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={participants.length > 0 ? 5 : 4}
              className="text-right font-medium"
            >
              Tip
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={receipt.tip}
                onChange={(e) => {
                  updateTaxAndTip("tip", parseFloat(e.target.value) || 0);
                }}
                className="w-24 text-right"
              />
            </TableCell>
            <TableCell>{formatCurrency(receipt.tip)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={participants.length > 0 ? 6 : 5}
              className="text-right font-medium"
            >
              Total
            </TableCell>
            <TableCell>{formatCurrency(receipt.total)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Add Item Button */}
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={addNewItem}>
          <Plus className="h-4 w-4 mr-1" /> Add Missed Item
        </Button>
      </div>
    </div>
  );
}
