import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Calendar, MapPin, User } from "lucide-react";
import { requirePersonnel } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  STATUT_BADGE_VARIANT,
  STATUT_LABELS,
  formatDate,
  formatDateTime,
  fullName,
} from "@/lib/format";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personnel = await requirePersonnel();
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*, unite:unites(id, code, nom)")
    .eq("id", id)
    .maybeSingle();

  if (!patient) notFound();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, numero, statut, date_prelevement, updated_at, type:types_prelevement(nom)")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  type AnalyseRow = {
    id: string;
    numero: string | null;
    statut: import("@/lib/database.types").StatutAnalyse;
    date_prelevement: string | null;
    updated_at: string;
    type: { nom: string } | null;
  };
  const analysesRows = (analyses ?? []) as unknown as AnalyseRow[];

  const samUnite = patient.unite_id === personnel.unite_id;
  const canCreate =
    personnel.role === "chef_service" ||
    (personnel.role === "secretaire" && samUnite);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/patients"
            className="text-sm text-(--color-muted-foreground) hover:underline"
          >
            ← Tous les patients
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {fullName(patient)}
          </h1>
          <div className="flex items-center gap-3 text-sm text-(--color-muted-foreground)">
            <span className="font-mono">INI {patient.ini}</span>
            {patient.unite && <Badge variant="secondary">{patient.unite.code}</Badge>}
          </div>
        </div>
        {canCreate && (
          <LinkButton href={`/analyses/nouvelle?patient=${patient.id}`} size="lg">
            <Plus className="h-4 w-4" />
            Ajouter une analyse
          </LinkButton>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Identité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info icon={<User className="h-4 w-4" />} label="Sexe">
              {patient.sexe ?? "—"}
            </Info>
            <Info icon={<Calendar className="h-4 w-4" />} label="Date de naissance">
              {formatDate(patient.date_naissance)}
            </Info>
            <Info icon={<MapPin className="h-4 w-4" />} label="Ville de naissance">
              {patient.ville_naissance ?? "—"}
            </Info>
            <div className="pt-2 border-t text-xs text-(--color-muted-foreground)">
              Enregistré le {formatDateTime(patient.created_at)}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Historique des analyses ({analysesRows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysesRows.length === 0 ? (
              <p className="text-sm text-(--color-muted-foreground) py-8 text-center">
                Aucune analyse enregistrée pour ce patient.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Prélèvement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysesRows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">
                        {a.numero ?? a.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{a.type?.nom ?? "—"}</TableCell>
                      <TableCell className="text-sm text-(--color-muted-foreground)">
                        {formatDate(a.date_prelevement)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUT_BADGE_VARIANT[a.statut]}>
                          {STATUT_LABELS[a.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <LinkButton href={`/analyses/${a.id}`} size="sm" variant="ghost">
                          Ouvrir
                        </LinkButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-(--color-muted-foreground)">{icon}</span>
      <div>
        <div className="text-xs text-(--color-muted-foreground)">{label}</div>
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}
