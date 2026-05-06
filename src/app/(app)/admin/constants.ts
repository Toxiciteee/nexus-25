import type { RolePersonnel } from "@/lib/database.types";

export type RoleOption = { value: RolePersonnel; label: string };

export const ROLE_OPTIONS: RoleOption[] = [
  { value: "secretaire", label: "Secrétaire" },
  { value: "resident", label: "Résident·e" },
  { value: "responsable_unite", label: "Responsable d'unité" },
  { value: "chef_service", label: "Chef de Service" },
];
