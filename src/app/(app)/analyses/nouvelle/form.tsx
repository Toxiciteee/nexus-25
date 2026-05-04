"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createAnalyse, type CreateAnalyseState } from "./actions";
import { fullName } from "@/lib/format";

type Type = { id: string; nom: string };
type PatientLite = {
  id: string;
  ini: string;
  nom: string;
  prenom: string;
  unite?: { code: string } | null;
};

export function NewAnalyseForm({
  types,
  patients,
  preselectedPatient,
}: {
  types: Type[];
  patients: PatientLite[];
  preselectedPatient: PatientLite | null;
}) {
  const [state, action, pending] = useActionState<CreateAnalyseState, FormData>(
    createAnalyse,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="patient_id">Patient *</Label>
        {preselectedPatient ? (
          <>
            <div className="rounded-md border bg-(--color-muted) px-3 py-2 text-sm">
              <span className="font-medium">{fullName(preselectedPatient)}</span>
              <span className="ml-2 font-mono text-xs text-(--color-muted-foreground)">
                INI {preselectedPatient.ini}
              </span>
            </div>
            <input type="hidden" name="patient_id" value={preselectedPatient.id} />
          </>
        ) : (
          <Select id="patient_id" name="patient_id" required defaultValue="">
            <option value="" disabled>
              Choisir un patient…
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {fullName(p)} — INI {p.ini}
                {p.unite ? ` · ${p.unite.code}` : ""}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="type_prelevement_id">Type de prélèvement *</Label>
          <Select id="type_prelevement_id" name="type_prelevement_id" required defaultValue="">
            <option value="" disabled>
              Choisir un type…
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nom}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date_prelevement">Date de prélèvement</Label>
          <Input id="date_prelevement" name="date_prelevement" type="date" />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-(--color-destructive)" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer l'analyse"}
        </Button>
      </div>
    </form>
  );
}
