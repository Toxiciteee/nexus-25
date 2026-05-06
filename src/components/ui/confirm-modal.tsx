"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmTone = "default" | "danger" | "success";

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "default",
  loading = false,
  icon,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const accentBg =
    tone === "danger"
      ? "bg-(--color-destructive)/10 text-(--color-destructive)"
      : tone === "success"
        ? "bg-(--color-success)/10 text-(--color-success)"
        : "bg-(--color-primary)/10 text-(--color-primary)";

  const buttonVariant: "default" | "destructive" =
    tone === "danger" ? "destructive" : "default";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0 z-50 bg-(--color-foreground)/40 backdrop-blur-sm"
          />
          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-md rounded-2xl bg-(--color-card) border border-(--color-border) shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "h-11 w-11 rounded-full flex items-center justify-center shrink-0",
                      accentBg,
                    )}
                  >
                    {icon ?? <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold leading-tight">
                        {title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => !loading && onClose()}
                        className="text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors -mt-1 -mr-1 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {description && (
                      <div className="mt-1.5 text-sm text-(--color-muted-foreground) leading-relaxed">
                        {description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-(--color-muted)/40 border-t border-(--color-border) flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant={buttonVariant}
                  size="sm"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? "Traitement…" : confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
