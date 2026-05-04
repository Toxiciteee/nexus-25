"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setActif } from "./actions";

export function ToggleActifButton({ id, actif }: { id: string; actif: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => start(() => setActif(id, !actif))}
    >
      {actif ? "Désactiver" : "Réactiver"}
    </Button>
  );
}
