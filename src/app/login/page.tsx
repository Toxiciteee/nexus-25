import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalides: "Identifiants invalides.",
  missing: "Veuillez renseigner tous les champs.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;
  const message =
    (error && ERROR_MESSAGES[error]) ||
    (reason === "inactive" ? "Compte désactivé. Contactez le Chef de Service." : null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-(--color-secondary) to-(--color-background)">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-(--color-primary) text-(--color-primary-foreground) flex items-center justify-center shadow-lg">
            <FlaskConical className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-center">
            Service de Toxicologie
          </h1>
          <p className="text-sm text-(--color-muted-foreground) text-center">
            CHU Constantine
          </p>
        </div>

        <div className="bg-(--color-card) rounded-xl border shadow-sm p-6">
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
              <Label htmlFor="password">Mot de passe</Label>
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

            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </div>

        <p className="mt-6 text-xs text-center text-(--color-muted-foreground)">
          Accès réservé au personnel autorisé.
        </p>
      </div>
    </div>
  );
}
