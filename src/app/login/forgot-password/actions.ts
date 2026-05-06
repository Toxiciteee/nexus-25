"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function sendResetEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login/forgot-password?error=missing");

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const redirectTo = `${proto}://${host}/login/reset-password`;

  const supabase = await createClient();
  // L'API renvoie OK même si l'email n'existe pas (anti-énumération).
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  redirect("/login/forgot-password?sent=1");
}
