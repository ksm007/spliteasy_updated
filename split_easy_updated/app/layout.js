// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SplitSmart",
  description: "Split bills seamlessly with SplitSmart",
};

export default function RootLayout({ children }) {
  const headerList = headers();
  const path = headerList.get("x-pathname") || "/";

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className} bg-background text-foreground min-h-screen`}
        >
          <Providers>
            <Navbar currentPath={path} />
            <main className="pt-20">
              <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
