"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, ReceiptText, Eye } from "lucide-react";
import Link from "next/link";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Mock transactions data
const mockTransactions = [
  {
    id: "tx1",
    title: "Dinner at Italiano",
    date: "2025-04-27",
    amount: 120.75,
    yourShare: 30.19,
    status: "settled", // settled, pending, you_owe, owes_you
    participants: [
      { id: "u1", name: "You" },
      { id: "u2", name: "Alex Johnson" },
      { id: "u3", name: "Taylor Swift" },
      { id: "u4", name: "Morgan Freeman" },
    ],
  },
  {
    id: "tx2",
    title: "Grocery Shopping",
    date: "2025-04-25",
    amount: 87.32,
    yourShare: 43.66,
    status: "pending",
    participants: [
      { id: "u1", name: "You" },
      { id: "u2", name: "Alex Johnson" },
    ],
  },
  {
    id: "tx3",
    title: "Movie Night",
    date: "2025-04-20",
    amount: 45.0,
    yourShare: 15.0,
    status: "you_owe",
    participants: [
      { id: "u1", name: "You" },
      { id: "u2", name: "Alex Johnson" },
      { id: "u3", name: "Taylor Swift" },
    ],
  },
  {
    id: "tx4",
    title: "Lunch at Burger Joint",
    date: "2025-04-18",
    amount: 32.45,
    yourShare: 0,
    status: "owes_you",
    participants: [
      { id: "u1", name: "You" },
      { id: "u4", name: "Morgan Freeman" },
    ],
  },
  {
    id: "tx5",
    title: "Concert Tickets",
    date: "2025-04-15",
    amount: 180.0,
    yourShare: 60.0,
    status: "settled",
    participants: [
      { id: "u1", name: "You" },
      { id: "u2", name: "Alex Johnson" },
      { id: "u3", name: "Taylor Swift" },
    ],
  },
];

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter transactions based on search term and status filter
  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch = tx.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "settled":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 hover:bg-green-50"
          >
            Settled
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
          >
            Pending
          </Badge>
        );
      case "you_owe":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 hover:bg-red-50"
          >
            You owe
          </Badge>
        );
      case "owes_you":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 hover:bg-blue-50"
          >
            Owes you
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your expense splits
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> New Transaction
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="you_owe">You Owe</SelectItem>
            <SelectItem value="owes_you">Owes You</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction
            {filteredTransactions.length === 1 ? "" : "s"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Your Share</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <ReceiptText className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{tx.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${tx.amount.toFixed(2)}</TableCell>
                      <TableCell>${tx.yourShare.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {tx.participants.slice(0, 3).map((p, index) => (
                            <Avatar
                              key={p.id}
                              className="border-2 border-background h-6 w-6"
                            >
                              <AvatarImage
                                src={
                                  p.id === "u1"
                                    ? undefined
                                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`
                                }
                              />
                              <AvatarFallback className="text-xs">
                                {p.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {tx.participants.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{tx.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Settled</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <ReceiptText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try changing your search or filters"
                  : "Create your first transaction to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/upload">
                  <Button>Create Transaction</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
