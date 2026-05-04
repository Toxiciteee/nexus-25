import { redirect } from "next/navigation";
import { requirePersonnel } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewAnalyseForm } from "./form";

export default async function NewAnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const personnel = await requirePersonnel();
  if (personnel.role !== "secretaire" && personnel.role !== "chef_service") {
    redirect("/dashboard?error=forbidden");
  }

  const { patient: patientId } = await searchParams;
  const supabase = await createClient();

  const [{ data: types }, { data: patient }] = await Promise.all([
    supabase.from("types_prelevement").select("id, nom").eq("actif", true).order("nom"),
    patientId
      ? supabase
          .from("patients")
          .select("id, ini, nom, prenom, unite_id, unite:unites(code, nom)")
          .eq("id", patientId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // Liste des patients de mon unité (pour secrétaire) ou tous (pour chef)
  const patientsQuery = supabase
    .from("patients")
    .select("id, ini, nom, prenom, unite:unites(code)")
    .order("nom")
    .limit(200);
  if (personnel.role === "secretaire" && personnel.unite_id) {
    patientsQuery.eq("unite_id", personnel.unite_id);
  }
  const { data: patients } = await patientsQuery;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle analyse</CardTitle>
          <CardDescription>
            Créez un dossier d'analyse en brouillon. Vous pourrez ensuite saisir les résultats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewAnalyseForm
            types={types ?? []}
            patients={(patients ?? []) as unknown as PatientLite[]}
            preselectedPatient={patient as unknown as PatientLite | null}
          />
        </CardContent>
      </Card>
    </div>
  );
}

type PatientLite = {
  id: string;
  ini: string;
  nom: string;
  prenom: string;
  unite?: { code: string } | null;
};
