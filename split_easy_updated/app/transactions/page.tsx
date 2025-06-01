// app/transactions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/upload/_components/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { getReceipts } from "@/actions/receiptsService";
import { deleteReceiptById } from "@/actions/receiptActions";

export default function TransactionsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [toDeleteLabel, setToDeleteLabel] = useState<string>("");

  // Fetch all transactions
  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getReceipts();
      if (!response) {
        setTransactions([]);
        setLoading(false);
        toast({
          title: "No Transactions",
          description: "You have no transactions yet.",
        });
        return;
      }
      setTransactions(response.receipts);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a single transaction
  const deleteTransaction = async () => {
    if (!toDeleteId) return;
    try {
      await deleteReceiptById(toDeleteId);
      toast({ title: "Deleted", description: "Transaction removed." });
      setIsDialogOpen(false);
      setToDeleteId(null);
      fetchTransactions();
    } catch {
      toast({
        title: "Error",
        description: "Could not delete",
        variant: "destructive",
      });
    }
  };

  // When user right‐clicks, open the dialog
  const handleContextMenu = (e: React.MouseEvent, tx: any) => {
    e.preventDefault();
    setToDeleteId(tx.id);
    setToDeleteLabel(
      `${new Date(tx.createdAt).toLocaleDateString()} — ${formatCurrency(
        tx.total
      )}`
    );
    setIsDialogOpen(true);
  };

  // List of cards
  const TransactionList = () => (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <Card
          key={tx.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(`/transactions/${tx.id}`)}
          onContextMenu={(e) => handleContextMenu(e, tx)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {new Date(tx.createdAt).toLocaleDateString()}
              </CardTitle>
              <span className="text-lg font-bold">
                {formatCurrency(tx.total)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>{tx.participants.length} participants</div>
              <div>{tx.items.length} items</div>
              {!tx.isFullyAssigned && (
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

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-12 border rounded-lg bg-muted/20">
      <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-medium mb-2">No transactions yet</h3>
      <p className="text-muted-foreground mb-6">
        You haven't created any receipts yet.
      </p>
      <Button onClick={() => router.push("/receipt")}>
        Create a new receipt
      </Button>
    </div>
  );

  useEffect(() => {
    if (user) fetchTransactions();
    else router.push("/");
  }, [user]);

  if (!user)
    return (
      <div className="text-center py-8">Please log in to view transactions</div>
    );

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Transaction History</h1>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      ) : transactions.length > 0 ? (
        <TransactionList />
      ) : (
        <EmptyState />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{toDeleteLabel}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTransaction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
