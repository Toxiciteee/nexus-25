"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2, ShieldCheck, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitToUnit,
  validateAtUnit,
  validateAtChef,
  rejectAnalyse,
} from "./actions";
import type { StatutAnalyse, RolePersonnel } from "@/lib/database.types";

export function WorkflowActions({
  analyseId,
  statut,
  personnelRole,
  isSameUnite,
}: {
  analyseId: string;
  statut: StatutAnalyse;
  personnelRole: RolePersonnel;
  isSameUnite: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isChef = personnelRole === "chef_service";
  const sameUniteOrChef = isChef || isSameUnite;

  const run = (fn: () => Promise<{ error?: string; success?: string }>) =>
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const r = await fn();
      if (r.error) setError(r.error);
      if (r.success) setSuccess(r.success);
    });

  const buttons: React.ReactNode[] = [];

  if (statut === "brouillon" && (personnelRole === "secretaire" || isChef) && sameUniteOrChef) {
    buttons.push(
      <Button
        key="submit"
        onClick={() => run(() => submitToUnit(analyseId))}
        disabled={pending}
        className="w-full"
      >
        <Send className="h-4 w-4" />
        Soumettre à l'unité
      </Button>,
    );
  }

  if (
    statut === "attente_unite" &&
    (personnelRole === "responsable_unite" || personnelRole === "resident" || isChef) &&
    sameUniteOrChef
  ) {
    if (personnelRole === "responsable_unite" || isChef) {
      buttons.push(
        <Button
          key="validate-unit"
          onClick={() => run(() => validateAtUnit(analyseId))}
          disabled={pending}
          className="w-full"
        >
          <CheckCircle2 className="h-4 w-4" />
          Valider et envoyer au Chef
        </Button>,
      );
    }
    buttons.push(
      <Button
        key="reject"
        onClick={() => run(() => rejectAnalyse(analyseId))}
        disabled={pending}
        variant="outline"
        className="w-full"
      >
        <Undo2 className="h-4 w-4" />
        Renvoyer en brouillon
      </Button>,
    );
  }

  if (statut === "attente_chef" && isChef) {
    buttons.push(
      <Button
        key="validate-chef"
        onClick={() => run(() => validateAtChef(analyseId))}
        disabled={pending}
        className="w-full"
      >
        <ShieldCheck className="h-4 w-4" />
        Validation finale & génération PDF
      </Button>,
      <Button
        key="reject-chef"
        onClick={() => run(() => rejectAnalyse(analyseId))}
        disabled={pending}
        variant="outline"
        className="w-full"
      >
        <Undo2 className="h-4 w-4" />
        Renvoyer en brouillon
      </Button>,
    );
  }

  if (buttons.length === 0) {
    return (
      <p className="text-sm text-(--color-muted-foreground)">
        Aucune action disponible pour votre rôle à ce statut.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {buttons}
      {error && (
        <p className="text-sm text-(--color-destructive)" role="alert">
          {error}
        </p>
      )}
      {success && <p className="text-sm text-(--color-success)">{success}</p>}
    </div>
  );
}
