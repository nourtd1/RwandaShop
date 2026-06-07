"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { User } from "@/types";

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, phone, address, role, avatar_url, created_at, updated_at")
    .eq("id", authUser.id)
    .single();

  if (!data) return null;

  return {
    id:         data.id,
    email:      data.email,
    full_name:  data.full_name,
    phone:      data.phone,
    address:    data.address,
    role:       data.role,
    avatar_url: data.avatar_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// Creates the user profile in the `users` table after sign-up.
// Uses the admin client to bypass RLS (the user is not yet authenticated).
export async function createUserProfile(
  userId: string,
  fullName: string,
  email: string,
): Promise<void> {
  const supabase = await createAdminClient();
  await supabase
    .from("users")
    .upsert(
      { id: userId, email, full_name: fullName, role: "customer" },
      { onConflict: "id", ignoreDuplicates: true },
    );
}
