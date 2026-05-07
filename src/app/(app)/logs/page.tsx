import Link from "next/link";
import { History, ChevronRight } from "lucide-react";
import { requireChef } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, fullName, STATUT_BADGE_VARIANT, STATUT_LABELS } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import type { StatutAnalyse, RolePersonnel } from "@/lib/database.types";

const EVENT_LABELS: Record<string, string> = {
  creation: "Création",
  soumission_unite: "Soumission Chef d'unité",
  verification_resident: "Vérification (déprécié)",
  validation_responsable: "Validation Chef d'unité",
  validation_chef: "Validation Chef de Service",
  rejet: "Renvoi en brouillon",
  modification: "Modification",
};

const EVENT_TONES: Record<string, string> = {
  creation: "bg-(--color-primary)/10 text-(--color-primary)",
  soumission_unite: "bg-amber-500/10 text-amber-700",
  validation_responsable: "bg-emerald-500/10 text-emerald-700",
  validation_chef: "bg-(--color-success)/15 text-(--color-success)",
  rejet: "bg-(--color-destructive)/10 text-(--color-destructive)",
  modification: "bg-slate-500/10 text-slate-700",
};

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
    .limit(300);

  type LogRow = {
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
  const rows = (events ?? []) as unknown as LogRow[];

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
          <CardTitle className="text-base">
            {rows.length} dernier{rows.length > 1 ? "s" : ""} événement{rows.length > 1 ? "s" : ""}
          </CardTitle>
          <CardDescription>Limité aux 300 derniers événements.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <p className="text-sm text-(--color-muted-foreground) py-12 text-center">
              Aucun événement enregistré pour l'instant.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Événement</TableHead>
                  <TableHead>Dossier</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Acteur</TableHead>
                  <TableHead>Transition</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          EVENT_TONES[r.event] ?? "bg-slate-500/10 text-slate-700"
                        }`}
                      >
                        {EVENT_LABELS[r.event] ?? r.event}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.analyse ? (
                        <Link
                          href={`/analyses/${r.analyse.id}`}
                          className="font-mono text-sm text-(--color-primary) hover:underline"
                        >
                          {r.analyse.numero ?? r.analyse.id.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-xs text-(--color-muted-foreground) italic">
                          (supprimé)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.analyse?.patient ? (
                        <div className="text-sm">
                          <div>{fullName(r.analyse.patient)}</div>
                          <div className="text-[11px] text-(--color-muted-foreground) font-mono">
                            INI {r.analyse.patient.ini}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-(--color-muted-foreground)">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.analyse?.unite ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {r.analyse.unite.code}
                        </Badge>
                      ) : (
                        <span className="text-xs text-(--color-muted-foreground)">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.acteur ? (
                        <div className="text-sm">
                          <div>{fullName(r.acteur)}</div>
                          <div className="text-[11px] text-(--color-muted-foreground)">
                            {ROLE_LABELS[r.acteur.role]}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-(--color-muted-foreground) italic">
                          système
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.statut_avant && r.statut_apres ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[9px]">
                            {STATUT_LABELS[r.statut_avant]}
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-(--color-muted-foreground)" />
                          <Badge
                            variant={STATUT_BADGE_VARIANT[r.statut_apres]}
                            className="text-[9px]"
                          >
                            {STATUT_LABELS[r.statut_apres]}
                          </Badge>
                        </div>
                      ) : r.statut_apres ? (
                        <Badge
                          variant={STATUT_BADGE_VARIANT[r.statut_apres]}
                          className="text-[9px]"
                        >
                          {STATUT_LABELS[r.statut_apres]}
                        </Badge>
                      ) : (
                        <span className="text-xs text-(--color-muted-foreground)">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-(--color-muted-foreground) tabular-nums">
                      {formatDateTime(r.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
