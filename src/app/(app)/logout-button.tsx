"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  children,
  iconOnly = false,
}: {
  className?: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          className,
        )}
      >
        <LogOut className={iconOnly ? "h-4 w-4" : "h-3 w-3"} />
        {children}
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          start(async () => {
            await signOut();
          })
        }
        title="Se déconnecter ?"
        description="Vous serez redirigé vers la page de connexion. Tout travail non enregistré sera perdu."
        confirmLabel="Se déconnecter"
        cancelLabel="Rester connecté"
        tone="default"
        loading={pending}
        icon={<LogOut className="h-5 w-5" />}
      />
    </>
  );
}
