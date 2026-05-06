import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoBadge } from "@/components/brand/logo";
import { LoginCard } from "./login-card";
import { signIn } from "./actions";

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
  const message =
    (error && ERROR_MESSAGES[error]) ||
    (reason === "inactive" ? "Compte désactivé. Contactez le Chef de Service." : null);
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

              {message && (
                <p className="text-sm text-(--color-destructive)" role="alert">
                  {message}
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

          <p className="mt-6 text-xs text-center text-(--color-muted-foreground)">
            Accès réservé au personnel autorisé.
          </p>
        </LoginCard>
      </div>
    </div>
  );
}
