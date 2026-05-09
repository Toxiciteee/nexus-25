"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_TYPES = new Set([
  "invite",
  "magiclink",
  "recovery",
  "signup",
  "email_change",
]);

export async function confirmOtp(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!tokenHash || !VALID_TYPES.has(type)) {
    redirect("/auth/confirm?status=invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as "invite" | "magiclink" | "recovery" | "signup" | "email_change",
    token_hash: tokenHash,
  });

  if (error) {
    redirect(
      `/auth/confirm?status=error&message=${encodeURIComponent(error.message)}`,
    );
  }

  // `next` doit être un chemin local (pas d'open redirect).
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  redirect(safeNext);
}
