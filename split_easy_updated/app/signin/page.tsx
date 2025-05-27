"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../contexts/AuthContext";
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../hooks/use-toast";

const SignIn = () => {
  const { user, signIn, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl">SplitSmart</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to sign in to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Google Sign-In Button */}
        <Button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded shadow"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.8C34.7 33.4 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 6 .9 8.3 2.6l6.2-6.2C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l7 5.1C15.2 17 19.2 14 24 14c3.1 0 6 .9 8.3 2.6l6.2-6.2C34.3 6.1 29.4 4 24 4c-6.6 0-12 5.4-12 12 0 1.6.3 3.1.8 4.7z"
              />
              <path
                fill="#FBBC05"
                d="M24 44c5.8 0 10.7-2.6 14-6.7l-6.5-5.3C29.6 34.5 26.9 36 24 36c-5.8 0-10.7-3.8-12.5-9.1l-7 5.1C7.9 41.1 15.4 44 24 44z"
              />
              <path
                fill="#EA4335"
                d="M44.5 20H24v8.5h11.8C34.7 33.4 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 6 .9 8.3 2.6l6.2-6.2C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"
              />
            </g>
          </svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>

        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
