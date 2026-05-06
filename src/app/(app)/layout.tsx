import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut, KeyRound } from "lucide-react";
import { requirePersonnel, ROLE_LABELS } from "@/lib/auth/rbac";
import { signOut } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/lib/format";
import { LogoBadge } from "@/components/brand/logo";
import { SidebarNavLink, PageFade } from "./shell-client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const personnel = await requirePersonnel();

  const supabase = await createClient();
  const { data: unite } = personnel.unite_id
    ? await supabase
        .from("unites")
        .select("nom, code")
        .eq("id", personnel.unite_id)
        .maybeSingle()
    : { data: null };

  const isChef = personnel.role === "chef_service";

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/patients", label: "Patients", icon: Users },
  ];
  if (isChef) {
    navItems.push({ href: "/admin", label: "Administration", icon: Settings });
  }

  return (
    <div className="flex min-h-screen w-full bg-(--color-background)">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-(--color-card)/70 backdrop-blur-xs">
        <div className="h-16 flex items-center gap-3 px-5 border-b">
          <LogoBadge size="sm" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Toxicologie</p>
            <p className="text-[11px] text-(--color-muted-foreground)">CHU Constantine</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <SidebarNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon className="h-4 w-4" />}
            />
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100/80 p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-full bg-(--color-primary) text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {personnel.prenom[0]}
                {personnel.nom[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{fullName(personnel)}</p>
                <p className="text-[11px] text-(--color-muted-foreground) truncate">
                  {ROLE_LABELS[personnel.role]}
                  {unite ? ` · ${unite.code}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 mt-1 border-t border-sky-100/60">
              <Link
                href="/account/password"
                className="inline-flex items-center gap-1 text-[11px] text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
              >
                <KeyRound className="h-3 w-3" />
                Mot de passe
              </Link>
              <form action={signOut} className="ml-auto">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-[11px] text-(--color-muted-foreground) hover:text-(--color-destructive) transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-14 border-b flex items-center justify-between px-4 bg-(--color-card)/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <LogoBadge size="sm" />
            <span className="font-semibold text-sm">Toxicologie</span>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-(--color-muted-foreground)">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </header>

        <main className="flex-1 overflow-auto">
          <PageFade>{children}</PageFade>
        </main>
      </div>
    </div>
  );
}
