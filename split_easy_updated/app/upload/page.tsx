"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { Upload, Loader2, ChevronRight, ImageIcon } from "lucide-react";

import { ReceiptItem, ParsedReceipt, Participant } from "@/types";
import { calculateTotals } from "./_components/utils";
import ReceiptTable from "./_components/ReceiptTable";
import ParticipantManager from "./_components/ParticipanyManager";
import CostBreakdown from "./_components/CostBreakdown";

export default function UploadReceipt() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState("receipt");

  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Add event listener for the "addNewReceiptItem" custom event
  useEffect(() => {
    const handleAddNewReceiptItem = (event: CustomEvent) => {
      addNewReceiptItem(event.detail);
    };

    // Add event listener with type assertion for proper TypeScript typing
    window.addEventListener('addNewReceiptItem', handleAddNewReceiptItem as EventListener);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('addNewReceiptItem', handleAddNewReceiptItem as EventListener);
    };
  }, [parsed]); // Re-add listener when parsed changes to ensure current state is used

  // Function to add a new receipt item to the parsed receipt
  const addNewReceiptItem = (newItem: ReceiptItem) => {
    if (!parsed) return;

    // Create a new array of items with the new item added
    const updatedItems = [...parsed.items, newItem];
    
    // Recalculate totals
    const { subtotal } = calculateTotals(updatedItems);
    
    // Update the parsed receipt with the new item and recalculated totals
    setParsed({
      ...parsed,
      items: updatedItems,
      subtotal,
      total: subtotal + parsed.tax + parsed.tip,
    });

    // Show a toast notification
    toast({
      title: "Item Added",
      description: "A new item has been added to the receipt",
    });
  };

  // Function to delete a receipt item from the parsed receipt
  const deleteReceiptItem = (index: number) => {
    if (!parsed) return;
    
    // Filter out the item at the specified index
    const updatedItems = parsed.items.filter((_, i) => i !== index);
    
    // Recalculate totals
    const { subtotal } = calculateTotals(updatedItems);
    
    // Update the parsed receipt with the filtered items and recalculated totals
    setParsed({
      ...parsed,
      items: updatedItems,
      subtotal,
      total: subtotal + parsed.tax + parsed.tip,
    });

    // Show a toast notification
    toast({
      title: "Item Removed",
      description: "An item has been removed from the receipt",
    });
  };

  const handleFileSelect = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc)",
          variant: "destructive",
        });
        return;
      }

      // Reset states
      setFile(f);
      setParsed(null);
      setError(null);
      setProgress(0);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    },
    [toast]
  );

  // Handle drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image to process",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Show processing in progress
      setProgress(25);

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString("base64");

      setProgress(50);

      // Send to our API
      const res = await fetch("/api/receipt/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64String,
          mimeType: file.type,
        }),
      });

      setProgress(90);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process receipt");
      }

      // Modify the API response to include our new isMultiplied field
      const result = await res.json();
      const modifiedResult = {
        ...result,
        items: result.items.map((item: any) => ({
          ...item,
          isMultiplied: false, // Default to false for all items
          assignments: [], // Initialize empty assignments for each item
        })),
      };
      
      setParsed(modifiedResult);
      setProgress(100);
      setActiveTab("receipt"); // Switch to receipt tab after successful processing

      toast({
        title: "Receipt processed",
        description: "Your receipt has been successfully parsed",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "An unexpected error occurred");
      toast({
        title: "Processing failed",
        description: err.message || "Failed to process the receipt",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const updateReceiptItem = (index: number, updatedFields: Partial<ReceiptItem>) => {
    if (!parsed) return;
    
    const updatedItems = [...parsed.items];
    updatedItems[index] = { ...updatedItems[index], ...updatedFields };
    
    // Recalculate totals
    const { subtotal } = calculateTotals(updatedItems);
    
    setParsed({
      ...parsed,
      items: updatedItems,
      subtotal,
      total: subtotal + parsed.tax + parsed.tip,
    });
  };

  const updateTaxAndTip = (key: "tax" | "tip", value: number) => {
    if (!parsed) return;
    
    const updates = { [key]: value };
    const newTotal = parsed.subtotal + (key === "tax" ? value : parsed.tax) + 
                    (key === "tip" ? value : parsed.tip);
    
    setParsed({
      ...parsed,
      ...updates,
      total: newTotal,
    });
  };

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
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  preview ? "" : "hover:bg-accent/50"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={preview}
                      alt="Receipt preview"
                      className="mx-auto max-h-64 object-contain"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to select a different image
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="font-medium">Drag & drop or click to upload</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports JPEG, PNG, and other image formats
                    </p>
                  </div>
                )}
              </div>

              {processing && progress > 0 && (
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
                <ReceiptTable
                  receipt={parsed}
                  updateReceiptItem={updateReceiptItem}
                  deleteReceiptItem={deleteReceiptItem} // Added delete function
                  participants={participants}
                  updateTaxAndTip={updateTaxAndTip}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="participants" className="mt-4 space-y-4">
          {parsed && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Split Receipt</CardTitle>
                  <CardDescription>
                    Add participants and assign items to them
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
                <CostBreakdown 
                  receipt={parsed}
                  participants={participants}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
