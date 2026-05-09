"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "ready" | "error" | "success";

export function AcceptInviteClient() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<{
    email: string;
    prenom?: string;
    nom?: string;
    role?: string;
  } | null>(null);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();

  // 1. Détection de la session : on combine getSession() (au cas où elle
  //    est déjà installée) + onAuthStateChange (pour attraper l'événement
  //    `INITIAL_SESSION` qui se déclenche après le parsing du fragment d'URL).
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let resolved = false;

    const setReady = (session: import("@supabase/supabase-js").Session) => {
      if (cancelled || resolved) return;
      resolved = true;
      const u = session.user;
      setUser({
        email: u.email ?? "",
        prenom: (u.user_metadata?.prenom as string | undefined) ?? undefined,
        nom: (u.user_metadata?.nom as string | undefined) ?? undefined,
        role: (u.user_metadata?.role as string | undefined) ?? undefined,
      });
      setStatus("ready");
    };

    const setError = (msg: string) => {
      if (cancelled || resolved) return;
      resolved = true;
      setStatus("error");
      setErrorMsg(msg);
    };

    // Essai immédiat
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(data.session);
    });

    // Écouteur pour les événements suivants (notamment quand le SDK
    // termine de consommer le fragment `#access_token=…`).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (session) {
        setReady(session);
      } else if (event === "INITIAL_SESSION") {
        // Première résolution sans session → lien expiré ou invalide
        setError(
          "Lien d'invitation invalide ou expiré. Demandez à votre Chef de Service de vous renvoyer une invitation.",
        );
      }
    });

    // Garde-fou : si rien n'arrive après 6 s, on bascule en erreur.
    const timeout = setTimeout(() => {
      setError(
        "Lien d'invitation introuvable. Vérifiez que vous avez bien cliqué sur le lien depuis l'e-mail le plus récent.",
      );
    }, 6000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (pwd.length < 8) {
      setErrorMsg("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (pwd !== confirm) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 900);
    });
  };

  if (status === "loading") {
    return (
      <div className="py-8 flex flex-col items-center gap-3 text-(--color-muted-foreground)">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Vérification de l'invitation…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-6 flex flex-col items-center gap-3 text-center">
        <div className="h-11 w-11 rounded-full bg-(--color-destructive)/10 text-(--color-destructive) flex items-center justify-center">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">Lien invalide</p>
        <p className="text-sm text-(--color-muted-foreground)">{errorMsg}</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="py-6 flex flex-col items-center gap-3 text-center">
        <div className="h-11 w-11 rounded-full bg-(--color-success)/10 text-(--color-success) flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-(--color-success)">
          Compte activé ✓
        </p>
        <p className="text-sm text-(--color-muted-foreground)">
          Redirection vers votre espace…
        </p>
      </div>
    );
  }

  // status === "ready"
  return (
    <>
      <h2 className="text-lg font-semibold">
        {user?.prenom ? `Bonjour ${user.prenom},` : "Activez votre compte"}
      </h2>
      <p className="text-sm text-(--color-muted-foreground) mt-1 mb-5">
        Pour finaliser votre accès, choisissez un mot de passe d'au moins
        8 caractères. Il vous servira à vous connecter à
        l'application&nbsp;{user?.email ? <>avec l'adresse <strong>{user.email}</strong></> : null}.
      </p>

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
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <Input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-(--color-destructive)" role="alert">
            {errorMsg}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Activation…" : "Activer mon compte"}
        </Button>
      </form>
    </>
  );
}
