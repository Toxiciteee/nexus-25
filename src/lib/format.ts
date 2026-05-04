import type { StatutAnalyse } from "@/lib/database.types";

export const STATUT_LABELS: Record<StatutAnalyse, string> = {
  brouillon: "Brouillon",
  attente_unite: "En attente — Unité",
  attente_chef: "En attente — Chef de Service",
  valide: "Validé",
};

export const STATUT_BADGE_VARIANT: Record<
  StatutAnalyse,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  brouillon: "outline",
  attente_unite: "warning",
  attente_chef: "warning",
  valide: "success",
};

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

export function fullName(p: { prenom: string; nom: string }): string {
  return `${p.prenom} ${p.nom.toUpperCase()}`;
}
