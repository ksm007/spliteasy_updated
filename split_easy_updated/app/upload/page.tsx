"use client";

import React, { useState, useRef, useCallback } from "react";
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Upload, Loader2, ChevronRight, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type ReceiptItem = {
  description: string;
  quantity: number;
  price: number;
};

type ParsedReceipt = {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

export default function UploadReceipt() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

      const result: ParsedReceipt = await res.json();
      setParsed(result);
      setProgress(100);

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

  const reset = () => {
    setFile(null);
    setPreview(null);
    setParsed(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
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

      {parsed && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Parsed Receipt</CardTitle>
            <CardDescription>
              Structured data extracted from the receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-medium">Subtotal</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-medium">
                    ${parsed.subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tax</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-medium">
                    ${parsed.tax.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tip</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-medium">
                    ${parsed.tip.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-bold">
                    ${parsed.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
