"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePersonnel } from "@/lib/auth/rbac";

const Schema = z.object({
  patient_id: z.string().uuid(),
  type_prelevement_id: z.string().uuid(),
  date_prelevement: z.string().optional().nullable(),
});

export type CreateAnalyseState = { error?: string } | undefined;

export async function createAnalyse(
  _prev: CreateAnalyseState,
  formData: FormData,
): Promise<CreateAnalyseState> {
  const personnel = await requirePersonnel();
  if (personnel.role !== "secretaire" && personnel.role !== "chef_service") {
    return { error: "Action non autorisée." };
  }

  const parsed = Schema.safeParse({
    patient_id: formData.get("patient_id"),
    type_prelevement_id: formData.get("type_prelevement_id"),
    date_prelevement: formData.get("date_prelevement") || null,
  });
  if (!parsed.success) return { error: "Saisie invalide." };

  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("unite_id")
    .eq("id", parsed.data.patient_id)
    .maybeSingle();

  if (!patient) return { error: "Patient introuvable." };

  if (personnel.role === "secretaire" && patient.unite_id !== personnel.unite_id) {
    return { error: "Vous ne pouvez créer une analyse que pour un patient de votre unité." };
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      patient_id: parsed.data.patient_id,
      unite_id: patient.unite_id,
      type_prelevement_id: parsed.data.type_prelevement_id,
      date_prelevement: parsed.data.date_prelevement,
      statut: "brouillon",
      created_by: personnel.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/analyses/${data.id}`);
}
