// PdfReceiptTable.js
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Utility functions (implement or import as in your codebase)
import { formatCurrency, getItemTotal } from "./utils";

const styles = StyleSheet.create({
  table: {
    display: "flex",
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
  },
  wideCell: {
    minWidth: 240,
    maxWidth: 260,
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
  { header: "Assigned To", accessor: "assignedTo", style: styles.cell },
  { header: "Qty", accessor: "quantity", style: [styles.cell, styles.right] },
  { header: "Price", accessor: "price", style: [styles.cell, styles.right] },
  { header: "Total", accessor: "total", style: [styles.cell, styles.right] },
];

const PdfReceiptTable = ({ receipt, participants }) => {
  // Prepare rows as per your logic, using formatCurrency/getItemTotal as needed
  const rows = receipt.items.map((item) => {
    const assignedNames = (item.assignments || [])
      .map((a) => {
        const p = participants.find((p) => p.id === a.participantId);
        return p ? p.name : "";
      })
      .filter(Boolean)
      .join(", ");
    return {
      description: item.description,
      assignedTo: assignedNames,
      quantity: item.quantity,
      price: formatCurrency(item.price),
      total: formatCurrency(getItemTotal(item)),
    };
  });

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={[styles.row, styles.header]}>
        {columns.map((col, idx) => (
          <Text key={idx} style={col.style}>
            {col.header}
          </Text>
        ))}
      </View>
      {/* Rows */}
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
