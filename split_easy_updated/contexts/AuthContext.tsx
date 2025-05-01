// src/context/AuthContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase"; // your firebase/app initializer

export type User = {
  id: string;
  name?: string | null;
  email: string | null;
  avatar?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // 🔄 Force-refresh the ID token so it's always fresh
        const idToken = await fbUser.getIdToken(/* forceRefresh= */ true);
        console.log(
          "⏩ Sending to /api/auth/saveUser, token:",
          idToken.slice(0, 20) + "…"
        );

        const localUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName,
          email: fbUser.email,
          avatar: fbUser.photoURL,
        };
        setUser(localUser);

        try {
          await fetch("/api/auth/saveUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName,
            }),
          });
        } catch (e) {
          console.error("❌ Failed to save user to backend:", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });

        // Immediately persist new user
        const idToken = await auth.currentUser.getIdToken(true);
        console.log("⏩ signUp sending token:", idToken.slice(0, 20) + "…");
        await fetch("/api/auth/saveUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            name,
          }),
        });
      }
    } catch (error: any) {
      console.error("🔥 signUp error:", error.code, error.message);
      throw new Error(
        error.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken(true);
      console.log(
        "⏩ Google signIn sending token:",
        idToken.slice(0, 20) + "…"
      );
      await fetch("/api/auth/saveUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
        }),
      });
    } catch (error) {
      console.error("🚨 Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
