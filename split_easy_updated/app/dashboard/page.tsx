"use client";

import React from "react";
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

// Mock recent transactions
const recentTransactions = [
  {
    id: "1",
    title: "Dinner at Italiano",
    date: "2025-04-27",
    total: 120.75,
    participants: 4,
    status: "settled",
  },
  {
    id: "2",
    title: "Grocery Shopping",
    date: "2025-04-25",
    total: 87.32,
    participants: 2,
    status: "pending",
  },
  {
    id: "3",
    title: "Movie Night",
    date: "2025-04-20",
    total: 45.0,
    participants: 3,
    status: "pending",
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  const totalOwed = 67.45;
  const totalYouOwe = 23.18;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
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
        </Card>

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
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
        </Card>

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
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <ReceiptText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {transaction.participants} people
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${transaction.total.toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          transaction.status === "settled"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {transaction.status === "settled"
                          ? "Settled"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
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
