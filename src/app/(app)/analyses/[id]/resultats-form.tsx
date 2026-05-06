"use client";

import { useState, useTransition } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveResultats } from "./actions";
import { SchemaForm, type FormValues } from "@/components/forms/schema-form";
import { getSchemaForUnit } from "@/lib/forms/schemas";
import type { StatutAnalyse } from "@/lib/database.types";

export function ResultatsForm({
  analyseId,
  uniteCode,
  statut,
  resultats,
  conclusion,
  canEdit,
}: {
  analyseId: string;
  uniteCode: string | null;
  statut: StatutAnalyse;
  resultats: Record<string, unknown>;
  conclusion: string | null;
  canEdit: boolean;
}) {
  const schema = getSchemaForUnit(uniteCode);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [values, setValues] = useState<FormValues>(resultats);
  const [conclusionValue, setConclusionValue] = useState(conclusion ?? "");

  const onSave = () =>
    startTransition(async () => {
      setError(null);
      const r = await saveResultats(analyseId, values, conclusionValue || null);
      if (r.error) setError(r.error);
      if (r.success) setSavedAt(new Date());
    });

  const readOnly = !canEdit;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 pb-3 border-b">
        <div>
          <p className="text-xs font-mono text-(--color-muted-foreground) uppercase tracking-wider">
            Modèle : {schema.unitName}
          </p>
          <h2 className="text-base font-semibold mt-0.5">{schema.reportTitle}</h2>
        </div>
        {!canEdit && (
          <span className="text-xs text-(--color-muted-foreground) shrink-0">
            {statut === "brouillon"
              ? "Lecture seule (rôle non autorisé)"
              : "Verrouillé — soumis au workflow"}
          </span>
        )}
      </div>

      <SchemaForm
        schema={schema}
        initial={resultats}
        readOnly={readOnly}
        onChange={setValues}
      />

      {/* Conclusion globale (séparée du resultats JSONB pour réutilisation PDF) */}
      <div className="pt-4 border-t space-y-1.5">
        <Label htmlFor="global-conclusion" className="text-sm font-semibold">
          Conclusion globale
        </Label>
        <Textarea
          id="global-conclusion"
          value={conclusionValue}
          onChange={(e) => setConclusionValue(e.target.value)}
          rows={4}
          disabled={readOnly}
          placeholder="Synthèse, recommandations, observations cliniques…"
        />
      </div>

      {canEdit && (
        <div className="flex items-center justify-between pt-2 sticky bottom-0 bg-(--color-card) border-t -mx-6 px-6 py-3">
          <div className="text-xs">
            {error && (
              <span className="text-(--color-destructive)" role="alert">
                {error}
              </span>
            )}
            {savedAt && !error && (
              <span className="text-(--color-success) inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Enregistré à {savedAt.toLocaleTimeString("fr-FR")}
              </span>
            )}
          </div>
          <Button onClick={onSave} disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Enregistrement…" : "Enregistrer le brouillon"}
          </Button>
        </div>
      )}
    </div>
  );
}
