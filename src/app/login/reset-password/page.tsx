import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoBadge } from "@/components/brand/logo";
import { LoginCard } from "../login-card";
import { ResetPasswordClient } from "./client";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-(--color-primary-50) via-(--color-background) to-(--color-primary-100)/60" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-(--color-primary)/20 blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-(--color-primary-200)/35 blur-3xl -z-10" />

      <div className="w-full max-w-md">
        <LoginCard>
          <div className="flex flex-col items-center mb-6">
            <LogoBadge size="lg" />
          </div>
          <div className="bg-(--color-card)/95 backdrop-blur-sm rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-1">
              Définir un nouveau mot de passe
            </h2>
            <p className="text-sm text-(--color-muted-foreground) mb-6">
              Choisissez un mot de passe d'au moins 8 caractères.
            </p>
            <ResetPasswordClient initialError={error ?? null} />
          </div>
        </LoginCard>
      </div>
    </div>
  );
}

// Composants réutilisés inline pour types
export { Button, Input, Label };
