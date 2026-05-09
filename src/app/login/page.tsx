import Link from "next/link";
import { Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoBadge } from "@/components/brand/logo";
import { LoginCard } from "./login-card";
import { signIn, signOut } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalides: "Identifiants invalides.",
  missing: "Veuillez renseigner tous les champs.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string; reset?: string }>;
}) {
  const { error, reason, reset } = await searchParams;
  const isInactive = reason === "inactive";
  const errorMessage = error ? ERROR_MESSAGES[error] : null;
  const success = reset === "ok" ? "Mot de passe mis à jour. Connectez-vous." : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-(--color-primary-50) via-(--color-background) to-(--color-primary-100)/60" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-(--color-primary)/20 blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-(--color-primary-200)/35 blur-3xl -z-10" />

      <div className="w-full max-w-md">
        <LoginCard>
          <div className="flex flex-col items-center mb-8">
            <LogoBadge size="lg" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-center">
              Service de Toxicologie
            </h1>
            <p className="text-sm text-(--color-muted-foreground) text-center">
              CHU Constantine
            </p>
          </div>

          {/* Compte désactivé : on bloque le formulaire et on propose
              uniquement la déconnexion (pour libérer la session avant
              de se reconnecter avec un autre compte). */}
          {isInactive ? (
            <div className="bg-(--color-card)/95 backdrop-blur-sm rounded-xl border shadow-sm p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-(--color-destructive)/10 text-(--color-destructive) flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    Compte désactivé
                  </h2>
                  <p className="text-sm text-(--color-muted-foreground) mt-1 leading-relaxed">
                    Votre accès a été suspendu. Veuillez{" "}
                    <strong>contacter l'administration</strong> du Service de
                    Toxicologie (Chef de Service) pour réactiver votre compte.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-(--color-muted)/50 border p-3 text-xs text-(--color-muted-foreground) leading-relaxed flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-(--color-warning-foreground)/80 mt-0.5 shrink-0" />
                <span>
                  Pour vous connecter avec un autre compte, déconnectez-vous d'abord
                  ci-dessous afin de libérer la session en cours.
                </span>
              </div>

              <form action={signOut}>
                <Button type="submit" variant="default" className="w-full">
                  Se déconnecter
                </Button>
              </form>

              <Link
                href="/"
                className="block text-center text-xs text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <div className="bg-(--color-card)/95 backdrop-blur-sm rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-1">Connexion</h2>
              <p className="text-sm text-(--color-muted-foreground) mb-6">
                Accédez à votre espace de travail.
              </p>

              <form action={signIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="prenom.nom@chu-constantine.dz"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      href="/login/forgot-password"
                      className="text-xs text-(--color-primary) hover:underline"
                    >
                      Mot de passe oublié&nbsp;?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-(--color-destructive)" role="alert">
                    {errorMessage}
                  </p>
                )}
                {success && (
                  <p className="text-sm text-(--color-success)">{success}</p>
                )}

                <Button type="submit" className="w-full">
                  Se connecter
                </Button>
              </form>
            </div>
          )}

          <p className="mt-6 text-xs text-center text-(--color-muted-foreground)">
            Accès réservé au personnel autorisé.
          </p>
        </LoginCard>
      </div>
    </div>
  );
}
