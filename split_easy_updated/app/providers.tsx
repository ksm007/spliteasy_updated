"use client";

// Import paths starting from the root directory
import { Toaster } from "components/ui/toaster";
import { Toaster as Sonner } from "components/ui/sonner";
import { TooltipProvider } from "components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "contexts/AuthContext";

// Create a client
const queryClient = new QueryClient();

// Combine all providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
