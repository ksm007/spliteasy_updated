"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "../contexts/AuthContext";
import { Home, Plus, History, Users, X } from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Upload Receipt", icon: Plus, path: "/upload" },
  { title: "Transactions", icon: History, path: "/transactions" },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const currentPath = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <header className="relative w-full border-b bg-background py-2 px-4 flex items-center justify-between">
      {/* Left side: just logo + hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="block md:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <SidebarTrigger className="h-6 w-6" />
          )}
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-4xl font-bold gradient-text "
        >
          SplitSmart
        </Link>
      </div>

      {/* Right side: desktop nav + user menu */}
      <div className="flex items-center gap-6">
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4">
          {user && menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.title}
                href={item.path}
                className={`flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100 ${
                  isActive ? "bg-gray-200 font-medium" : "text-gray-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Auth / User menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className="flex items-center gap-2 rounded-full focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Avatar className="h-8 w-8">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  )}
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/transactions">My Transactions</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/signin"
            className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Log In
          </Link>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && user && (
        <div className="md:hidden absolute top-full right-4 mt-2 w-96 bg-background shadow-lg rounded-lg flex flex-col items-end py-2">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`w-full text-right px-4 py-2 hover:bg-gray-100 ${
                currentPath === item.path ? "font-medium" : ""
              }`}
            >
              {item.title}
            </Link>
          ))}

          {!user && (
            <Link
              href="/signin"
              onClick={() => setMobileOpen(false)}
              className="w-full text-right px-4 py-2 hover:bg-gray-100"
            >
              Log In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
