"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [pending, start] = useTransition();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (pwd.length < 8) {
      setError("Au moins 8 caractères requis.");
      return;
    }
    if (pwd !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    start(async () => {
      const supabase = createClient();
      const { error: e1 } = await supabase.auth.updateUser({ password: pwd });
      if (e1) {
        setError(e1.message);
        return;
      }
      setDone(true);
      setPwd("");
      setConfirm("");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirmation</Label>
        <Input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-(--color-destructive)" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="text-sm text-(--color-success) flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" /> Mot de passe mis à jour.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Mise à jour…" : "Mettre à jour"}
      </Button>
    </form>
  );
}
