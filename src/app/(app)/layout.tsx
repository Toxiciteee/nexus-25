import Link from "next/link";
import { FlaskConical, LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { requirePersonnel, ROLE_LABELS } from "@/lib/auth/rbac";
import { signOut } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/lib/format";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const personnel = await requirePersonnel();

  const supabase = await createClient();
  const { data: unite } = personnel.unite_id
    ? await supabase.from("unites").select("nom, code").eq("id", personnel.unite_id).maybeSingle()
    : { data: null };

  const isChef = personnel.role === "chef_service";

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-(--color-card)">
        <div className="h-16 flex items-center gap-3 px-6 border-b">
          <div className="h-9 w-9 rounded-lg bg-(--color-primary) text-(--color-primary-foreground) flex items-center justify-center">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Toxicologie</p>
            <p className="text-[11px] text-(--color-muted-foreground)">CHU Constantine</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
            Tableau de bord
          </NavLink>
          <NavLink href="/patients" icon={<Users className="h-4 w-4" />}>
            Patients
          </NavLink>
          {isChef && (
            <NavLink href="/admin" icon={<Settings className="h-4 w-4" />}>
              Administration
            </NavLink>
          )}
        </nav>

        <div className="p-3 border-t">
          <div className="rounded-lg bg-(--color-muted) p-3">
            <p className="text-sm font-medium truncate">{fullName(personnel)}</p>
            <p className="text-xs text-(--color-muted-foreground)">
              {ROLE_LABELS[personnel.role]}
              {unite ? ` · ${unite.code}` : ""}
            </p>
            <form action={signOut} className="mt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-14 border-b flex items-center justify-between px-4 bg-(--color-card)">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-(--color-primary) text-(--color-primary-foreground) flex items-center justify-center">
              <FlaskConical className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Toxicologie</span>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-(--color-muted-foreground)">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-(--color-foreground) hover:bg-(--color-accent) transition-colors"
    >
      <span className="text-(--color-muted-foreground)">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
