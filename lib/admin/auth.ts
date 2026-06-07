import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Verifies the current session has admin role.
 * Returns { supabase, user } on success, or a NextResponse error to return immediately.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ message: "Non autorisé" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ message: "Accès refusé" }, { status: 403 }) };
  }

  return { supabase, user };
}
