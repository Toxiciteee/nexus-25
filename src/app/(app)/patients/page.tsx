import { Plus } from "lucide-react";
import { requirePersonnel } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, fullName } from "@/lib/format";

export default async function PatientsPage() {
  const personnel = await requirePersonnel();
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, ini, nom, prenom, date_naissance, created_at, unite:unites(code, nom)")
    .order("created_at", { ascending: false })
    .limit(50);

  type PatientRow = {
    id: string;
    ini: string;
    nom: string;
    prenom: string;
    date_naissance: string | null;
    created_at: string;
    unite: { code: string; nom: string } | null;
  };
  const rows = (patients ?? []) as unknown as PatientRow[];

  const canCreate = personnel.role === "secretaire" || personnel.role === "chef_service";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-(--color-muted-foreground)">
            Liste des derniers patients enregistrés.
          </p>
        </div>
        {canCreate && (
          <LinkButton href="/patients/nouveau">
            <Plus className="h-4 w-4" />
            Nouveau patient
          </LinkButton>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{rows.length} patient(s)</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-(--color-muted-foreground) py-8 text-center">
              Aucun patient enregistré pour l'instant.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>INI</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Né(e) le</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.ini}</TableCell>
                    <TableCell className="font-medium">{fullName(p)}</TableCell>
                    <TableCell className="text-sm text-(--color-muted-foreground)">
                      {formatDate(p.date_naissance)}
                    </TableCell>
                    <TableCell>
                      {p.unite && (
                        <Badge variant="secondary">{p.unite.code}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <LinkButton href={`/patients/${p.id}`} size="sm" variant="ghost">
                        Ouvrir
                      </LinkButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
