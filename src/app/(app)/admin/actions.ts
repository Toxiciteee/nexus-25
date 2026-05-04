"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireChef } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { RolePersonnel } from "@/lib/database.types";

const InviteSchema = z
  .object({
    email: z.string().email("E-mail invalide"),
    nom: z.string().trim().min(1, "Nom requis"),
    prenom: z.string().trim().min(1, "Prénom requis"),
    role: z.enum([
      "secretaire",
      "resident",
      "responsable_unite",
      "chef_service",
    ]),
    unite_id: z.string().uuid().optional().nullable(),
  })
  .refine(
    (v) =>
      (v.role === "chef_service" && !v.unite_id) ||
      (v.role !== "chef_service" && !!v.unite_id),
    { message: "Unité requise pour ce rôle.", path: ["unite_id"] },
  );

export type InviteState = { error?: string; success?: string } | undefined;

export async function inviteMember(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  await requireChef();

  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    role: formData.get("role"),
    unite_id: formData.get("unite_id") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Saisie invalide." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Service-role key manquante : ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local.",
    };
  }

  // 1) Invitation Supabase Auth (envoie un mail de magic-link)
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        role: parsed.data.role,
      },
    });
  if (inviteError) return { error: inviteError.message };
  if (!invited.user) return { error: "Aucun utilisateur créé." };

  // 2) Insertion du record personnel (avec service-role pour bypass RLS)
  const { error: insertError } = await admin.from("personnel").insert({
    id: invited.user.id,
    email: parsed.data.email,
    nom: parsed.data.nom,
    prenom: parsed.data.prenom,
    role: parsed.data.role,
    unite_id: parsed.data.unite_id,
  });

  if (insertError) {
    // Rollback: best-effort delete the auth user we just invited
    await admin.auth.admin.deleteUser(invited.user.id);
    return { error: insertError.message };
  }

  revalidatePath("/admin");
  return { success: `Invitation envoyée à ${parsed.data.email}.` };
}

export async function setActif(personnelId: string, actif: boolean) {
  await requireChef();
  const supabase = await createClient();
  await supabase.from("personnel").update({ actif }).eq("id", personnelId);
  revalidatePath("/admin");
}

export type RoleOption = { value: RolePersonnel; label: string };

export const ROLE_OPTIONS: RoleOption[] = [
  { value: "secretaire", label: "Secrétaire" },
  { value: "resident", label: "Résident·e" },
  { value: "responsable_unite", label: "Responsable d'unité" },
  { value: "chef_service", label: "Chef de Service" },
];
