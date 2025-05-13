"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ReceiptTable from "@/app/upload/_components/ReceiptTable";
import CostBreakdown from "@/app/upload/_components/CostBreakdown";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ReceiptPdfDocument from "../../upload/_components/ReceiptPDFDoc";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

export default function TransactionDetail({
  transaction,
  isReadOnly,
  toggleReadOnly,
}) {
  // Dummy handlers since this is view-only
  const updateReceiptItem = () => {};
  const deleteReceiptItem = () => {};
  const updateTaxAndTip = () => {};

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Receipt Details</TabsTrigger>
        <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
        <TabsTrigger value="previewPdf">Preview PDF</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <Card className="w-max">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Receipt Details</h2>
            <Button
              variant="outline"
              onClick={toggleReadOnly}
              className="flex items-center gap-2"
            >
              {isReadOnly ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Read-only</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Editable</span>
                </>
              )}
            </Button>
          </div>
          <CardContent className="pt-6">
            <ReceiptTable
              receipt={transaction}
              updateReceiptItem={updateReceiptItem}
              deleteReceiptItem={deleteReceiptItem}
              participants={transaction.participants}
              updateTaxAndTip={updateTaxAndTip}
              isReadOnly={isReadOnly}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="breakdown">
        <Card>
          <CardContent className="pt-6">
            <CostBreakdown
              receipt={transaction}
              participants={transaction.participants}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="previewPdf">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <PDFDownloadLink
                document={
                  <ReceiptPdfDocument
                    receipt={transaction}
                    participants={transaction.participants}
                  />
                }
                fileName="receipt.pdf"
              >
                {({ loading }) => (loading ? "Loading..." : "Download PDF")}
              </PDFDownloadLink>
            </div>
            <div className="h-[600px]">
              <PDFViewer width="100%" height="100%">
                <ReceiptPdfDocument
                  receipt={transaction}
                  participants={transaction.participants}
                />
              </PDFViewer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
