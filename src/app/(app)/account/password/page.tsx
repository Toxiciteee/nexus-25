import { requirePersonnel } from "@/lib/auth/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChangePasswordForm } from "./form";

export default async function ChangePasswordPage() {
  await requirePersonnel();
  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Changer mon mot de passe</CardTitle>
          <CardDescription>
            Choisissez un mot de passe d'au moins 8 caractères. Vous resterez connecté.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
