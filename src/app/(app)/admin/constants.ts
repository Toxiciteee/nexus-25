import type { RolePersonnel } from "@/lib/database.types";

export type RoleOption = { value: RolePersonnel; label: string; description: string };

/**
 * 3 rôles seulement (resident est déprécié et n'apparaît plus dans le formulaire).
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
  {
    value: "chef_service",
    label: "Chef de Service",
    description:
      "Super-administrateur : peut tout créer, modifier, valider, supprimer.",
  },
];
