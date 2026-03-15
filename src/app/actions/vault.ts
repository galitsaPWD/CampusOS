"use server";

import { createClient } from "@/utils/supabase/server";

export async function getVaultItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("study_ai_results")
    .select("*")
    .eq("userId", user.id)
    .is("deletedAt", null) // Only fetch active vault items
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching vault items:", error);
    return [];
  }

  return data || [];
}

export async function deleteVaultItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_ai_results")
    .update({ deletedAt: new Date().toISOString() }) // Soft delete
    .eq("id", id)
    .eq("userId", user.id);

  if (error) throw error;
  return { success: true };
}

export async function getVaultItemById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("study_ai_results")
    .select("*")
    .eq("id", id)
    .eq("userId", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getDeletedVaultItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("study_ai_results")
    .select("id, title, subject, createdAt")
    .eq("userId", user.id)
    .not("deletedAt", "is", null) // Only fetch soft-deleted items
    .order("deletedAt", { ascending: false });

  if (error) {
    console.error("Error fetching deleted vault items:", error);
    return [];
  }

  return data || [];
}

export async function restoreVaultItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_ai_results")
    .update({ deletedAt: null }) // Restore
    .eq("id", id)
    .eq("userId", user.id);

  if (error) throw error;
  return { success: true };
}

export async function emptyTrashVaultItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_ai_results")
    .delete() // PERMANENT HARD DELETE
    .eq("userId", user.id)
    .not("deletedAt", "is", null);

  if (error) throw error;
  return { success: true };
}
