"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type UserProfile = {
  id: string;
  userId: string;
  username: string;
  theme: string;
  wallpaper: string;
  streakCount: number;
  lastActiveDate: string | null;
  isPaid: boolean;
  createdAt: string;
};

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("userId", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Profile table check failed or missing. Using defaults.", error.message);
    // Return defaults so the UI doesn't hang if the table doesn't exist yet
    return {
      username: "Student",
      theme: "classic",
      wallpaper: "teal",
      streakCount: 0,
      lastActiveDate: null,
      isPaid: false,
    };
  }

  // Default values if profile doesn't exist yet (but table does)
  if (!data) {
    return {
      username: "Student",
      theme: "classic",
      wallpaper: "teal",
      streakCount: 0,
      lastActiveDate: null,
      isPaid: false,
    };
  }

  return data as UserProfile;
}

export async function hasProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("userId", user.id)
    .maybeSingle();

  return !!data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const username = formData.get("username") as string;
  const theme = formData.get("theme") as string;
  const wallpaper = formData.get("wallpaper") as string;

  const { error } = await supabase.from("profiles").upsert(
    {
      userId: user.id,
      username: username || "Student",
      theme: theme || "classic",
      wallpaper: wallpaper || "teal",
    },
    { onConflict: 'userId' }
  );

  if (error) {
    console.error("Error updating profile:", error);
    return { error: error.message };
  }

  revalidatePath("/desktop", "layout");
  return { success: true };
}

export async function initializeProfile(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("profiles").insert({
    userId: user.id,
    username: username || "Student",
    theme: "classic",
    wallpaper: "teal",
  });

  if (error) {
    console.error("Error initializing profile:", error);
    return { error: error.message };
  }

  return { success: true };
}
