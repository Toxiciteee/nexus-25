import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Personnel, RolePersonnel } from "@/lib/database.types";

/**
 * Get the currently logged-in personnel record (joined with auth.users).
 * Returns null if the auth user has no personnel row yet (just-invited state).
 */
export async function getCurrentPersonnel(): Promise<Personnel | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("personnel")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}

/**
 * Require an authenticated personnel record. Redirects to /login otherwise.
 */
export async function requirePersonnel(): Promise<Personnel> {
  const personnel = await getCurrentPersonnel();
  if (!personnel) redirect("/login");
  if (!personnel.actif) redirect("/login?reason=inactive");
  return personnel;
}

/**
 * Require one of the listed roles.
 */
export async function requireRole(
  ...roles: RolePersonnel[]
): Promise<Personnel> {
  const personnel = await requirePersonnel();
  if (!roles.includes(personnel.role)) redirect("/dashboard?error=forbidden");
  return personnel;
}

/**
 * Require Chef de Service.
 */
export async function requireChef(): Promise<Personnel> {
  return requireRole("chef_service");
}

export const ROLE_LABELS: Record<RolePersonnel, string> = {
  secretaire: "Secrétaire",
  resident: "Résident·e",
  responsable_unite: "Responsable d'unité",
  chef_service: "Chef de Service",
};

export function canEditAnalyse(
  personnel: Personnel,
  analyseUniteId: string,
): boolean {
  if (personnel.role === "chef_service") return true;
  return personnel.unite_id === analyseUniteId;
}
