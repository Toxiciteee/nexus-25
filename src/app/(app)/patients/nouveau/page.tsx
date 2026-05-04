import { redirect } from "next/navigation";
import { requirePersonnel } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewPatientForm } from "./form";

export default async function NewPatientPage() {
  const personnel = await requirePersonnel();
  if (personnel.role !== "secretaire" && personnel.role !== "chef_service") {
    redirect("/dashboard?error=forbidden");
  }

  const supabase = await createClient();
  const { data: unites } = await supabase.from("unites").select("id, code, nom").order("nom");

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau patient</CardTitle>
          <CardDescription>
            Renseignez les informations d'identité. L'horodatage est automatique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewPatientForm
            unites={unites ?? []}
            isChef={personnel.role === "chef_service"}
            uniteId={personnel.unite_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
