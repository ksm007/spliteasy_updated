"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../../components/ui/button";
import { Upload, ReceiptText, Users, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "../upload/_components/utils";
import { useUser } from "@clerk/nextjs";
import { getReceipts } from "@/actions/receiptsService";

const Dashboard = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setLoading(true);

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
      router.push("/");
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your expenses and recent activity.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
        <Link href="/upload">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 h-full">
              <div className="bg-primary/10 p-3 rounded-full">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Upload New Receipt</p>
                <p className="text-sm text-muted-foreground">
                  Split a new expense
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Balance Summary */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest expense splits</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <ReceiptText className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && transactions.length > 0 && (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectTransaction(transaction.id)}
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
                        <div>
                          {transaction.participants.length} participants
                        </div>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
