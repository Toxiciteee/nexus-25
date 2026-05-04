"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createPatient, type CreatePatientState } from "./actions";

type Unite = { id: string; code: string; nom: string };

export function NewPatientForm({
  unites,
  isChef,
  uniteId,
}: {
  unites: Unite[];
  isChef: boolean;
  uniteId: string | null;
}) {
  const [state, action, pending] = useActionState<CreatePatientState, FormData>(
    createPatient,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="ini" label="Numéro INI" required>
          <Input id="ini" name="ini" required placeholder="Ex. 123456" />
        </Field>
        <Field id="sexe" label="Sexe">
          <Select id="sexe" name="sexe" defaultValue="">
            <option value="">—</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </Select>
        </Field>
        <Field id="prenom" label="Prénom" required>
          <Input id="prenom" name="prenom" required />
        </Field>
        <Field id="nom" label="Nom" required>
          <Input id="nom" name="nom" required />
        </Field>
        <Field id="date_naissance" label="Date de naissance">
          <Input id="date_naissance" name="date_naissance" type="date" />
        </Field>
        <Field id="ville_naissance" label="Ville de naissance">
          <Input id="ville_naissance" name="ville_naissance" />
        </Field>
        {isChef ? (
          <Field id="unite_id" label="Unité de rattachement" required>
            <Select id="unite_id" name="unite_id" required defaultValue="">
              <option value="" disabled>
                Choisir une unité…
              </option>
              {unites.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nom}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <input type="hidden" name="unite_id" value={uniteId ?? ""} />
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-(--color-destructive)" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer le patient"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-(--color-destructive)">*</span>}
      </Label>
      {children}
    </div>
  );
}
