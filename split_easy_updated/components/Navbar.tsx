import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
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
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* MOBILE NAV */}
        <div className="md:hidden">
          <input
            type="checkbox"
            id="mobile-menu-toggle"
            className="peer hidden"
          />

          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="text-2xl font-bold gradient-text"
            >
              SplitSmart
            </Link>

            <div className="flex items-center gap-3">
              <DarkModeToggle />

              <SignedIn>
                <UserButton
                  appearance={{ elements: { avatarBox: "w-8 h-8" } }}
                />
              </SignedIn>

              <label htmlFor="mobile-menu-toggle" className="cursor-pointer">
                <Menu className="w-6 h-6" />
              </label>
            </div>
          </div>

          <div className="hidden peer-checked:block border-t py-2">
            <SignedIn>
              <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.title}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "font-medium bg-gray-100 dark:bg-gray-800"
                          : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </SignedIn>

            <SignedOut>
              <div className="px-3 mt-2">
                <SignInButton>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex h-16 items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold gradient-text">
            SplitSmart
          </Link>

          <div className="flex items-center gap-6">
            <DarkModeToggle />

            <SignedIn>
              <nav className="flex items-center space-x-4">
                {menuItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.title}
                      href={item.path}
                      className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                        isActive
                          ? "font-medium bg-gray-100 dark:bg-gray-800"
                          : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
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
    </header>
  );
};

export default Navbar;
