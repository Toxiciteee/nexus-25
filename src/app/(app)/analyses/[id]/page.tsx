import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown, History } from "lucide-react";
import { requirePersonnel, ROLE_LABELS } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  STATUT_BADGE_VARIANT,
  STATUT_LABELS,
  formatDate,
  formatDateTime,
  fullName,
} from "@/lib/format";
import { WorkflowActions } from "./workflow-actions";
import { ResultatsForm } from "./resultats-form";

const EVENT_LABELS: Record<string, string> = {
  creation: "Création",
  soumission_unite: "Soumission à l'unité",
  verification_resident: "Vérification résident",
  validation_responsable: "Validation responsable d'unité",
  validation_chef: "Validation Chef de Service",
  rejet: "Rejet",
  modification: "Modification",
};

export default async function AnalyseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personnel = await requirePersonnel();
  const supabase = await createClient();

  const { data: analyse } = await supabase
    .from("analyses")
    .select(
      `
      *,
      patient:patients(id, ini, nom, prenom, date_naissance, sexe),
      type:types_prelevement(id, nom),
      unite:unites(id, code, nom),
      cree_par:personnel!analyses_created_by_fkey(nom, prenom),
      valide_unite:personnel!analyses_valide_unite_par_fkey(nom, prenom),
      valide_chef:personnel!analyses_valide_chef_par_fkey(nom, prenom)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (!analyse) notFound();

  const { data: histoRaw } = await supabase
    .from("analyses_historique")
    .select("id, event, statut_avant, statut_apres, created_at, acteur:personnel(nom, prenom)")
    .eq("analyse_id", id)
    .order("created_at", { ascending: false });
  type HistoRow = {
    id: string;
    event: string;
    statut_avant: string | null;
    statut_apres: string | null;
    created_at: string;
    acteur: { nom: string; prenom: string } | null;
  };
  const histo = (histoRaw ?? []) as unknown as HistoRow[];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          {analyse.patient && (
            <Link
              href={`/patients/${analyse.patient.id}`}
              className="text-sm text-(--color-muted-foreground) hover:underline"
            >
              ← Dossier de {fullName(analyse.patient)}
            </Link>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            Analyse {analyse.numero ?? `#${analyse.id.slice(0, 8)}`}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={STATUT_BADGE_VARIANT[analyse.statut]}>
              {STATUT_LABELS[analyse.statut]}
            </Badge>
            {analyse.unite && <Badge variant="secondary">{analyse.unite.code}</Badge>}
            {analyse.type && (
              <span className="text-sm text-(--color-muted-foreground)">
                Prélèvement : {analyse.type.nom}
              </span>
            )}
          </div>
        </div>

        {analyse.statut === "valide" && (
          <LinkButton href={`/api/pdf/${analyse.id}`} target="_blank" variant="outline">
            <FileDown className="h-4 w-4" />
            Télécharger le rapport PDF
          </LinkButton>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résultats</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultatsForm
                analyseId={analyse.id}
                statut={analyse.statut}
                resultats={(analyse.resultats ?? {}) as Record<string, unknown>}
                conclusion={analyse.conclusion}
                canEdit={
                  analyse.statut === "brouillon" &&
                  (personnel.role === "secretaire" || personnel.role === "chef_service") &&
                  (personnel.role === "chef_service" ||
                    analyse.unite_id === personnel.unite_id)
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-(--color-muted-foreground)" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l pl-5 space-y-4">
                {histo.map((h) => (
                  <li key={h.id} className="text-sm">
                    <span className="absolute -left-[5px] mt-1 h-2.5 w-2.5 rounded-full bg-(--color-primary)" />
                    <div className="font-medium">{EVENT_LABELS[h.event] ?? h.event}</div>
                    <div className="text-xs text-(--color-muted-foreground)">
                      {formatDateTime(h.created_at)}
                      {h.acteur ? ` · ${fullName(h.acteur)}` : ""}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {analyse.patient && (
                <>
                  <div className="font-medium">{fullName(analyse.patient)}</div>
                  <div className="text-xs text-(--color-muted-foreground) font-mono">
                    INI {analyse.patient.ini}
                  </div>
                  <Separator className="my-2" />
                  <Info label="Date de naissance">
                    {formatDate(analyse.patient.date_naissance)}
                  </Info>
                  <Info label="Sexe">{analyse.patient.sexe ?? "—"}</Info>
                  <Info label="Date de prélèvement">
                    {formatDate(analyse.date_prelevement)}
                  </Info>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Step
                label="Saisie (Secrétaire)"
                done={!!analyse.created_by}
                who={analyse.cree_par ? fullName(analyse.cree_par) : null}
                when={analyse.created_at}
              />
              <Step
                label="Validation Unité"
                done={!!analyse.valide_unite_at}
                who={
                  analyse.valide_unite ? fullName(analyse.valide_unite) : null
                }
                when={analyse.valide_unite_at}
              />
              <Step
                label="Validation Chef de Service"
                done={!!analyse.valide_chef_at}
                who={analyse.valide_chef ? fullName(analyse.valide_chef) : null}
                when={analyse.valide_chef_at}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowActions
                analyseId={analyse.id}
                statut={analyse.statut}
                personnelRole={personnel.role}
                isSameUnite={analyse.unite_id === personnel.unite_id}
              />
              <p className="mt-3 text-xs text-(--color-muted-foreground)">
                Connecté en tant que {ROLE_LABELS[personnel.role]}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-(--color-muted-foreground) text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}

function Step({
  label,
  done,
  who,
  when,
}: {
  label: string;
  done: boolean;
  who: string | null;
  when: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
          done ? "bg-(--color-success)" : "bg-(--color-muted-foreground)/30"
        }`}
      />
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {done ? (
          <div className="text-xs text-(--color-muted-foreground)">
            {who ?? "—"} · {formatDateTime(when)}
          </div>
        ) : (
          <div className="text-xs text-(--color-muted-foreground)">En attente</div>
        )}
      </div>
    </div>
  );
}
