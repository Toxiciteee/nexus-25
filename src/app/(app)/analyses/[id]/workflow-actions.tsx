"use client";

import { useState, useTransition } from "react";
import { Send, ShieldCheck, Undo2, Trash2, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  submitToChefUnite,
  notifyChefUnite,
  validateChefService,
  rejectAnalyse,
  deleteAnalyse,
} from "./actions";
import type { StatutAnalyse, RolePersonnel } from "@/lib/database.types";

type ActionFn = () => Promise<{ error?: string; success?: string }>;

type Pending = {
  fn: ActionFn;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  tone: "default" | "danger" | "success";
  icon: React.ReactNode;
  redirectAfter?: string;
} | null;

export function WorkflowActions({
  analyseId,
  statut,
  personnelRole,
  isSameUnite,
}: {
  analyseId: string;
  statut: StatutAnalyse;
  personnelRole: RolePersonnel;
  isSameUnite: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isChef = personnelRole === "chef_service";
  const isSecretaire = personnelRole === "secretaire";
  const sameUniteOrChef = isChef || isSameUnite;
  // La secrétaire est transverse : elle peut transmettre / notifier sur
  // n'importe quelle analyse, indépendamment de l'unité de rattachement.
  const canActAsSecretaire = isChef || isSecretaire;

  const run = () => {
    if (!confirm) return;
    const c = confirm;
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const r = await c.fn();
      if (r.error) {
        setError(r.error);
      } else {
        setSuccess(r.success ?? "Action effectuée.");
        setConfirm(null);
        if (c.redirectAfter) router.push(c.redirectAfter);
      }
    });
  };

  const buttons: React.ReactNode[] = [];

  // Secrétaire / Chef Service en brouillon → soumettre à Chef d'unité.
  // NB: la visibilité de ce bouton est volontairement indépendante de
  // l'état "lecture seule" du formulaire des résultats. Même si la
  // secrétaire ne peut plus modifier le rapport (par ex. champ verrouillé
  // côté UI), elle doit toujours pouvoir transmettre l'analyse au Chef
  // d'unité tant qu'elle est en brouillon dans son unité.
  if (statut === "brouillon" && canActAsSecretaire) {
    buttons.push(
      <Button
        key="submit"
        onClick={() =>
          setConfirm({
            fn: () => submitToChefUnite(analyseId),
            title: "Envoyer au Chef d'unité ?",
            description:
              "Une fois soumis, vous ne pourrez plus modifier ce dossier. Vérifiez que tous les résultats sont saisis.",
            confirmLabel: "Envoyer",
            tone: "default",
            icon: <Send className="h-5 w-5" />,
          })
        }
        disabled={pending}
        className="w-full"
      >
        <Send className="h-4 w-4" />
        Envoyer au Chef d'unité
      </Button>,
    );
  }

  // En attente_unite : la secrétaire conserve le droit d'envoyer un rappel
  // au Chef d'unité (action de notification, indépendante de l'état "lecture
  // seule" du formulaire).
  if (statut === "attente_unite" && canActAsSecretaire) {
    buttons.push(
      <Button
        key="notify"
        onClick={() =>
          setConfirm({
            fn: () => notifyChefUnite(analyseId),
            title: "Notifier le Chef d'unité ?",
            description:
              "Un rappel sera envoyé au(x) Chef(s) d'unité pour leur signaler que cette analyse attend leur validation.",
            confirmLabel: "Envoyer le rappel",
            tone: "default",
            icon: <Bell className="h-5 w-5" />,
          })
        }
        disabled={pending}
        variant="outline"
        className="w-full"
      >
        <Bell className="h-4 w-4" />
        Notifier le Chef d'unité
      </Button>,
    );
  }

  // En attente_unite : la validation passe par <InterpretationPanel> (avec
  // saisie obligatoire de l'interprétation clinique, juste au-dessus de cette
  // colonne). On ne propose donc ici que le renvoi en brouillon.
  if (statut === "attente_unite" && (personnelRole === "chef_unite" || isChef) && sameUniteOrChef) {
    buttons.push(
      <Button
        key="reject"
        onClick={() =>
          setConfirm({
            fn: () => rejectAnalyse(analyseId),
            title: "Renvoyer en brouillon ?",
            description:
              "Le dossier repassera en brouillon et la secrétaire pourra le modifier.",
            confirmLabel: "Renvoyer",
            tone: "danger",
            icon: <Undo2 className="h-5 w-5" />,
          })
        }
        disabled={pending}
        variant="outline"
        className="w-full"
      >
        <Undo2 className="h-4 w-4" />
        Renvoyer en brouillon
      </Button>,
    );
  }

  // Chef Service uniquement en attente_chef → validation finale
  if (statut === "attente_chef" && isChef) {
    buttons.push(
      <Button
        key="validate-chef"
        onClick={() =>
          setConfirm({
            fn: () => validateChefService(analyseId),
            title: "Validation finale et signature ?",
            description: (
              <>
                Cette action signe et verrouille le dossier. Le rapport PDF sera
                disponible pour impression. <strong>Action irréversible</strong>.
              </>
            ),
            confirmLabel: "Signer et valider",
            tone: "success",
            icon: <ShieldCheck className="h-5 w-5" />,
          })
        }
        disabled={pending}
        className="w-full"
      >
        <ShieldCheck className="h-4 w-4" />
        Validation finale & signature
      </Button>,
      <Button
        key="reject-chef"
        onClick={() =>
          setConfirm({
            fn: () => rejectAnalyse(analyseId),
            title: "Renvoyer en brouillon ?",
            description: "Le dossier repassera à la secrétaire pour correction.",
            confirmLabel: "Renvoyer",
            tone: "danger",
            icon: <Undo2 className="h-5 w-5" />,
          })
        }
        disabled={pending}
        variant="outline"
        className="w-full"
      >
        <Undo2 className="h-4 w-4" />
        Renvoyer en brouillon
      </Button>,
    );
  }

  // Chef Service : suppression (toujours dispo)
  if (isChef) {
    buttons.push(
      <Button
        key="delete"
        onClick={() =>
          setConfirm({
            fn: () => deleteAnalyse(analyseId),
            title: "Supprimer ce dossier ?",
            description: (
              <>
                Le dossier d'analyse sera <strong>définitivement supprimé</strong>,
                ainsi que son historique. Cette action est irréversible.
              </>
            ),
            confirmLabel: "Supprimer définitivement",
            tone: "danger",
            icon: <Trash2 className="h-5 w-5" />,
            redirectAfter: "/dashboard",
          })
        }
        disabled={pending}
        variant="ghost"
        className="w-full text-(--color-destructive) hover:bg-(--color-destructive)/10"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer le dossier
      </Button>,
    );
  }

  return (
    <>
      <div className="space-y-2">
        {buttons.length === 0 ? (
          <p className="text-sm text-(--color-muted-foreground)">
            Aucune action disponible pour votre rôle à ce statut.
          </p>
        ) : (
          buttons
        )}
        {error && (
          <p className="text-sm text-(--color-destructive)" role="alert">
            {error}
          </p>
        )}
        {success && <p className="text-sm text-(--color-success)">{success}</p>}
      </div>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={run}
        title={confirm?.title ?? ""}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        loading={pending}
        icon={confirm?.icon}
      />
    </>
  );
}
