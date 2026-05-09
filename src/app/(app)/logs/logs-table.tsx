"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, STATUT_BADGE_VARIANT, STATUT_LABELS } from "@/lib/format";
import type { StatutAnalyse, RolePersonnel } from "@/lib/database.types";

export type LogRow = {
  id: string;
  event: string;
  statut_avant: StatutAnalyse | null;
  statut_apres: StatutAnalyse | null;
  created_at: string;
  analyse_id: string | null;
  numero: string | null;
  unite_code: string | null;
  patient_label: string | null;
  patient_ini: string | null;
  acteur_label: string | null;
  acteur_role: RolePersonnel | null;
  acteur_role_label: string | null;
};

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

const EVENT_OPTIONS = [
  { value: "", label: "Toutes les actions" },
  { value: "creation", label: "Création" },
  { value: "soumission_unite", label: "Soumission Chef d'unité" },
  { value: "validation_responsable", label: "Validation Chef d'unité" },
  { value: "validation_chef", label: "Validation Chef de Service" },
  { value: "rejet", label: "Renvoi en brouillon" },
  { value: "modification", label: "Modification" },
];

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "Tous les rôles" },
  { value: "secretaire", label: "Secrétaire" },
  { value: "chef_unite", label: "Chef d'unité" },
  { value: "chef_service", label: "Chef de Service" },
];

export function LogsTable({ rows }: { rows: LogRow[] }) {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;

    return rows.filter((r) => {
      if (eventFilter && r.event !== eventFilter) return false;
      if (roleFilter && r.acteur_role !== roleFilter) return false;
      if (fromTs && new Date(r.created_at).getTime() < fromTs) return false;
      if (toTs && new Date(r.created_at).getTime() > toTs) return false;
      if (term) {
        const hay = [
          r.acteur_label,
          r.acteur_role_label,
          r.patient_label,
          r.patient_ini,
          r.numero,
          r.unite_code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, search, eventFilter, roleFilter, from, to]);

  const reset = () => {
    setSearch("");
    setEventFilter("");
    setRoleFilter("");
    setFrom("");
    setTo("");
  };

  const hasFilters = !!(search || eventFilter || roleFilter || from || to);

  return (
    <div>
      {/* Bandeau de filtres */}
      <div className="px-6 pb-4 space-y-3 border-b">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label htmlFor="logs-search" className="text-xs text-(--color-muted-foreground) mb-1 block">
              Recherche
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--color-muted-foreground)" />
              <Input
                id="logs-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, INI, n° dossier, unité…"
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <Label htmlFor="logs-event" className="text-xs text-(--color-muted-foreground) mb-1 block">
              Action
            </Label>
            <Select
              id="logs-event"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-9 text-sm"
            >
              {EVENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="logs-role" className="text-xs text-(--color-muted-foreground) mb-1 block">
              Rôle
            </Label>
            <Select
              id="logs-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 text-sm"
            >
              {ROLE_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="logs-from" className="text-xs text-(--color-muted-foreground) mb-1 block">
                Du
              </Label>
              <Input
                id="logs-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="logs-to" className="text-xs text-(--color-muted-foreground) mb-1 block">
                Au
              </Label>
              <Input
                id="logs-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-(--color-muted-foreground)">
            {filtered.length} sur {rows.length} événement{rows.length > 1 ? "s" : ""}
          </span>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={reset} className="h-7 text-xs">
              <X className="h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <p className="text-sm text-(--color-muted-foreground) py-12 text-center">
          Aucun événement ne correspond aux filtres.
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
            {filtered.map((r) => (
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
                  {r.analyse_id ? (
                    <Link
                      href={`/analyses/${r.analyse_id}`}
                      className="font-mono text-sm text-(--color-primary) hover:underline"
                    >
                      {r.numero ?? r.analyse_id.slice(0, 8)}
                    </Link>
                  ) : (
                    <span className="text-xs text-(--color-muted-foreground) italic">(supprimé)</span>
                  )}
                </TableCell>
                <TableCell>
                  {r.patient_label ? (
                    <div className="text-sm">
                      <div>{r.patient_label}</div>
                      <div className="text-[11px] text-(--color-muted-foreground) font-mono">
                        INI {r.patient_ini}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-(--color-muted-foreground)">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {r.unite_code ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {r.unite_code}
                    </Badge>
                  ) : (
                    <span className="text-xs text-(--color-muted-foreground)">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {r.acteur_label ? (
                    <div className="text-sm">
                      <div>{r.acteur_label}</div>
                      <div className="text-[11px] text-(--color-muted-foreground)">
                        {r.acteur_role_label}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-(--color-muted-foreground) italic">système</span>
                  )}
                </TableCell>
                <TableCell>
                  {r.statut_avant && r.statut_apres ? (
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px]">
                        {STATUT_LABELS[r.statut_avant]}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-(--color-muted-foreground)" />
                      <Badge variant={STATUT_BADGE_VARIANT[r.statut_apres]} className="text-[9px]">
                        {STATUT_LABELS[r.statut_apres]}
                      </Badge>
                    </div>
                  ) : r.statut_apres ? (
                    <Badge variant={STATUT_BADGE_VARIANT[r.statut_apres]} className="text-[9px]">
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
    </div>
  );
}
