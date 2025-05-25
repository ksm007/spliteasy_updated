// PdfReceiptTable.js
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, getItemTotal } from "./utils";

const styles = StyleSheet.create({
  table: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
    borderRadius: 4,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
    borderBottomStyle: "solid",
  },
  header: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
    fontSize: 12,
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#999",
    borderBottomStyle: "solid",
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 6,
    fontSize: 10,
    minWidth: 80,
    maxWidth: 120,
    textAlign: "left",
    flexWrap: "wrap", // allow multi-line
  },
  wideCell: {
    minWidth: 240,
    maxWidth: 260,
    flexWrap: "wrap",
  },
  right: {
    textAlign: "right",
  },
});

const columns = [
  {
    header: "Description",
    accessor: "description",
    style: [styles.cell, styles.wideCell],
  },
  {
    header: "Assigned To",
    accessor: "assignedTo",
    style: [styles.cell, styles.wideCell],
  },
  { header: "Qty", accessor: "quantity", style: [styles.cell, styles.right] },
  { header: "Price", accessor: "price", style: [styles.cell, styles.right] },
  { header: "Total", accessor: "total", style: [styles.cell, styles.right] },
];

const PdfReceiptTable = ({ receipt, participants }) => {
  // Build each row including the per-participant split
  const rows = receipt.items.map((item) => {
    // For each assignment, format "Name: $X.XX"
    const assignedLines = (item.assignments || []).map((a) => {
      const p = participants.find((p) => p.id === a.participantId);
      const name = p ? p.name : "Unknown";
      return `${name}: ${formatCurrency(a.amount)}`;
    });

    return {
      description: item.description,
      assignedTo: assignedLines.join("\n"), // newline-separated
      quantity: item.quantity,
      price: formatCurrency(item.price),
      total: formatCurrency(getItemTotal(item)),
    };
  });

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={[styles.row, styles.header]}>
        {columns.map((col, i) => (
          <Text key={i} style={col.style}>
            {col.header}
          </Text>
        ))}
      </View>

      {/* Data rows */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {columns.map((col, colIdx) => (
            <Text key={colIdx} style={col.style}>
              {row[col.accessor]}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

export default PdfReceiptTable;
