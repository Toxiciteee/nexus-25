import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Personnel, RolePersonnel } from "@/lib/database.types";

/**
 * Modèle hiérarchique simplifié à 3 rôles :
 *   1. secretaire   — création patient + saisie résultats + envoi à Chef d'unité
 *   2. chef_unite   — validation des dossiers de son unité, transfert au Chef de Service
 *   3. chef_service — super-admin : tout faire (créer / modifier / valider / supprimer)
 *
 * (`resident` reste dans l'enum pour compat historique mais n'est plus proposé.)
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

export async function requirePersonnel(): Promise<Personnel> {
  const personnel = await getCurrentPersonnel();
  if (!personnel) redirect("/login");
  if (!personnel.actif) redirect("/login?reason=inactive");
  return personnel;
}

export async function requireRole(
  ...roles: RolePersonnel[]
): Promise<Personnel> {
  const personnel = await requirePersonnel();
  if (!roles.includes(personnel.role)) redirect("/dashboard?error=forbidden");
  return personnel;
}

export async function requireChef(): Promise<Personnel> {
  return requireRole("chef_service");
}

export const ROLE_LABELS: Record<RolePersonnel, string> = {
  secretaire: "Secrétaire",
  resident: "Résident·e", // historique
  chef_unite: "Chef d'unité",
  chef_service: "Chef de Service",
};

export function isChef(p: Personnel): boolean {
  return p.role === "chef_service";
}

export function canEditAnalyse(
  personnel: Personnel,
  analyseUniteId: string,
): boolean {
  if (personnel.role === "chef_service") return true;
  return personnel.unite_id === analyseUniteId;
}
