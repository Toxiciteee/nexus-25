import type { RolePersonnel } from "@/lib/database.types";

export type RoleOption = { value: RolePersonnel; label: string; description: string };

/**
 * Rôles invitables par le Chef de Service via le formulaire d'admin.
 *
 * Important : `chef_service` n'est PAS proposé.
 * Il n'y a qu'un seul Chef de Service (Mme Benboudiaf Sabah) ; ce compte est
 * créé manuellement en base. Le formulaire ne permet d'inviter que les rôles
 * subordonnés.
 */
export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "secretaire",
    label: "Secrétaire",
    description:
      "Crée les patients, saisit les résultats et soumet au Chef d'unité.",
  },
  {
    value: "chef_unite",
    label: "Chef d'unité",
    description:
      "Valide les dossiers de son unité et les transmet au Chef de Service.",
  },
];
