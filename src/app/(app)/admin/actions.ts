"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { requireChef } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
const InviteSchema = z
  .object({
    email: z.string().email("E-mail invalide"),
    nom: z.string().trim().min(1, "Nom requis"),
    prenom: z.string().trim().min(1, "Prénom requis"),
    // Le Chef de Service ne peut PAS inviter un autre Chef de Service —
    // il est l'unique compte de ce rôle. Seuls les rôles subordonnés sont
    // invitables via le formulaire.
    role: z.enum(["secretaire", "chef_unite"]),
    unite_id: z.string().uuid().optional().nullable(),
  })
  // Le Chef d'unité doit avoir une unité ; la Secrétaire est transverse.
  .refine((v) => v.role !== "chef_unite" || !!v.unite_id, {
    message: "Unité requise pour un Chef d'unité.",
    path: ["unite_id"],
  });

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

  // Calcule l'URL de retour absolue à partir des en-têtes de la requête.
  // Le mail d'invitation pointera vers cette page (et non vers l'URL Supabase
  // par défaut) — l'utilisateur arrivera sur notre page d'accueil "Bienvenue".
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const redirectTo = `${proto}://${host}/auth/accept-invite`;

  // 1) Invitation Supabase Auth (envoie le mail avec lien magique → redirectTo)
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        role: parsed.data.role,
      },
      redirectTo,
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

/**
 * Supprime définitivement un compte (auth + personnel) — réservé Chef de Service.
 * Utilise le service-role pour révoquer aussi l'utilisateur Supabase Auth,
 * libérant ainsi l'adresse e-mail pour une éventuelle réinvitation.
 */
export async function deletePersonnel(
  personnelId: string,
): Promise<{ error?: string; success?: string }> {
  const chef = await requireChef();
  if (chef.id === personnelId) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte." };
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

  // 1. Suppression du compte Auth (le record `personnel` est cascade-supprimé
  //    via la FK `personnel.id references auth.users(id) on delete cascade`).
  const { error } = await admin.auth.admin.deleteUser(personnelId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: "Compte supprimé." };
}

