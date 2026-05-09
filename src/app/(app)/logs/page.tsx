import { History } from "lucide-react";
import { requireChef } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import type { StatutAnalyse, RolePersonnel } from "@/lib/database.types";
import { LogsTable, type LogRow } from "./logs-table";

export default async function LogsPage() {
  await requireChef();
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("analyses_historique")
    .select(
      `
      id, event, statut_avant, statut_apres, created_at,
      analyse:analyses(id, numero, unite:unites(code), patient:patients(nom, prenom, ini)),
      acteur:personnel(nom, prenom, role)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(500);

  type RawRow = {
    id: string;
    event: string;
    statut_avant: StatutAnalyse | null;
    statut_apres: StatutAnalyse | null;
    created_at: string;
    analyse: {
      id: string;
      numero: string | null;
      unite: { code: string } | null;
      patient: { nom: string; prenom: string; ini: string } | null;
    } | null;
    acteur: { nom: string; prenom: string; role: RolePersonnel } | null;
  };

  const rows: LogRow[] = ((events ?? []) as unknown as RawRow[]).map((r) => ({
    id: r.id,
    event: r.event,
    statut_avant: r.statut_avant,
    statut_apres: r.statut_apres,
    created_at: r.created_at,
    analyse_id: r.analyse?.id ?? null,
    numero: r.analyse?.numero ?? null,
    unite_code: r.analyse?.unite?.code ?? null,
    patient_label: r.analyse?.patient
      ? `${r.analyse.patient.prenom} ${r.analyse.patient.nom.toUpperCase()}`
      : null,
    patient_ini: r.analyse?.patient?.ini ?? null,
    acteur_label: r.acteur ? `${r.acteur.prenom} ${r.acteur.nom.toUpperCase()}` : null,
    acteur_role: r.acteur?.role ?? null,
    acteur_role_label: r.acteur ? ROLE_LABELS[r.acteur.role] : null,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-(--color-muted-foreground) flex items-center gap-1.5">
          <History className="h-4 w-4" /> Journal d'audit
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Toutes les actions</h1>
        <p className="text-sm text-(--color-muted-foreground) mt-1">
          Trace complète des créations, modifications, validations et renvois sur
          tous les dossiers d'analyse.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{rows.length} événement{rows.length > 1 ? "s" : ""}</CardTitle>
          <CardDescription>
            Filtrez par utilisateur, rôle, type d'action ou période.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <LogsTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
