// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { Providers } from "./providers";
import { AuthProvider } from "../contexts/AuthContext";
import Layout from "../components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SplitSmart",
  description: "Split bills seamlessly with SplitSmart",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-foreground min-h-screen`}
      >
        <AuthProvider>
          <Providers>
            <Layout>{children}</Layout>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
