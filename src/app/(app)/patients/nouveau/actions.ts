"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePersonnel } from "@/lib/auth/rbac";

const PatientSchema = z.object({
  ini: z.string().trim().min(1, "Numéro INI requis"),
  nom: z.string().trim().min(1, "Nom requis"),
  prenom: z.string().trim().min(1, "Prénom requis"),
  date_naissance: z.string().optional().nullable(),
  ville_naissance: z.string().trim().optional().nullable(),
  sexe: z.enum(["M", "F"]).optional().nullable(),
  unite_id: z.string().uuid("Unité invalide"),
});

export type CreatePatientState = { error?: string } | undefined;

export async function createPatient(
  _prev: CreatePatientState,
  formData: FormData,
): Promise<CreatePatientState> {
  const personnel = await requirePersonnel();

  // Pour la secrétaire (transverse) et le Chef de Service, l'unité est choisie
  // dans le formulaire. Pour le Chef d'unité, l'unité est forcée à la sienne.
  const uniteFromForm = formData.get("unite_id");
  const raw = {
    ini: formData.get("ini"),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    date_naissance: formData.get("date_naissance") || null,
    ville_naissance: formData.get("ville_naissance") || null,
    sexe: formData.get("sexe") || null,
    unite_id:
      personnel.role === "secretaire" || personnel.role === "chef_service"
        ? uniteFromForm
        : personnel.unite_id,
  };

  const parsed = PatientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Saisie invalide." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .insert({ ...parsed.data, created_by: personnel.id })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ce numéro INI existe déjà." };
    return { error: error.message };
  }

  revalidatePath("/patients");
  redirect(`/patients/${data.id}`);
}
