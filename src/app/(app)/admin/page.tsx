import { requireChef, ROLE_LABELS } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fullName } from "@/lib/format";
import { InviteForm } from "./invite-form";
import { ToggleActifButton } from "./toggle-actif-button";
import { DeletePersonnelButton } from "./delete-personnel-button";
import { getCurrentPersonnel } from "@/lib/auth/rbac";

export default async function AdminPage() {
  await requireChef();
  const me = await getCurrentPersonnel();
  const supabase = await createClient();

  const [{ data: members }, { data: unites }] = await Promise.all([
    supabase
      .from("personnel")
      .select("id, email, nom, prenom, role, actif, unite:unites(code, nom)")
      .order("nom"),
    supabase.from("unites").select("id, code, nom").order("nom"),
  ]);

  type MemberRow = {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: import("@/lib/database.types").RolePersonnel;
    actif: boolean;
    unite: { code: string; nom: string } | null;
  };
  const rows = (members ?? []) as unknown as MemberRow[];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
        <p className="text-sm text-(--color-muted-foreground)">
          Gestion du personnel et des accès. Page réservée au Chef de Service.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Inviter un membre</CardTitle>
            <CardDescription>
              Un e-mail d'invitation est envoyé. Le membre définit son mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm unites={unites ?? []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Personnel ({rows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-(--color-muted-foreground) py-8 text-center">
                Aucun membre enregistré.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">{fullName(m)}</div>
                        <div className="text-xs text-(--color-muted-foreground)">
                          {m.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {ROLE_LABELS[m.role]}
                      </TableCell>
                      <TableCell>
                        {m.unite ? (
                          <Badge variant="secondary">{m.unite.code}</Badge>
                        ) : (
                          <span className="text-xs text-(--color-muted-foreground)">
                            (transverse)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {m.actif ? (
                          <Badge variant="success">Actif</Badge>
                        ) : (
                          <Badge variant="outline">Désactivé</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-0">
                          <ToggleActifButton id={m.id} actif={m.actif} />
                          {me && me.id !== m.id && m.role !== "chef_service" && (
                            <DeletePersonnelButton
                              personnelId={m.id}
                              personnelName={fullName(m)}
                              email={m.email}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
