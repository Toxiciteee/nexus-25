"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveResultats } from "./actions";
import type { StatutAnalyse } from "@/lib/database.types";

/**
 * Formulaire générique de saisie des résultats.
 * Le référentiel détaillé (cases à cocher par molécule, etc.) sera fourni
 * par l'utilisatrice. Pour l'instant on propose un éditeur clé/valeur
 * minimaliste qui sera remplacé par le formulaire métier propre à chaque unité.
 */
export function ResultatsForm({
  analyseId,
  statut,
  resultats,
  conclusion,
  canEdit,
}: {
  analyseId: string;
  statut: StatutAnalyse;
  resultats: Record<string, unknown>;
  conclusion: string | null;
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [conclusionValue, setConclusionValue] = useState(conclusion ?? "");

  // Placeholder : on offre 6 cases à cocher d'exemple + un champ libre.
  // À remplacer par le formulaire spécifique fourni par l'utilisateur.
  const [items, setItems] = useState<Record<string, boolean>>(() => ({
    benzodiazepines: Boolean(resultats.benzodiazepines),
    opiaces: Boolean(resultats.opiaces),
    cocaine: Boolean(resultats.cocaine),
    amphetamines: Boolean(resultats.amphetamines),
    cannabis: Boolean(resultats.cannabis),
    alcool: Boolean(resultats.alcool),
  }));

  const onSave = () =>
    startTransition(async () => {
      setError(null);
      setSaved(false);
      const r = await saveResultats(analyseId, items, conclusionValue || null);
      if (r.error) setError(r.error);
      if (r.success) setSaved(true);
    });

  if (!canEdit) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-(--color-muted-foreground)">
          {statut === "brouillon"
            ? "Lecture seule — vous ne pouvez pas modifier ce brouillon."
            : "Résultats verrouillés — l'analyse a été soumise au workflow de validation."}
        </p>
        <ResultatsReadonly items={items} conclusion={conclusionValue} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium mb-3">
          Substances recherchées <span className="text-(--color-muted-foreground)">(formulaire d'exemple — à personnaliser par unité)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(items).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-2.5 p-2.5 rounded-md border bg-(--color-card) cursor-pointer hover:bg-(--color-accent) transition-colors"
            >
              <Checkbox
                checked={value}
                onChange={(e) =>
                  setItems((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              <span className="text-sm capitalize">{key.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="conclusion">Conclusion / observations</Label>
        <Textarea
          id="conclusion"
          value={conclusionValue}
          onChange={(e) => setConclusionValue(e.target.value)}
          rows={4}
          placeholder="Synthèse, recommandations, observations cliniques…"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          {error && <span className="text-(--color-destructive)">{error}</span>}
          {saved && <span className="text-(--color-success)">Enregistré ✓</span>}
        </div>
        <Button onClick={onSave} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

function ResultatsReadonly({
  items,
  conclusion,
}: {
  items: Record<string, boolean>;
  conclusion: string;
}) {
  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-2 text-sm">
        {Object.entries(items).map(([key, value]) => (
          <li key={key} className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${value ? "bg-(--color-destructive)" : "bg-(--color-muted-foreground)/30"}`}
            />
            <span className="capitalize">{key.replace(/_/g, " ")}</span>
            <span className="ml-auto text-(--color-muted-foreground)">
              {value ? "Positif" : "Négatif"}
            </span>
          </li>
        ))}
      </ul>
      {conclusion && (
        <div className="rounded-md bg-(--color-muted) p-3 text-sm whitespace-pre-wrap">
          {conclusion}
        </div>
      )}
    </div>
  );
}
