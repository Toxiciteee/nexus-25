"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Send, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  saveInterpretation,
  validateChefUniteWithInterpretation,
} from "./actions";

/**
 * Panneau dédié au Chef d'unité : saisie de l'interprétation clinique +
 * un seul bouton de validation qui transmet au Chef de Service.
 *
 * S'affiche UNIQUEMENT si :
 *   - statut === "attente_unite"
 *   - personnel.role ∈ {chef_unite, chef_service}
 *   - même unité que l'analyse (sauf chef_service)
 */
export function InterpretationPanel({
  analyseId,
  initialValue,
}: {
  analyseId: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dirty = value.trim() !== initialValue.trim();

  const onSaveDraft = () =>
    start(async () => {
      setError(null);
      const r = await saveInterpretation(analyseId, value);
      if (r.error) setError(r.error);
      else setSavedAt(new Date());
    });

  const onValidate = () =>
    start(async () => {
      setError(null);
      const r = await validateChefUniteWithInterpretation(analyseId, value);
      if (r.error) {
        setError(r.error);
        setConfirmOpen(false);
      }
      // Sur succès : redirect/refresh viendra par revalidatePath du serveur
    });

  return (
    <div className="space-y-4 rounded-xl border-2 border-(--color-primary)/30 bg-(--color-primary-50)/40 p-5">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-lg bg-(--color-primary) text-(--color-primary-foreground) flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-(--color-foreground)">
            Interprétation clinique
          </h3>
          <p className="text-xs text-(--color-muted-foreground)">
            Rédigez votre lecture des résultats avant de transmettre au Chef de Service.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="interpretation" className="sr-only">
          Interprétation clinique
        </Label>
        <Textarea
          id="interpretation"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSavedAt(null);
          }}
          rows={8}
          placeholder="Synthèse clinique : pertinence des résultats, recommandations diagnostiques, observations contextuelles, mise en perspective avec le contexte du patient…"
          className="bg-(--color-card) min-h-[180px] leading-relaxed"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-(--color-muted-foreground)">
            {value.trim().length} caractère{value.trim().length > 1 ? "s" : ""}
          </span>
          {savedAt && (
            <span className="text-(--color-success) inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Brouillon enregistré à {savedAt.toLocaleTimeString("fr-FR")}
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-(--color-destructive)" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-(--color-primary)/15">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={pending || !dirty}
          className="sm:flex-1"
        >
          <Save className="h-4 w-4" />
          Enregistrer le brouillon
        </Button>
        <Button
          onClick={() => {
            if (value.trim().length < 5) {
              setError(
                "L'interprétation clinique est obligatoire avant validation (5 caractères minimum).",
              );
              return;
            }
            setConfirmOpen(true);
          }}
          disabled={pending}
          className="sm:flex-[2]"
        >
          <Send className="h-4 w-4" />
          Valider et transmettre au Chef de Service
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onValidate}
        title="Valider et transmettre ?"
        description={
          <>
            Vous certifiez avoir <strong>vérifié les résultats</strong> et
            <strong> rédigé votre interprétation clinique</strong>. Le dossier
            sera transmis à <strong>Mme Benboudiaf Sabah</strong> pour
            validation finale et signature.
          </>
        }
        confirmLabel="Valider et transmettre"
        tone="success"
        loading={pending}
        icon={<Send className="h-5 w-5" />}
      />
    </div>
  );
}
