import { LogoBadge } from "@/components/brand/logo";
import { LoginCard } from "@/app/login/login-card";
import { AcceptInviteClient } from "./client";

/**
 * Page d'atterrissage du lien d'invitation envoyé aux nouveaux membres.
 * Supabase redirige ici avec une session dans l'URL (fragment) ; on demande à
 * la personne de définir son mot de passe et on l'amène ensuite au dashboard.
 */
export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-(--color-primary-50) via-(--color-background) to-(--color-primary-100)/60" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-(--color-primary)/20 blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-(--color-primary-200)/35 blur-3xl -z-10" />

      <div className="w-full max-w-md">
        <LoginCard>
          <div className="flex flex-col items-center mb-6">
            <LogoBadge size="lg" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-center">
              Bienvenue
            </h1>
            <p className="text-sm text-(--color-muted-foreground) text-center">
              Service de Toxicologie — CHU Constantine
            </p>
          </div>

          <div className="bg-(--color-card)/95 backdrop-blur-sm rounded-xl border shadow-sm p-6">
            <AcceptInviteClient />
          </div>

          <p className="mt-6 text-xs text-center text-(--color-muted-foreground)">
            Vous accédez à un espace réservé au personnel autorisé.
          </p>
        </LoginCard>
      </div>
    </div>
  );
}
