"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteMember, type InviteState } from "./actions";
import { ROLE_OPTIONS } from "./constants";
import type { RolePersonnel } from "@/lib/database.types";

type Unite = { id: string; code: string; nom: string };

export function InviteForm({ unites }: { unites: Unite[] }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(
    inviteMember,
    undefined,
  );
  const [role, setRole] = useState<RolePersonnel>("secretaire");

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail *</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input id="prenom" name="prenom" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nom">Nom *</Label>
          <Input id="nom" name="nom" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Rôle *</Label>
        <Select
          id="role"
          name="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value as RolePersonnel)}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      {role !== "chef_service" && (
        <div className="space-y-1.5">
          <Label htmlFor="unite_id">Unité *</Label>
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
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-(--color-destructive)" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-(--color-success)">{state.success}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Envoi…" : "Envoyer l'invitation"}
      </Button>
    </form>
  );
}
