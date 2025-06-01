// components/Navbar.tsx
import React from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import DarkModeToggle from "./DarkModeToggle";
import { Home, Plus, History } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Upload Receipt", icon: Plus, path: "/upload" },
  { title: "Transactions", icon: History, path: "/transactions" },
];

interface NavbarProps {
  currentPath?: string;
}

const Navbar = ({ currentPath }: NavbarProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Desktop Navbar */}
      <div className="w-full">
        <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: logo & mobile toggle */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <div className="block md:hidden">
              {/* <SidebarTrigger className="h-6 w-6" /> */}
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-2xl font-bold gradient-text md:text-3xl"
            >
              SplitSmart
            </Link>
          </div>

          {/* Right: desktop nav + auth UI */}
          <div className="flex items-center gap-4 md:gap-6">
            <DarkModeToggle />

            <SignedIn>
              <nav className="hidden md:flex items-center space-x-4">
                {menuItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.title}
                      href={item.path}
                      className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                        isActive ? "font-medium bg-gray-100" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="hidden md:block">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Mobile menu - only shown on mobile */}
      <div className="md:hidden border-t">
        <div className="w-full">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-2 sm:px-6 lg:px-8">
            <SignedIn>
              <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.title}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive ? "font-medium bg-gray-100" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
