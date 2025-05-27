// components/UploadReceipt.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, ImageIcon, Lock, Unlock } from "lucide-react";

import { ReceiptItem, ParsedReceipt, Participant } from "@/types";
import { calculateTotals, getIdToken, getItemTotal } from "./_components/utils";
import ReceiptTable from "./_components/ReceiptTable";
import ParticipantManager from "./_components/ParticipanyManager";
import CostBreakdown from "./_components/CostBreakdown";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function UploadReceipt() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  useEffect(() => {
    if (!user) {
      router.replace("/signin");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Toggle read-only mode
  const toggleReadOnly = () => setIsReadOnly((prev) => !prev);

  useEffect(() => {
    const handleAdd = (e: CustomEvent<ReceiptItem>) => {
      addNewReceiptItem(e.detail);
    };
    window.addEventListener("addNewReceiptItem", handleAdd as EventListener);
    return () =>
      window.removeEventListener(
        "addNewReceiptItem",
        handleAdd as EventListener
      );
  }, []);

  // Add a new item with functional update
  const addNewReceiptItem = (newItem: ReceiptItem) => {
    setParsed((prev) => {
      if (!prev) return prev;
      const items = [...prev.items, newItem];
      const { subtotal } = calculateTotals(items);
      return {
        ...prev,
        items,
        subtotal,
        total: subtotal + prev.tax + prev.tip,
      };
    });
    toast({ title: "Item Added", description: "A new item has been added." });
  };

  // Delete an item with functional update
  const deleteReceiptItem = (index: number) => {
    setParsed((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((_, i) => i !== index);
      const { subtotal } = calculateTotals(items);
      return {
        ...prev,
        items,
        subtotal,
        total: subtotal + prev.tax + prev.tip,
      };
    });
    toast({ title: "Item Removed", description: "An item has been removed." });
  };

  // File selection + preview
  const handleFileSelect = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) {
        return toast({
          title: "Invalid file",
          description: "Please upload an image file.",
          variant: "destructive",
        });
      }
      setFile(f);
      setParsed(null);
      setError(null);
      setProgress(0);

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    },
    [toast]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  // Submit to OCR API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return toast({
        title: "No file",
        description: "Select an image first.",
        variant: "destructive",
      });
    }
    setProcessing(true);
    setError(null);
    setProgress(0);
    try {
      setProgress(25);
      const buf = await file.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      setProgress(50);
      const res = await fetch("/api/receipt/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64, mimeType: file.type }),
      });
      setProgress(90);
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Processing failed");
      }
      const result = await res.json();
      const modified: ParsedReceipt = {
        ...result,
        items: result.items.map((it: any) => ({
          ...it,
          isMultiplied: false,
          assignments: [],
        })),
      };
      setParsed(modified);
      setProgress(100);
      setActiveTab("receipt");
      toast({ title: "Parsed", description: "Receipt parsed successfully." });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Update an item (controlled inputs)
  const updateReceiptItem = (
    index: number,
    updatedFields: Partial<ReceiptItem>
  ) => {
    setParsed((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((it, i) =>
        i === index ? { ...it, ...updatedFields } : it
      );
      const { subtotal } = calculateTotals(items);
      return {
        ...prev,
        items,
        subtotal,
        total: subtotal + prev.tax + prev.tip,
      };
    });
  };

  // Update tax or tip
  const updateTaxAndTip = (key: "tax" | "tip", value: number) => {
    setParsed((prev) => {
      if (!prev) return prev;
      const updates = { [key]: value } as const;
      const subtotal = prev.subtotal;
      const total =
        subtotal +
        (key === "tax" ? value : prev.tax) +
        (key === "tip" ? value : prev.tip);
      return { ...prev, ...updates, total };
    });
  };

  // Check fully assigned with epsilon
  const areAllFundsAssigned = () => {
    if (!parsed) return false;
    return parsed.items.every((item) => {
      const total = getItemTotal(item);
      const assigned = (item.assignments || []).reduce(
        (s, a) => s + a.amount,
        0
      );
      return Math.abs(total - assigned) < 0.01;
    });
  };

  // Save to backend
  const saveReceiptData = async () => {
    if (!parsed || participants.length === 0 || !user) {
      return toast({
        title: "Cannot save",
        description: parsed
          ? "Add participants and assign funds"
          : "Parse a receipt first",
        variant: "destructive",
      });
    }
    if (!areAllFundsAssigned()) {
      return toast({
        title: "Incomplete",
        description: "Every item must be fully assigned",
        variant: "destructive",
      });
    }
    try {
      const token = await getIdToken(true);
      const payload = {
        items: parsed.items,
        participants,
        subtotal: parsed.subtotal,
        tax: parsed.tax,
        tip: parsed.tip,
        total: parsed.total,
      };
      const res = await fetch("/api/receipt/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Save failed");
      }
      await res.json();
      toast({ title: "Saved", description: "Receipt saved successfully." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setPreview(null);
    setParsed(null);
    setError(null);
    setProgress(0);
    setActiveTab("upload");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="receipt" disabled={!parsed}>
            Receipt Details
          </TabsTrigger>
          <TabsTrigger value="participants" disabled={!parsed}>
            Participants
          </TabsTrigger>
        </TabsList>

        {/* UPLOAD TAB */}
        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Parser</CardTitle>
              <CardDescription>
                Upload a receipt image to extract items and totals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
              />
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                  preview ? "" : "hover:bg-accent/50"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="mx-auto max-h-64 object-contain"
                  />
                ) : (
                  <div>
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p>Drag & drop or click to upload</p>
                  </div>
                )}
              </div>

              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {file && (
                <Button variant="outline" onClick={reset} disabled={processing}>
                  Reset
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!file || processing}
                className="gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    Process Receipt <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* RECEIPT TAB */}
        <TabsContent value="receipt" className="mt-4">
          {parsed && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt Details</CardTitle>
                <CardDescription>
                  Edit and manage parsed receipt data
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Receipt Details</h2>
                  <Button
                    variant="outline"
                    onClick={toggleReadOnly}
                    className="flex items-center gap-2"
                  >
                    {isReadOnly ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                    {isReadOnly ? "Read-only" : "Editable"}
                  </Button>
                </div>

                <ReceiptTable
                  receipt={parsed}
                  updateReceiptItem={updateReceiptItem}
                  deleteReceiptItem={deleteReceiptItem}
                  participants={participants}
                  updateTaxAndTip={updateTaxAndTip}
                  isReadOnly={isReadOnly}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  onClick={saveReceiptData}
                  disabled={!areAllFundsAssigned() || participants.length === 0}
                >
                  Save Receipt
                </Button>
                {!areAllFundsAssigned() && (
                  <p className="text-sm text-destructive">
                    All funds must be assigned before saving
                  </p>
                )}
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* PARTICIPANTS TAB */}
        <TabsContent value="participants" className="mt-4 space-y-4">
          {parsed && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Split Receipt</CardTitle>
                  <CardDescription>
                    Add participants and assign items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ParticipantManager
                    participants={participants}
                    setParticipants={setParticipants}
                  />
                </CardContent>
              </Card>
              {participants.length > 0 && (
                <CostBreakdown receipt={parsed} participants={participants} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
