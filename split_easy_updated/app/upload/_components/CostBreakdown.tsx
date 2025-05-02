"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ParsedReceipt, Participant } from "@/types";
import { formatCurrency, getItemTotal } from "./utils";

interface CostBreakdownProps {
  receipt: ParsedReceipt;
  participants: Participant[];
}

export default function CostBreakdown({
  receipt,
  participants,
}: CostBreakdownProps) {
  if (participants.length === 0) return null;

  // Calculate breakdown by participant
  const breakdown = participants.map((participant) => {
    // Sum up all assignments for this participant
    let itemsTotal = 0;
    
    receipt.items.forEach(item => {
      if (!item.assignments) return;
      
      const participantAssignments = item.assignments.filter(
        a => a.participantId === participant.id
      );
      
      participantAssignments.forEach(assignment => {
        itemsTotal += assignment.amount;
      });
    });

    // Calculate proportion of tax and tip based on items total
    const proportion = receipt.subtotal > 0 ? itemsTotal / receipt.subtotal : 0;
    const taxShare = receipt.tax * proportion;
    const tipShare = receipt.tip * proportion;

    return {
      participant,
      itemsTotal,
      taxShare,
      tipShare,
      total: itemsTotal + taxShare + tipShare,
    };
  });

  // Calculate unassigned costs
  let unassignedTotal = 0;
  
  receipt.items.forEach(item => {
    const itemTotal = getItemTotal(item);
    const assignedTotal = item.assignments ? 
      item.assignments.reduce((sum, a) => sum + a.amount, 0) : 0;
    
    unassignedTotal += Math.max(0, itemTotal - assignedTotal);
  });

  const unassignedProportion = receipt.subtotal > 0 ? unassignedTotal / receipt.subtotal : 0;
  const unassignedTax = receipt.tax * unassignedProportion;
  const unassignedTip = receipt.tip * unassignedProportion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.map(({ participant, itemsTotal, taxShare, tipShare, total }) => (
          <div key={participant.id} className="mb-4">
            <h3 className="text-lg font-medium">{participant.name}</h3>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm">Items:</div>
              <div className="text-sm text-right">{formatCurrency(itemsTotal)}</div>
              <div className="text-sm">Tax share:</div>
              <div className="text-sm text-right">{formatCurrency(taxShare)}</div>
              <div className="text-sm">Tip share:</div>
              <div className="text-sm text-right">{formatCurrency(tipShare)}</div>
              <div className="text-sm font-medium">Total:</div>
              <div className="text-sm font-medium text-right">{formatCurrency(total)}</div>
            </div>
          </div>
        ))}

        {unassignedTotal > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-medium">Unassigned</h3>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm">Items:</div>
              <div className="text-sm text-right">{formatCurrency(unassignedTotal)}</div>
              <div className="text-sm">Tax share:</div>
              <div className="text-sm text-right">{formatCurrency(unassignedTax)}</div>
              <div className="text-sm">Tip share:</div>
              <div className="text-sm text-right">{formatCurrency(unassignedTip)}</div>
              <div className="text-sm font-medium">Total:</div>
              <div className="text-sm font-medium text-right">
                {formatCurrency(unassignedTotal + unassignedTax + unassignedTip)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
