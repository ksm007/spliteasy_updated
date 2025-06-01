"use server";
import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";

export async function saveUser() {
  // This will call currentUser(), and upsert in your DB as needed
  const user = await checkUser();

  if (!user) {
    throw new Error("Not authenticated");
  }
  const safeUser = JSON.parse(JSON.stringify(user));

  return { success: true, user: safeUser };
}
