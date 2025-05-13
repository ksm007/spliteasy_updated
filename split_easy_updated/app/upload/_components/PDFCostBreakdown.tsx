// PdfCostBreakdown.js
import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, getItemTotal } from "./utils";

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  participantName: { fontSize: 13, fontWeight: "bold", marginBottom: 4 },
  row: { flexDirection: "row", fontSize: 10, marginBottom: 2 },
  label: { width: "50%" },
  value: { width: "50%", textAlign: "right" },
  totalLabel: { fontWeight: "bold" },
  totalValue: { fontWeight: "bold" },
  header: { fontSize: 15, fontWeight: "bold", marginBottom: 8 },
});

const PdfCostBreakdown = ({ receipt, participants }) => {
  if (!participants || participants.length === 0) return null;

  // Calculate breakdown by participant
  const breakdown = participants.map((participant) => {
    let itemsTotal = 0;
    receipt.items.forEach((item) => {
      if (!item.assignments) return;
      const participantAssignments = item.assignments.filter(
        (a) => a.participantId === participant.id
      );
      participantAssignments.forEach((assignment) => {
        itemsTotal += assignment.amount;
      });
    });
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
  receipt.items.forEach((item) => {
    const itemTotal = getItemTotal(item);
    const assignedTotal = item.assignments
      ? item.assignments.reduce((sum, a) => sum + a.amount, 0)
      : 0;
    unassignedTotal += Math.max(0, itemTotal - assignedTotal);
  });
  const unassignedProportion =
    receipt.subtotal > 0 ? unassignedTotal / receipt.subtotal : 0;
  const unassignedTax = receipt.tax * unassignedProportion;
  const unassignedTip = receipt.tip * unassignedProportion;

  return (
    <View>
      <Text style={styles.header}>Cost Breakdown</Text>
      {breakdown.map(
        ({ participant, itemsTotal, taxShare, tipShare, total }) => (
          <View key={participant.id} style={styles.section}>
            <Text style={styles.participantName}>{participant.name}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Items:</Text>
              <Text style={styles.value}>{formatCurrency(itemsTotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tax share:</Text>
              <Text style={styles.value}>{formatCurrency(taxShare)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tip share:</Text>
              <Text style={styles.value}>{formatCurrency(tipShare)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, styles.totalLabel]}>Total:</Text>
              <Text style={[styles.value, styles.totalValue]}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        )
      )}
      {unassignedTotal > 0 && (
        <View style={styles.section}>
          <Text style={styles.participantName}>Unassigned</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Items:</Text>
            <Text style={styles.value}>
              {formatCurrency(unassignedTotal)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax share:</Text>
            <Text style={styles.value}>
              {formatCurrency(unassignedTax)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tip share:</Text>
            <Text style={styles.value}>
              {formatCurrency(unassignedTip)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, styles.totalLabel]}>Total:</Text>
            <Text style={[styles.value, styles.totalValue]}>
              {formatCurrency(unassignedTotal + unassignedTax + unassignedTip)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PdfCostBreakdown;
