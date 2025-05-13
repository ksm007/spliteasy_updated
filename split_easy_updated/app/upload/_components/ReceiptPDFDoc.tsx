// ReceiptPdfDocument.js
import React from "react";
import { Document, Page, View, StyleSheet } from "@react-pdf/renderer";
import PdfReceiptTable from "./PDFReceiptTable";
import PdfCostBreakdown from "./PDFCostBreakdown";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
});

const ReceiptPdfDocument = ({ receipt, participants }) => (
<Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <PdfReceiptTable receipt={receipt} participants={participants} />
      </View>
      <View style={styles.section}>
        <PdfCostBreakdown receipt={receipt} participants={participants} />
      </View>
    </Page>
  </Document>
);

export default ReceiptPdfDocument;
