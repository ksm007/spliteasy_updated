"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
type Friend = {
  id: string;
  name: string;
  avatar?: string;
};

type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  participants?: string[];
};

type ItemWithSplitDetails = ReceiptItem & {
  splitType: "equal" | "percentage" | "amount";
  splitValues: Record<string, number>; // userId -> amount or percentage
};

const SplitExpense = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // TODO: Replace with a global store or use searchParams to get receipt data
  const receiptData = {
    receiptName: searchParams.get("receiptName") || "Untitled Expense",
    imagePreview: searchParams.get("imagePreview"),
    parsedItems: [], // Can't get objects from searchParams; recommend using context or global store
    subtotal: Number(searchParams.get("subtotal")) || 0,
    tax: Number(searchParams.get("tax")) || 0,
    tip: Number(searchParams.get("tip")) || 0,
    total: Number(searchParams.get("total")) || 0,
  };

  // State for the receipt
  const [receiptName, setReceiptName] = useState(receiptData.receiptName);

  const [imagePreview, setImagePreview] = useState<string | null>(
    receiptData.imagePreview
  );
  // If no parsedItems (due to lack of query serialization), provide mock fallback for demo/testing
  const fallbackItems: ReceiptItem[] = [
    { id: "1", name: "Pasta Carbonara", price: 15.99 },
    { id: "2", name: "Caesar Salad", price: 8.99 },
    { id: "3", name: "Garlic Bread", price: 4.5 },
    { id: "4", name: "Sparkling Water", price: 3.25 },
    { id: "5", name: "Tiramisu", price: 7.5 },
  ];
  const [items, setItems] = useState<ItemWithSplitDetails[]>(
    (receiptData.parsedItems.length > 0
      ? receiptData.parsedItems
      : fallbackItems
    ).map((item: ReceiptItem) => ({
      ...item,
      splitType: "equal",
      splitValues: {},
      participants: [],
    }))
  );
  const [subtotal, setSubtotal] = useState(receiptData.subtotal);
  const [tax, setTax] = useState(receiptData.tax);
  const [tip, setTip] = useState(receiptData.tip);
  const [total, setTotal] = useState(receiptData.total);

  // Friends state (in a real app, this would come from API)
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: "f1",
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    {
      id: "f2",
      name: "Taylor Swift",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
    },
    {
      id: "f3",
      name: "Morgan Freeman",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
    },
  ]);

  const [participants, setParticipants] = useState<Friend[]>([
    // Start with the current user
    {
      id: user?.id || "current-user",
      name: user?.name || "You",
      avatar: user?.avatar,
    },
  ]);

  const [newFriendName, setNewFriendName] = useState("");

  // Handle adding a participant
  const addParticipant = (friend: Friend) => {
    if (!participants.find((p) => p.id === friend.id)) {
      setParticipants([...participants, friend]);
    }
  };

  // Handle removing a participant
  const removeParticipant = (id: string) => {
    // Don't remove the current user
    if (id === user?.id || id === "current-user") return;

    setParticipants(participants.filter((p) => p.id !== id));

    // Remove this participant from all items
    setItems(
      items.map((item) => ({
        ...item,
        participants: item.participants?.filter((p) => p !== id),
      }))
    );
  };

  // Handle adding a new friend
  const handleAddNewFriend = () => {
    if (newFriendName.trim()) {
      const newFriend = {
        id: `new-friend-${Math.random().toString(36).substring(2, 9)}`,
        name: newFriendName.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newFriendName.trim()}`,
      };

      setFriends([...friends, newFriend]);
      addParticipant(newFriend);
      setNewFriendName("");
    }
  };

  // Handle toggling a participant for an item
  const toggleParticipantForItem = (itemId: string, participantId: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const currentParticipants = item.participants || [];
          const isAlreadyParticipant =
            currentParticipants.includes(participantId);

          let updatedParticipants;
          if (isAlreadyParticipant) {
            updatedParticipants = currentParticipants.filter(
              (id) => id !== participantId
            );
          } else {
            updatedParticipants = [...currentParticipants, participantId];
          }

          return {
            ...item,
            participants: updatedParticipants,
          };
        }
        return item;
      })
    );
  };

  // Calculate total amounts for each participant
  const calculateTotalPerPerson = () => {
    const totals: Record<string, number> = {};

    // Initialize totals
    participants.forEach((p) => {
      totals[p.id] = 0;
    });

    // Calculate item splits
    items.forEach((item) => {
      const itemParticipants = item.participants || [];
      if (itemParticipants.length === 0) return;

      const splitAmount = item.price / itemParticipants.length;
      itemParticipants.forEach((participantId) => {
        totals[participantId] = (totals[participantId] || 0) + splitAmount;
      });
    });

    // Add tax and tip proportionally
    if (subtotal > 0) {
      const taxRatio = tax / subtotal;
      const tipRatio = tip / subtotal;

      participants.forEach((p) => {
        const participantSubtotal = totals[p.id] || 0;
        const participantTax = participantSubtotal * taxRatio;
        const participantTip = participantSubtotal * tipRatio;

        totals[p.id] = parseFloat(
          (participantSubtotal + participantTax + participantTip).toFixed(2)
        );
      });
    }

    return totals;
  };

  const totalsPerPerson = calculateTotalPerPerson();

  const handleSave = () => {
    // In a real app, this would save the receipt to the backend
    toast({
      title: "Expense saved",
      description: "Your expense has been saved and shared with participants",
    });
    router.push("/transactions");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {receiptName || "Split Expense"}
          </h1>
          <p className="text-muted-foreground">Review and split expenses</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Receipt details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Details</CardTitle>
              <CardDescription>Review and edit receipt items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warn if no items are present (user may need to re-upload) */}
              {items.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 mb-4">
                  No receipt items found. Please re-upload your receipt or try
                  again.
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="receipt-name">Expense Name</Label>
                <Input
                  id="receipt-name"
                  value={receiptName}
                  onChange={(e) => setReceiptName(e.target.value)}
                />
              </div>

              {imagePreview && (
                <div>
                  <Label>Receipt Image</Label>
                  <div className="mt-2 relative rounded-lg overflow-hidden h-40">
                    <img
                      src={imagePreview}
                      alt="Receipt"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 gap-1"
                      onClick={() => {
                        const modal = document.getElementById(
                          "receipt-image-modal"
                        ) as HTMLDialogElement;
                        if (modal) modal.showModal();
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                      View
                    </Button>
                  </div>

                  {/* Image Modal (in a real app, this would be a proper modal component) */}
                  <dialog id="receipt-image-modal" className="modal">
                    <div className="modal-box max-w-3xl">
                      <div className="p-4">
                        <img
                          src={imagePreview}
                          alt="Receipt"
                          className="w-full object-contain"
                        />
                      </div>
                      <div className="modal-action">
                        <form method="dialog">
                          <Button variant="outline">Close</Button>
                        </form>
                      </div>
                    </div>
                  </dialog>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Receipt Items</Label>
                </div>

                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-grow">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ${item.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center -space-x-2 mr-2">
                              {(item.participants || []).length === 0 ? (
                                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                  Not assigned
                                </div>
                              ) : (
                                <>
                                  {participants
                                    .filter((p) =>
                                      item.participants?.includes(p.id)
                                    )
                                    .slice(0, 3)
                                    .map((participant) => (
                                      <Avatar
                                        key={participant.id}
                                        className="border-2 border-background h-6 w-6"
                                      >
                                        <AvatarImage src={participant.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {participant.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}

                                  {(item.participants?.length || 0) > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                      +{(item.participants?.length || 0) - 3}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const modal = document.getElementById(
                                  `item-${item.id}`
                                ) as HTMLDialogElement;
                                if (modal) modal.showModal();
                              }}
                            >
                              Assign
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found in this receipt
                  </div>
                )}

                {/* Add items for total calculation */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>Tip</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-20 h-6 text-sm"
                        value={tip}
                        onChange={(e) => {
                          const newTip = parseFloat(e.target.value) || 0;
                          setTip(newTip);
                          setTotal(subtotal + tax + newTip);
                        }}
                      />
                    </div>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - People & Summary */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>People</CardTitle>
              <CardDescription>Add people to split with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {participant.id === user?.id ||
                          participant.id === "current-user"
                            ? "You"
                            : participant.name}
                        </p>
                      </div>
                    </div>
                    {participant.id !== user?.id &&
                      participant.id !== "current-user" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Add People</Label>
                <Tabs defaultValue="friends">
                  <TabsList className="mb-4">
                    <TabsTrigger value="friends">Friends</TabsTrigger>
                    <TabsTrigger value="new">New Person</TabsTrigger>
                  </TabsList>
                  <TabsContent value="friends">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {friends
                        .filter(
                          (friend) =>
                            !participants.find((p) => p.id === friend.id)
                        )
                        .map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center justify-between py-1"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={friend.avatar} />
                                <AvatarFallback>
                                  {friend.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{friend.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addParticipant(friend)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      {friends.filter(
                        (friend) =>
                          !participants.find((p) => p.id === friend.id)
                      ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          All your friends have been added
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="new">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter name"
                        value={newFriendName}
                        onChange={(e) => setNewFriendName(e.target.value)}
                      />
                      <Button onClick={handleAddNewFriend}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>How much everyone pays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {participant.id === user?.id ||
                        participant.id === "current-user"
                          ? "You"
                          : participant.name}
                      </span>
                    </div>
                    <span className="font-medium">
                      ${totalsPerPerson[participant.id]?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-1" onClick={handleSave}>
                Save and Share <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Modal for assigning people to an item */}
      {items.map((item) => (
        <dialog key={item.id} id={`item-${item.id}`} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Who consumed "{item.name}"?</h3>
            <p className="py-2 text-muted-foreground">
              ${item.price.toFixed(2)}
            </p>
            <div className="py-4">
              {participants.map((participant) => {
                const isSelected = item.participants?.includes(participant.id);
                return (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      isSelected ? "bg-primary/10" : "hover:bg-accent"
                    } cursor-pointer mb-2`}
                    onClick={() =>
                      toggleParticipantForItem(item.id, participant.id)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {participant.id === user?.id ||
                        participant.id === "current-user"
                          ? "You"
                          : participant.name}
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                );
              })}
            </div>
            <div className="modal-action">
              <form method="dialog">
                <Button>Done</Button>
              </form>
            </div>
          </div>
        </dialog>
      ))}
    </div>
  );
};

export default SplitExpense;
