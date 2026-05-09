"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/database.types";

export function NotificationBell({ personnelId }: { personnelId: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.lue_at).length;

  // Charge initiale + souscription temps réel
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("destinataire", personnelId)
        .order("created_at", { ascending: false })
        .limit(30);
      if (!cancelled) setItems((data ?? []) as Notification[]);
    };
    void load();

    // Souscription Realtime — nouveaux INSERT pour ce destinataire.
    // Nom de channel unique par mount pour éviter la réutilisation côté SDK
    // (problématique en React StrictMode où useEffect monte deux fois).
    const channelName = `notifications_${personnelId}_${(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2))}`;
    const channel = supabase.channel(channelName);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `destinataire=eq.${personnelId}`,
        },
        (payload) => {
          if (cancelled) return;
          setItems((prev) => [payload.new as Notification, ...prev].slice(0, 30));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [personnelId]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = async () => {
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .from("notifications")
      .update({ lue_at: now })
      .eq("destinataire", personnelId)
      .is("lue_at", null);
    setItems((prev) =>
      prev.map((n) => (n.lue_at ? n : { ...n, lue_at: now })),
    );
  };

  const markOneRead = async (id: string) => {
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .from("notifications")
      .update({ lue_at: now })
      .eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, lue_at: now } : n)));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center text-(--color-muted-foreground) hover:bg-(--color-accent) hover:text-(--color-foreground) transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-(--color-destructive) text-(--color-destructive-foreground) text-[9px] font-semibold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 lg:w-96 rounded-xl bg-(--color-card) border shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b flex items-center justify-between">
              <p className="text-sm font-semibold">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-(--color-primary) hover:underline inline-flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-(--color-muted-foreground)">
                  Aucune notification.
                </div>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li key={n.id}>
                      <NotificationItem
                        notif={n}
                        onClick={() => {
                          if (!n.lue_at) void markOneRead(n.id);
                          setOpen(false);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notif,
  onClick,
}: {
  notif: Notification;
  onClick: () => void;
}) {
  const unread = !notif.lue_at;
  const href = notif.analyse_id ? `/analyses/${notif.analyse_id}` : "#";

  const tone =
    notif.type === "analyse_validee"
      ? "bg-(--color-success)/10 text-(--color-success)"
      : notif.type === "analyse_rejetee"
        ? "bg-(--color-destructive)/10 text-(--color-destructive)"
        : "bg-(--color-primary)/10 text-(--color-primary)";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-(--color-muted)/50",
        unread && "bg-(--color-primary)/5",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-1 h-2 w-2 rounded-full shrink-0", tone)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">{notif.titre}</p>
          {notif.message && (
            <p className="text-xs text-(--color-muted-foreground) mt-0.5 leading-relaxed">
              {notif.message}
            </p>
          )}
          <p className="text-[10px] text-(--color-muted-foreground)/70 mt-1">
            {formatDateTime(notif.created_at)}
          </p>
        </div>
        {unread && (
          <span className="h-1.5 w-1.5 rounded-full bg-(--color-primary) shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
}
