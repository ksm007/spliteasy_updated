// app/transactions/[id]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReceiptTable from "@/app/upload/_components/ReceiptTable";
import CostBreakdown from "@/app/upload/_components/CostBreakdown";
import ReceiptPdfDocument from "@/app/upload/_components/ReceiptPDFDoc";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Lock, Unlock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { getReceiptById } from "@/actions/receiptActions";

export default function TransactionDetailPage({ params }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const toggleReadOnly = () => setIsReadOnly((prev) => !prev);

  const fetchTransactionById = async () => {
    if (!user || !id) return;
    try {
      setLoading(true);

      const response = await getReceiptById(id);
      if (!response) {
        setTransaction(null);
        setLoading(false);
        toast({
          title: "Transaction Not Found",
          description: "The requested transaction does not exist.",
          variant: "destructive",
        });
        return;
      }
      setTransaction(response.receipt);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      });
      router.push("/transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => router.push("/transactions");

  const shareableLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/transactions/${id}`
      : "";

  useEffect(() => {
    if (user) fetchTransactionById();
    else router.push("/");
  }, [user, id]);

  if (!user) {
    return (
      <div className="text-center py-8">
        Please log in to view this transaction
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="text-center py-8">
        <Loader2 className="animate-spin h-8 w-8 mx-auto" />
      </div>
    );
  }
  if (loading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p>Transaction not found</p>
          <Button onClick={handleBackToList} className="mt-4">
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  // Dummy handlers
  const updateReceiptItem = () => {};
  const deleteReceiptItem = () => {};
  const updateTaxAndTip = () => {};

  return (
    <div className="py-8">
      <div className="px-4 space-y-6">
        <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
          <Button variant="ghost" onClick={handleBackToList} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              Receipt from{" "}
              {new Date(transaction.createdAt).toLocaleDateString()}
            </h2>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Receipt Details</TabsTrigger>
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="previewPdf">Preview PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="max-w-8xl mx-auto">
            <Card className="w-full">
              <CardHeader className="flex justify-between items-center">
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
              </CardHeader>
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
              <CardContent className="pt-6 space-y-4">
                <div>
                  <PDFDownloadLink
                    document={
                      <ReceiptPdfDocument
                        receipt={transaction}
                        participants={transaction.participants}
                      />
                    }
                    fileName="receipt.pdf"
                  >
                    {({ loading }) =>
                      loading ? "Loading PDF..." : "Download PDF"
                    }
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
      </div>
    </div>
  );
}
