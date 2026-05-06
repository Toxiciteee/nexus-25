"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePersonnel } from "@/lib/auth/rbac";
import type { StatutAnalyse, Json, Database } from "@/lib/database.types";

type AnalyseUpdate = Database["public"]["Tables"]["analyses"]["Update"];
type ActionResult = { error?: string; success?: string };

async function loadAnalyse(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("analyses")
    .select("id, statut, unite_id")
    .eq("id", id)
    .maybeSingle();
  return data;
}

/** Saisie/modification des résultats par la secrétaire (ou Chef de Service). */
export async function saveResultats(
  analyseId: string,
  resultats: Record<string, unknown>,
  conclusion: string | null,
): Promise<ActionResult> {
  const personnel = await requirePersonnel();
  const a = await loadAnalyse(analyseId);
  if (!a) return { error: "Analyse introuvable." };
  if (personnel.role !== "secretaire" && personnel.role !== "chef_service") {
    return { error: "Seule la secrétaire peut saisir les résultats." };
  }
  if (a.statut !== "brouillon") {
    return { error: "Les résultats ne peuvent être modifiés qu'en brouillon." };
  }
  if (personnel.role === "secretaire" && a.unite_id !== personnel.unite_id) {
    return { error: "Cette analyse n'appartient pas à votre unité." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("analyses")
    .update({ resultats: resultats as unknown as Json, conclusion })
    .eq("id", analyseId);
  if (error) return { error: error.message };

  revalidatePath(`/analyses/${analyseId}`);
  return { success: "Résultats enregistrés." };
}

/* ===================== TRANSITIONS DE WORKFLOW ====================== */

/** Secrétaire : envoie au Chef d'unité (brouillon → attente_unite). */
export async function submitToChefUnite(
  analyseId: string,
): Promise<ActionResult> {
  return transition(analyseId, "brouillon", "attente_unite", ["secretaire"]);
}

/** Chef d'unité : valide et envoie au Chef de Service (attente_unite → attente_chef). */
export async function validateChefUnite(
  analyseId: string,
): Promise<ActionResult> {
  return transition(analyseId, "attente_unite", "attente_chef", ["chef_unite"]);
}

/** Chef de Service : validation finale (attente_chef → valide). */
export async function validateChefService(
  analyseId: string,
): Promise<ActionResult> {
  return transition(analyseId, "attente_chef", "valide", ["chef_service"]);
}

/** Renvoie en brouillon (Chef d'unité ou Chef de Service). */
export async function rejectAnalyse(analyseId: string): Promise<ActionResult> {
  const personnel = await requirePersonnel();
  const a = await loadAnalyse(analyseId);
  if (!a) return { error: "Analyse introuvable." };
  if (personnel.role === "secretaire") {
    return { error: "Action non autorisée." };
  }
  if (personnel.role !== "chef_service" && a.unite_id !== personnel.unite_id) {
    return { error: "Cette analyse n'appartient pas à votre unité." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("analyses")
    .update({ statut: "brouillon" })
    .eq("id", analyseId);
  if (error) return { error: error.message };

  revalidatePath(`/analyses/${analyseId}`);
  return { success: "Dossier renvoyé en brouillon." };
}

/** Chef de Service uniquement : suppression d'une analyse. */
export async function deleteAnalyse(analyseId: string): Promise<ActionResult> {
  const personnel = await requirePersonnel();
  if (personnel.role !== "chef_service") {
    return { error: "Action réservée au Chef de Service." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("analyses").delete().eq("id", analyseId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: "Dossier supprimé." };
}

/* ====================== HELPERS INTERNES ============================ */

async function transition(
  analyseId: string,
  from: StatutAnalyse,
  to: StatutAnalyse,
  allowedRoles: string[],
): Promise<ActionResult> {
  const personnel = await requirePersonnel();
  const a = await loadAnalyse(analyseId);
  if (!a) return { error: "Analyse introuvable." };
  if (a.statut !== from) {
    return { error: `Transition impossible : statut actuel "${a.statut}".` };
  }
  if (
    personnel.role !== "chef_service" &&
    !allowedRoles.includes(personnel.role)
  ) {
    return { error: "Action non autorisée pour votre rôle." };
  }
  if (personnel.role !== "chef_service" && a.unite_id !== personnel.unite_id) {
    return { error: "Cette analyse n'appartient pas à votre unité." };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const updates: AnalyseUpdate = { statut: to };
  if (to === "attente_chef") {
    updates.valide_unite_par = personnel.id;
    updates.valide_unite_at = now;
  }
  if (to === "valide") {
    updates.valide_chef_par = personnel.id;
    updates.valide_chef_at = now;
  }

  const { error } = await supabase
    .from("analyses")
    .update(updates)
    .eq("id", analyseId);
  if (error) return { error: error.message };

  revalidatePath(`/analyses/${analyseId}`);
  revalidatePath("/dashboard");
  return { success: "Statut mis à jour." };
}
