"use server";

import { createClient } from "@/utils/supabase/server";

export async function registerEarlyAdopter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to claim this." };
  }

  // Insert the UUID into the early_adopters table
  const { error } = await supabase.from("early_adopters").insert({
    user_id: user.id,
  });

  if (error) {
    // If it's a unique constraint violation, they're already registered
    if (error.code === "23505") {
      return { success: true, message: "You are already on the list! Thanks day one. 🫡" };
    }
    console.error("Error registering early adopter:", error);
    
    // Friendly fallback if the user hasn't created the table yet
    if (error.code === "42P01") {
       return { error: "Database table 'early_adopters' is missing. Please create it in Supabase with a 'user_id' (uuid) column!" };
    }

    return { error: "Failed to add you to the list. Try again later?" };
  }

  return { success: true, message: "Added successfully! You are officially exempt from future premium features. 🎉" };
}
