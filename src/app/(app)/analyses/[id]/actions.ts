"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

/** Saisie/modification des résultats par la secrétaire (transverse) ou Chef
 *  de Service. La conclusion est réservée au Chef de Service : si le client
 *  envoie `undefined`, on ne la modifie pas ; un appel non autorisé est
 *  rejeté en silence. */
export async function saveResultats(
  analyseId: string,
  resultats: Record<string, unknown>,
  conclusion?: string | null,
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

  const updates: AnalyseUpdate = { resultats: resultats as unknown as Json };
  if (conclusion !== undefined && personnel.role === "chef_service") {
    updates.conclusion = conclusion;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("analyses")
    .update(updates)
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

/**
 * Secrétaire : envoie un rappel (notification) aux Chefs d'unité de l'unité
 * de l'analyse — sans changer le statut. Utile quand l'analyse est déjà en
 * `attente_unite` mais que la validation tarde. Le bouton reste disponible
 * indépendamment de l'état "lecture seule" du formulaire des résultats.
 */
export async function notifyChefUnite(
  analyseId: string,
): Promise<ActionResult> {
  const personnel = await requirePersonnel();
  const a = await loadAnalyse(analyseId);
  if (!a) return { error: "Analyse introuvable." };
  if (
    personnel.role !== "secretaire" &&
    personnel.role !== "chef_service"
  ) {
    return { error: "Action réservée à la secrétaire." };
  }
  if (a.statut !== "attente_unite") {
    return {
      error: "Le rappel n'est utile que lorsque l'analyse attend la validation d'unité.",
    };
  }

  const supabase = await createClient();
  const { data: analyseInfo } = await supabase
    .from("analyses")
    .select("numero")
    .eq("id", analyseId)
    .maybeSingle();
  const numero = analyseInfo?.numero ?? analyseId.slice(0, 8);

  const { data: chefs, error: chefsErr } = await supabase
    .from("personnel")
    .select("id")
    .eq("role", "chef_unite")
    .eq("unite_id", a.unite_id)
    .eq("actif", true);
  if (chefsErr) return { error: chefsErr.message };
  if (!chefs || chefs.length === 0) {
    return { error: "Aucun Chef d'unité actif trouvé pour cette unité." };
  }

  // Insertion via admin client : la RLS d'écriture sur `notifications` est
  // typiquement réservée aux triggers/role admin. Le contrôle d'accès est
  // déjà fait au-dessus (rôle + unité + statut).
  const admin = createAdminClient();
  const rows = chefs.map((c) => ({
    destinataire: c.id,
    analyse_id: analyseId,
    type: "rappel_validation_unite",
    titre: "Rappel : analyse en attente de validation",
    message: `La secrétaire vous demande de valider l'analyse ${numero}.`,
  }));
  const { error: insErr } = await admin.from("notifications").insert(rows);
  if (insErr) return { error: insErr.message };

  return { success: "Rappel envoyé au Chef d'unité." };
}

export type InterpretationPayload = {
  observation: string;
  interpretation: string;
};

/**
 * Chef d'unité : saisit l'observation + l'interprétation cliniques ET valide
 * en une seule action (attente_unite → attente_chef). Atomique.
 */
export async function validateChefUniteWithInterpretation(
  analyseId: string,
  payload: InterpretationPayload,
): Promise<ActionResult> {
  const personnel = await requirePersonnel();
  const a = await loadAnalyse(analyseId);
  if (!a) return { error: "Analyse introuvable." };
  if (a.statut !== "attente_unite") {
    return { error: `Action impossible : statut actuel "${a.statut}".` };
  }
  if (personnel.role !== "chef_service" && personnel.role !== "chef_unite") {
    return { error: "Action réservée au Chef d'unité." };
  }
  if (personnel.role !== "chef_service" && a.unite_id !== personnel.unite_id) {
    return { error: "Cette analyse n'appartient pas à votre unité." };
  }
  const interpretation = payload.interpretation.trim();
  const observation = payload.observation.trim();
  if (interpretation.length < 5) {
    return {
      error:
        "L'interprétation clinique est obligatoire avant validation (5 caractères minimum).",
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("analyses")
    .update({
      observation: observation || null,
      interpretation,
      interpretation_par: personnel.id,
      interpretation_at: now,
      statut: "attente_chef",
      valide_unite_par: personnel.id,
      valide_unite_at: now,
    })
    .eq("id", analyseId);
  if (error) return { error: error.message };

  revalidatePath(`/analyses/${analyseId}`);
  revalidatePath("/dashboard");
  return { success: "Interprétation enregistrée et dossier transmis." };
}

/**
 * Variante "auto-save" sans changer le statut.
 * Permet au Chef d'unité de sauvegarder son brouillon (observation +
 * interprétation).
 */
export async function saveInterpretation(
  analyseId: string,
  payload: InterpretationPayload,
): Promise<ActionResult> {
  const personnel = await requirePersonnel();
  const a = await loadAnalyse(analyseId);
  if (!a) return { error: "Analyse introuvable." };
  if (a.statut !== "attente_unite") {
    return { error: "Modification impossible à ce statut." };
  }
  if (personnel.role !== "chef_service" && personnel.role !== "chef_unite") {
    return { error: "Action réservée au Chef d'unité." };
  }
  if (personnel.role !== "chef_service" && a.unite_id !== personnel.unite_id) {
    return { error: "Cette analyse n'appartient pas à votre unité." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("analyses")
    .update({
      observation: payload.observation.trim() || null,
      interpretation: payload.interpretation.trim() || null,
    })
    .eq("id", analyseId);
  if (error) return { error: error.message };

  revalidatePath(`/analyses/${analyseId}`);
  return { success: "Interprétation enregistrée." };
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
  // La secrétaire est transverse — pas de cloisonnement par unité.
  // Les autres rôles (chef_unite) restent restreints à leur propre unité.
  if (
    personnel.role !== "chef_service" &&
    personnel.role !== "secretaire" &&
    a.unite_id !== personnel.unite_id
  ) {
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
