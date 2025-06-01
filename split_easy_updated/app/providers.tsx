// providers.tsx
"use client";

import { Toaster } from "components/ui/toaster";
import { Toaster as Sonner } from "components/ui/sonner";
import { TooltipProvider } from "components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* <SidebarProvider
          defaultOpen={false} // Start with sidebar closed
          // Add any other sidebar configuration props
        > */}
          {children}
        {/* </SidebarProvider> */}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
