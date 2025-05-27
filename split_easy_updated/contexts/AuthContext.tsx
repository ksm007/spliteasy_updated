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
  signInWithGoogle: (retryCount?: number) => Promise<{ success: boolean; error?: string }>;
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

  // Update your AuthContext.tsx

  // Add this function to your AuthContext
  const setServerSession = async () => {
    try {
      const user = auth.currentUser;
      // Get fresh token
      const idToken = await user.getIdToken(true);

      // Send to backend to create session cookie
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      return true;
    } catch (error) {
      console.error("Error setting session:", error);
      return false;
    }
  };

  // Modify your onAuthStateChanged callback to create a session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Get a fresh ID token
        const user = auth.currentUser;
        // Get fresh token
        const idToken = await user.getIdToken(true);
        // const idToken = await fbUser.getIdToken(true);

        // Set session cookie
        await setServerSession();

        // Save user to database
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
          console.error("Failed to save user to backend:", e);
        }

        const localUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName,
          email: fbUser.email,
          avatar: fbUser.photoURL,
        };
        setUser(localUser);
      } else {
        setUser(null);

        // Clear session when signed out
        await fetch("/api/auth/logout", { method: "POST" });
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

  const signInWithGoogle = async (retryCount = 0): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters for better UX
      provider.setCustomParameters({
        prompt: 'select_account',
        login_hint: ''
      });

      // Try to sign in with popup
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (error: any) {
        // Handle popup blocked error
        if (error.code === 'auth/popup-blocked' && retryCount < 2) {
          console.log('Popup was blocked, retrying with redirect...');
          return { success: false, error: 'popup_blocked' };
        }
        throw error;
      }

      const fbUser = result.user;
      const idToken = await fbUser.getIdToken(true);

      // Save user to database
      const response = await fetch("/api/auth/saveUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          photoURL: fbUser.photoURL,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      // Set server session
      await setServerSession();
      
      return { success: true };
    } catch (error: any) {
      console.error("🚨 Google sign-in error:", error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with the same email but different sign-in method';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled';
          break;
        case 'auth/cancelled-popup-request':
          if (retryCount < 2) {
            // Auto-retry on popup issues
            return signInWithGoogle(retryCount + 1);
          }
          errorMessage = 'Sign in was interrupted';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
      }
      
      return { success: false, error: errorMessage };
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
