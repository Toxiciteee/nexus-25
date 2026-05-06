import Link from "next/link";
import { History, ChevronRight } from "lucide-react";
import { requireChef } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, fullName, STATUT_BADGE_VARIANT, STATUT_LABELS } from "@/lib/format";
import type { StatutAnalyse } from "@/lib/database.types";

const EVENT_LABELS: Record<string, string> = {
  creation: "Création",
  soumission_unite: "Soumission au Chef d'unité",
  verification_resident: "Vérification (rôle déprécié)",
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
    .limit(200);

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
    acteur: { nom: string; prenom: string; role: string } | null;
  };
  const rows = (events ?? []) as unknown as LogRow[];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
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
          <CardDescription>Limité aux 200 derniers événements.</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-(--color-muted-foreground) py-12 text-center">
              Aucun événement enregistré pour l'instant.
            </p>
          ) : (
            <ol className="space-y-2">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-(--color-muted)/50 transition-colors"
                >
                  <div
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                      EVENT_TONES[r.event] ?? "bg-slate-500/10 text-slate-700"
                    }`}
                  >
                    {EVENT_LABELS[r.event] ?? r.event}
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {r.analyse ? (
                        <Link
                          href={`/analyses/${r.analyse.id}`}
                          className="font-mono text-(--color-primary) hover:underline"
                        >
                          {r.analyse.numero ?? r.analyse.id.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-(--color-muted-foreground) italic">
                          (dossier supprimé)
                        </span>
                      )}
                      {r.analyse?.unite && (
                        <Badge variant="secondary" className="text-[10px]">
                          {r.analyse.unite.code}
                        </Badge>
                      )}
                      {r.analyse?.patient && (
                        <span className="text-(--color-muted-foreground)">
                          · {fullName(r.analyse.patient)} (INI {r.analyse.patient.ini})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-(--color-muted-foreground) mt-0.5 flex items-center gap-2">
                      <span>{formatDateTime(r.created_at)}</span>
                      {r.acteur && (
                        <>
                          <span>·</span>
                          <span>par {fullName(r.acteur)}</span>
                        </>
                      )}
                      {r.statut_avant && r.statut_apres && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Badge variant="outline" className="text-[9px]">
                              {STATUT_LABELS[r.statut_avant]}
                            </Badge>
                            <ChevronRight className="h-3 w-3" />
                            <Badge
                              variant={STATUT_BADGE_VARIANT[r.statut_apres]}
                              className="text-[9px]"
                            >
                              {STATUT_LABELS[r.statut_apres]}
                            </Badge>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
