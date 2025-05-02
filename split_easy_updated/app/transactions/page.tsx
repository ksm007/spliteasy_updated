// app/transactions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getIdToken } from "@/app/upload/_components/utils";
import ReceiptTable from "@/app/upload/_components/ReceiptTable";
import CostBreakdown from "@/app/upload/_components/CostBreakdown";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Receipt, Lock, Unlock } from "lucide-react";

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch all transactions for the user
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const idToken = await getIdToken(true);

      const response = await fetch("/api/receipt/receipts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.receipts);
      console.log("Fetched transactions:", data.receipts);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load your transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single transaction by ID
  const fetchTransactionById = async (id) => {
    if (!user) return;
    const idToken = await getIdToken(true);

    try {
      setLoading(true);

      const response = await fetch(`/api/receipt/receipts/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transaction details");
      }

      const data = await response.json();
      setSelectedTransaction(data.receipt);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      });
      setSelectedTransactionId(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a transaction
  const handleSelectTransaction = (id) => {
    setSelectedTransactionId(id);
    fetchTransactionById(id);
  };

  // Handle going back to the list view
  const handleBackToList = () => {
    setSelectedTransactionId(null);
    setSelectedTransaction(null);
  };

  // Fetch transactions when the component mounts
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      router.push("/login");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-8">
        Please log in to view your transactions
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Transaction History</h1>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      ) : selectedTransactionId && selectedTransaction ? (
        <TransactionDetail
          transaction={selectedTransaction}
          onBack={handleBackToList}
        />
      ) : transactions.length > 0 ? (
        <TransactionList
          transactions={transactions}
          onSelectTransaction={handleSelectTransaction}
        />
      ) : (
        <EmptyState router={router} />
      )}
    </div>
  );
}

// Transaction list component
function TransactionList({ transactions, onSelectTransaction }) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onSelectTransaction(transaction.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </CardTitle>
              <span className="text-lg font-bold">
                {formatCurrency(transaction.total)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>{transaction.participants.length} participants</div>
              <div>{transaction.items.length} items</div>
              {!transaction.isFullyAssigned && (
                <div className="text-amber-500 font-medium">
                  Partially assigned
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Transaction detail component
function TransactionDetail({ transaction, onBack }) {
  // Since this is view-only, create dummy handlers
  const updateReceiptItem = () => {};
  const deleteReceiptItem = () => {};
  const updateTaxAndTip = () => {};
  console.log("Transaction details:", transaction);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // Toggle function
  const toggleReadOnly = () => setIsReadOnly((prev) => !prev);
  if (!transaction) {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="animate-spin h-8 w-8 mb-4" />
        <p>Loading transaction details...</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <h2 className="text-xl font-bold">
          Receipt from {new Date(transaction.createdAt).toLocaleDateString()}
        </h2>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Receipt Details</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
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
                isReadOnly={isReadOnly} // Set to false for view-only mode
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
      </Tabs>
    </div>
  );
}

// Empty state component
function EmptyState({ router }) {
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/20">
      <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-medium mb-2">No transactions yet</h3>
      <p className="text-muted-foreground mb-6">
        You haven't created any receipts yet. Create one to get started.
      </p>
      <Button onClick={() => router.push("/receipt")}>
        Create a new receipt
      </Button>
    </div>
  );
}
