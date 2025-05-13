// app/transactions/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { formatCurrency, getIdToken } from "@/app/upload/_components/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Handle selecting a transaction
  const handleSelectTransaction = (id) => {
    router.push(`/transactions/${id}`);
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