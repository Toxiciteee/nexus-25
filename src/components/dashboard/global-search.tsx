"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { fullName } from "@/lib/format";

type Hit = {
  id: string;
  ini: string;
  nom: string;
  prenom: string;
};

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const term = q.trim();
      const { data } = await supabase
        .from("patients")
        .select("id, ini, nom, prenom")
        .or(`ini.ilike.%${term}%,nom.ilike.%${term}%,prenom.ilike.%${term}%`)
        .limit(10)
        .abortSignal(ctrl.signal);
      setHits((data ?? []) as Hit[]);
      setLoading(false);
      setOpen(true);
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-muted-foreground)" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.length >= 2 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) {
              router.push(`/patients/${hits[0].id}`);
            }
          }}
          placeholder="Numéro INI, nom ou prénom…"
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-(--color-muted-foreground)" />
        )}
      </div>

      {open && hits.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-(--color-card) shadow-md max-h-80 overflow-auto">
          {hits.map((p) => (
            <Link
              key={p.id}
              href={`/patients/${p.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-(--color-accent) transition-colors"
            >
              <span className="text-sm font-medium">{fullName(p)}</span>
              <span className="text-xs text-(--color-muted-foreground) font-mono">
                INI {p.ini}
              </span>
            </Link>
          ))}
        </div>
      )}

      {open && !loading && q.trim().length >= 2 && hits.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-(--color-card) shadow-md p-4 text-sm text-(--color-muted-foreground)">
          Aucun patient trouvé pour « {q} ».
        </div>
      )}
    </div>
  );
}
