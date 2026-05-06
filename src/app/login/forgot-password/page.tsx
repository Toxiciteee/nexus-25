import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoBadge } from "@/components/brand/logo";
import { LoginCard } from "../login-card";
import { sendResetEmail } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl -z-10" />

      <div className="w-full max-w-md">
        <LoginCard>
          <div className="flex flex-col items-center mb-6">
            <LogoBadge size="lg" />
          </div>

          <div className="bg-(--color-card)/95 backdrop-blur-sm rounded-xl border shadow-sm p-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-(--color-muted-foreground) hover:text-(--color-foreground) mb-3"
            >
              <ArrowLeft className="h-3 w-3" /> Retour à la connexion
            </Link>

            <h2 className="text-lg font-semibold mb-1">Mot de passe oublié</h2>
            <p className="text-sm text-(--color-muted-foreground) mb-6">
              Renseignez votre adresse e-mail. Vous recevrez un lien de réinitialisation.
            </p>

            {sent ? (
              <div className="rounded-md border border-(--color-success)/30 bg-(--color-success)/10 p-4 text-sm">
                <p className="font-medium text-(--color-success)">E-mail envoyé ✓</p>
                <p className="text-(--color-muted-foreground) mt-1">
                  Si cette adresse est associée à un compte, vous recevrez le lien
                  dans quelques instants. Vérifiez aussi vos spams.
                </p>
              </div>
            ) : (
              <form action={sendResetEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <p className="text-sm text-(--color-destructive)" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full">
                  Envoyer le lien
                </Button>
              </form>
            )}
          </div>
        </LoginCard>
      </div>
    </div>
  );
}
