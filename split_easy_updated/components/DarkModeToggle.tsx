// components/DarkModeToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [mode, setMode] = useState<"light" | "dark" | null>(null);

  // On mount, initialize mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setMode(stored);
    } else {
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setMode(prefers);
    }
  }, []);

  // Whenever mode changes, update <html> and persist
  useEffect(() => {
    if (!mode) return;
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
  }, [mode]);

  // Flip between light/dark
  const toggle = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Don't render until we've determined the mode
  if (mode === null) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
    >
      {mode === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
