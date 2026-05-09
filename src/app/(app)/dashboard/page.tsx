import Link from "next/link";
import { Search, Plus, FileText, ClipboardList, FileEdit, ShieldCheck, Hourglass, BadgeCheck } from "lucide-react";
import { requirePersonnel, ROLE_LABELS } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUT_LABELS, STATUT_BADGE_VARIANT, formatDateTime, fullName } from "@/lib/format";
import { GlobalSearch } from "@/components/dashboard/global-search";

export default async function DashboardPage() {
  const personnel = await requirePersonnel();
  const supabase = await createClient();

  // Compteurs : analyses par statut, patients de mon unité (ou globaux pour le chef)
  const isChef = personnel.role === "chef_service";
  const [{ count: nbBrouillon }, { count: nbAttenteUnite }, { count: nbAttenteChef }, { count: nbValide }] =
    await Promise.all([
      supabase.from("analyses").select("*", { count: "exact", head: true }).eq("statut", "brouillon"),
      supabase.from("analyses").select("*", { count: "exact", head: true }).eq("statut", "attente_unite"),
      supabase.from("analyses").select("*", { count: "exact", head: true }).eq("statut", "attente_chef"),
      supabase.from("analyses").select("*", { count: "exact", head: true }).eq("statut", "valide"),
    ]);

  // À traiter par moi
  const myQueue = await getMyQueue(personnel.role, personnel.unite_id);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-(--color-muted-foreground)">
          Bonjour {personnel.prenom} — {ROLE_LABELS[personnel.role]}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
      </div>

      {/* Recherche globale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-(--color-muted-foreground)" />
            Recherche patient
          </CardTitle>
          <CardDescription>
            Recherchez par numéro INI, nom ou prénom.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalSearch />
        </CardContent>
      </Card>

      {/* KPIs cliquables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Brouillons"
          value={nbBrouillon ?? 0}
          variant="outline"
          icon={<FileEdit className="h-8 w-8" />}
          href="/analyses?statut=brouillon"
          index={0}
        />
        <KpiCard
          label="En attente — Unité"
          value={nbAttenteUnite ?? 0}
          variant="warning"
          icon={<Hourglass className="h-8 w-8" />}
          href="/analyses?statut=attente_unite"
          index={1}
        />
        <KpiCard
          label="En attente — Chef"
          value={nbAttenteChef ?? 0}
          variant="warning"
          icon={<ShieldCheck className="h-8 w-8" />}
          href="/analyses?statut=attente_chef"
          index={2}
        />
        <KpiCard
          label="Validées"
          value={nbValide ?? 0}
          variant="success"
          icon={<BadgeCheck className="h-8 w-8" />}
          href="/analyses?statut=valide"
          index={3}
        />
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-3">
        {(personnel.role === "secretaire" || isChef) && (
          <>
            <LinkButton href="/patients/nouveau" variant="default">
              <Plus className="h-4 w-4" />
              Nouveau patient
            </LinkButton>
            <LinkButton href="/analyses/nouvelle" variant="outline">
              <FileText className="h-4 w-4" />
              Nouvelle analyse
            </LinkButton>
          </>
        )}
        <LinkButton href="/patients" variant="ghost">
          <ClipboardList className="h-4 w-4" />
          Tous les patients
        </LinkButton>
      </div>

      {/* File à traiter */}
      <Card>
        <CardHeader>
          <CardTitle>À traiter</CardTitle>
          <CardDescription>
            {myQueue.length === 0
              ? "Aucune analyse n'attend votre intervention."
              : `${myQueue.length} analyse(s) en attente de votre action.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myQueue.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Mise à jour</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myQueue.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.numero ?? a.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      {a.patient ? fullName(a.patient) : "—"}
                      <span className="block text-xs text-(--color-muted-foreground)">
                        INI {a.patient?.ini ?? ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUT_BADGE_VARIANT[a.statut]}>
                        {STATUT_LABELS[a.statut]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-(--color-muted-foreground)">
                      {formatDateTime(a.updated_at)}
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
  );
}

async function getMyQueue(role: string, uniteId: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("analyses")
    .select("id, numero, statut, updated_at, patient:patients(nom, prenom, ini)")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (role === "secretaire" && uniteId) {
    query = query.eq("statut", "brouillon").eq("unite_id", uniteId);
  } else if ((role === "resident" || role === "responsable_unite") && uniteId) {
    query = query.eq("statut", "attente_unite").eq("unite_id", uniteId);
  } else if (role === "chef_service") {
    query = query.eq("statut", "attente_chef");
  } else {
    return [];
  }

  const { data } = await query;
  type QueueRow = {
    id: string;
    numero: string | null;
    statut: import("@/lib/database.types").StatutAnalyse;
    updated_at: string;
    patient: { nom: string; prenom: string; ini: string } | null;
  };
  return (data ?? []) as unknown as QueueRow[];
}
