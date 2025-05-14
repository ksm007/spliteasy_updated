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
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getIdToken } from "../upload/_components/utils";

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  // Mock recent transactions
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
      router.push("/signin");
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your expenses and recent activity.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
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

        {/* <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 h-full">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Manage Friends</p>
              <p className="text-sm text-muted-foreground">
                Add or remove friends
              </p>
            </div>
          </CardContent>
        </Card> */}

        <Link href="/transactions">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 h-full">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Transaction History</p>
                <p className="text-sm text-muted-foreground">
                  View all transactions
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Balance Summary */}
      <div className="flex flex-col gap-4">
        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle>Balance Summary</CardTitle>
            <CardDescription>Overview of your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    People owe you
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalOwed.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">You owe</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${totalYouOwe.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net balance</p>
                <p
                  className={`text-lg font-semibold ${
                    totalOwed - totalYouOwe > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ${(totalOwed - totalYouOwe).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

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
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
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
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <ReceiptText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No recent transactions</p>
                <Link href="/upload" className="mt-3">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Create New
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
