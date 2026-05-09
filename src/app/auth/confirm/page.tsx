import { AlertTriangle, ShieldCheck } from "lucide-react";
import { LogoBadge } from "@/components/brand/logo";
import { LoginCard } from "@/app/login/login-card";
import { Button } from "@/components/ui/button";
import { confirmOtp } from "./actions";

/**
 * Page d'atterrissage du lien magique (invitation, reset password, etc.).
 *
 * Pourquoi cette page existe — anti-scanner :
 *   Beaucoup de fournisseurs de mail (Outlook/Defender, Proofpoint, certains
 *   antivirus) PRÉ-CLIQUENT les liens dans les e-mails pour les analyser.
 *   Si l'OTP est consommé sur GET, la pré-visite consomme le jeton et le
 *   destinataire reçoit "otp_expired" en cliquant pour de bon.
 *
 *   Cette page ne consomme RIEN sur GET — elle se contente d'afficher un
 *   bouton "Confirmer mon compte". L'OTP n'est validé qu'au POST déclenché
 *   par l'humain. Les scanners voient une page inerte.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
    status?: string;
    message?: string;
  }>;
}) {
  const sp = await searchParams;
  const tokenHash = sp.token_hash ?? "";
  const type = sp.type ?? "";
  const next = sp.next ?? "/dashboard";
  const status = sp.status;

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
              Confirmation
            </h1>
            <p className="text-sm text-(--color-muted-foreground) text-center">
              Service de Toxicologie — CHU Constantine
            </p>
          </div>

          <div className="bg-(--color-card)/95 backdrop-blur-sm rounded-xl border shadow-sm p-6">
            {status === "error" || status === "invalid" || !tokenHash || !type ? (
              <div className="py-2 flex flex-col items-center gap-3 text-center">
                <div className="h-11 w-11 rounded-full bg-(--color-destructive)/10 text-(--color-destructive) flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">Lien invalide ou expiré</p>
                <p className="text-sm text-(--color-muted-foreground)">
                  {sp.message ??
                    "Le lien de confirmation est invalide. Demandez à votre Chef de Service de vous renvoyer une invitation."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3 mb-5 text-center">
                  <div className="h-11 w-11 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    Confirmer mon compte
                  </h2>
                  <p className="text-sm text-(--color-muted-foreground)">
                    Cliquez sur le bouton ci-dessous pour valider votre lien et
                    accéder à la création de votre mot de passe.
                  </p>
                </div>

                <form action={confirmOtp} className="space-y-3">
                  <input type="hidden" name="token_hash" value={tokenHash} />
                  <input type="hidden" name="type" value={type} />
                  <input type="hidden" name="next" value={next} />
                  <Button type="submit" className="w-full">
                    Confirmer mon compte
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-xs text-center text-(--color-muted-foreground)">
            Vous accédez à un espace réservé au personnel autorisé.
          </p>
        </LoginCard>
      </div>
    </div>
  );
}
