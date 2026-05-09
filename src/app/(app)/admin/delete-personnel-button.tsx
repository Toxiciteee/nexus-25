"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deletePersonnel } from "./actions";

export function DeletePersonnelButton({
  personnelId,
  personnelName,
  email,
}: {
  personnelId: string;
  personnelName: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onConfirm = () =>
    start(async () => {
      setError(null);
      const r = await deletePersonnel(personnelId);
      if (r.error) {
        setError(r.error);
      } else {
        setOpen(false);
      }
    });

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-(--color-destructive) hover:bg-(--color-destructive)/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        title={`Supprimer ${personnelName} ?`}
        description={
          <>
            Le compte <strong>{email}</strong> sera{" "}
            <strong>définitivement supprimé</strong> (auth + personnel). L'adresse
            e-mail sera à nouveau libre pour une nouvelle invitation. Action irréversible.
            {error && (
              <p className="mt-3 text-(--color-destructive)" role="alert">
                {error}
              </p>
            )}
          </>
        }
        confirmLabel="Supprimer définitivement"
        tone="danger"
        loading={pending}
        icon={<Trash2 className="h-5 w-5" />}
      />
    </>
  );
}
