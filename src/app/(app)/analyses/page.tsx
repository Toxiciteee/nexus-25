import Link from "next/link";
import { Filter, X } from "lucide-react";
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
  formatDateTime,
  fullName,
} from "@/lib/format";
import type { StatutAnalyse } from "@/lib/database.types";

const STATUTS: StatutAnalyse[] = [
  "brouillon",
  "attente_unite",
  "attente_chef",
  "valide",
];

export default async function AnalysesListPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; unite?: string }>;
}) {
  const personnel = await requirePersonnel();
  const supabase = await createClient();

  const params = await searchParams;
  const statutFilter = STATUTS.includes(params.statut as StatutAnalyse)
    ? (params.statut as StatutAnalyse)
    : null;
  const uniteFilter = params.unite ?? null;

  // Liste des unités (pour les filtres affichés au Chef de Service)
  const { data: unites } = await supabase
    .from("unites")
    .select("id, code, nom")
    .order("nom");

  let query = supabase
    .from("analyses")
    .select(
      `
      id, numero, statut, updated_at, date_prelevement,
      patient:patients(nom, prenom, ini),
      unite:unites(code, nom),
      type:types_prelevement(nom)
      `,
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (statutFilter) query = query.eq("statut", statutFilter);
  if (uniteFilter && personnel.role === "chef_service") {
    const u = unites?.find((u) => u.code === uniteFilter);
    if (u) query = query.eq("unite_id", u.id);
  }

  const { data: rows } = await query;

  type Row = {
    id: string;
    numero: string | null;
    statut: StatutAnalyse;
    updated_at: string;
    date_prelevement: string | null;
    patient: { nom: string; prenom: string; ini: string } | null;
    unite: { code: string; nom: string } | null;
    type: { nom: string } | null;
  };
  const list = (rows ?? []) as unknown as Row[];

  const buildHref = (next: { statut?: string | null; unite?: string | null }) => {
    const u = new URLSearchParams();
    const s = next.statut !== undefined ? next.statut : statutFilter;
    const un = next.unite !== undefined ? next.unite : uniteFilter;
    if (s) u.set("statut", s);
    if (un) u.set("unite", un);
    const qs = u.toString();
    return `/analyses${qs ? `?${qs}` : ""}`;
  };

  const activeFilters = [
    statutFilter && {
      label: STATUT_LABELS[statutFilter],
      removeHref: buildHref({ statut: null }),
    },
    uniteFilter && { label: `Unité ${uniteFilter}`, removeHref: buildHref({ unite: null }) },
  ].filter(Boolean) as { label: string; removeHref: string }[];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-(--color-muted-foreground) flex items-center gap-1.5">
            <Filter className="h-4 w-4" /> Liste filtrée
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Analyses</h1>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-(--color-muted-foreground) font-medium">
              Statut
            </span>
            <FilterChip label="Tous" href={buildHref({ statut: null })} active={!statutFilter} />
            {STATUTS.map((s) => (
              <FilterChip
                key={s}
                label={STATUT_LABELS[s]}
                href={buildHref({ statut: s })}
                active={statutFilter === s}
              />
            ))}
          </div>

          {personnel.role === "chef_service" && unites && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-(--color-muted-foreground) font-medium">
                Unité
              </span>
              <FilterChip label="Toutes" href={buildHref({ unite: null })} active={!uniteFilter} />
              {unites.map((u) => (
                <FilterChip
                  key={u.id}
                  label={u.code}
                  href={buildHref({ unite: u.code })}
                  active={uniteFilter === u.code}
                />
              ))}
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-xs text-(--color-muted-foreground)">Filtres actifs :</span>
              {activeFilters.map((f, i) => (
                <Link
                  key={i}
                  href={f.removeHref}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs hover:bg-(--color-primary)/15"
                >
                  {f.label}
                  <X className="h-3 w-3" />
                </Link>
              ))}
              <Link
                href="/analyses"
                className="text-xs text-(--color-muted-foreground) hover:text-(--color-foreground) underline"
              >
                Réinitialiser
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {list.length} dossier{list.length > 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {list.length === 0 ? (
            <p className="text-sm text-(--color-muted-foreground) py-12 text-center">
              Aucun dossier ne correspond à ces filtres.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Prélèvement</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Mise à jour</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">
                      {r.numero ?? r.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {r.patient ? (
                        <>
                          <div className="font-medium">{fullName(r.patient)}</div>
                          <div className="text-[11px] text-(--color-muted-foreground) font-mono">
                            INI {r.patient.ini}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-(--color-muted-foreground)">
                      {r.type?.nom ?? "—"}
                    </TableCell>
                    <TableCell>
                      {r.unite && <Badge variant="secondary">{r.unite.code}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUT_BADGE_VARIANT[r.statut]}>
                        {STATUT_LABELS[r.statut]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-(--color-muted-foreground) tabular-nums">
                      {formatDateTime(r.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <LinkButton href={`/analyses/${r.id}`} size="sm" variant="ghost">
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

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "border-(--color-primary) bg-(--color-primary) text-(--color-primary-foreground)"
          : "border-(--color-border) hover:bg-(--color-accent)"
      }`}
    >
      {label}
    </Link>
  );
}
