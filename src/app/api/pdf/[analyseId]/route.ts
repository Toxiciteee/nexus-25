import { NextResponse } from "next/server";
import { requirePersonnel } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS, formatDate, formatDateTime, fullName } from "@/lib/format";

/**
 * Rapport imprimable v1 — page HTML auto-paginée et auto-imprimée.
 * Le PDF "définitif" (gabarit officiel CHU + signatures) sera implémenté
 * avec @react-pdf/renderer quand l'utilisatrice fournira les modèles de rapport.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ analyseId: string }> },
) {
  await requirePersonnel();
  const { analyseId } = await params;
  const supabase = await createClient();

  const { data: a } = await supabase
    .from("analyses")
    .select(
      `
      *,
      patient:patients(ini, nom, prenom, date_naissance, sexe, ville_naissance),
      type:types_prelevement(nom),
      unite:unites(code, nom),
      cree_par:personnel!analyses_created_by_fkey(nom, prenom),
      valide_unite:personnel!analyses_valide_unite_par_fkey(nom, prenom),
      valide_chef:personnel!analyses_valide_chef_par_fkey(nom, prenom)
      `,
    )
    .eq("id", analyseId)
    .maybeSingle();

  if (!a) return new NextResponse("Analyse introuvable", { status: 404 });
  if (a.statut !== "valide") {
    return new NextResponse(
      "Le rapport n'est disponible qu'une fois l'analyse validée par le Chef de Service.",
      { status: 403 },
    );
  }

  const resultats = (a.resultats ?? {}) as Record<string, unknown>;
  const resultRows = Object.entries(resultats);

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Rapport d'analyse — ${a.numero ?? a.id.slice(0, 8)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, sans-serif; color: #111; margin: 32px; }
  header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; }
  header h1 { margin: 0; font-size: 18px; color: #1d4ed8; }
  header p { margin: 2px 0; color: #555; font-size: 12px; }
  .meta { font-size: 12px; text-align: right; color: #555; }
  h2 { font-size: 14px; color: #1d4ed8; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
  th { background: #f3f6fb; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 12px; }
  .grid2 div span { color: #666; display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .signatures { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .signature { padding-top: 8px; border-top: 1px solid #999; font-size: 11px; }
  footer { margin-top: 48px; font-size: 10px; color: #999; text-align: center; }
  .pos { color: #b91c1c; font-weight: 600; }
  .neg { color: #15803d; }
  @media print { body { margin: 16mm; } button { display: none; } }
</style>
</head>
<body>
<button onclick="window.print()" style="position:fixed;top:16px;right:16px;padding:8px 12px;background:#1d4ed8;color:#fff;border:0;border-radius:6px;cursor:pointer;">Imprimer</button>

<header>
  <div>
    <h1>Service de Toxicologie</h1>
    <p>CHU Constantine</p>
    <p>Unité : ${a.unite?.nom ?? "—"} (${a.unite?.code ?? ""})</p>
  </div>
  <div class="meta">
    <p><strong>Rapport n° ${a.numero ?? a.id.slice(0, 8)}</strong></p>
    <p>Édité le ${formatDateTime(new Date().toISOString())}</p>
    <p>Statut : ${STATUT_LABELS[a.statut as keyof typeof STATUT_LABELS]}</p>
  </div>
</header>

<h2>Patient</h2>
<div class="grid2">
  <div><span>Nom complet</span>${a.patient ? fullName(a.patient) : "—"}</div>
  <div><span>Numéro INI</span>${a.patient?.ini ?? "—"}</div>
  <div><span>Date de naissance</span>${formatDate(a.patient?.date_naissance)}</div>
  <div><span>Sexe</span>${a.patient?.sexe ?? "—"}</div>
  <div><span>Ville de naissance</span>${a.patient?.ville_naissance ?? "—"}</div>
  <div><span>Type de prélèvement</span>${a.type?.nom ?? "—"}</div>
  <div><span>Date de prélèvement</span>${formatDate(a.date_prelevement)}</div>
</div>

<h2>Résultats</h2>
${
  resultRows.length === 0
    ? "<p style='font-size:12px;color:#666'>Aucun résultat saisi.</p>"
    : `<table>
        <thead><tr><th>Substance / paramètre</th><th>Résultat</th></tr></thead>
        <tbody>
          ${resultRows
            .map(
              ([k, v]) =>
                `<tr><td style="text-transform:capitalize">${k.replace(/_/g, " ")}</td><td class="${v ? "pos" : "neg"}">${v ? "Positif" : "Négatif"}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>`
}

${
  a.conclusion
    ? `<h2>Conclusion</h2><div style="font-size:12px;white-space:pre-wrap;border:1px solid #eee;background:#fafbfc;padding:10px;border-radius:6px">${escapeHtml(a.conclusion)}</div>`
    : ""
}

<div class="signatures">
  <div class="signature">
    <strong>Validation Unité</strong><br/>
    ${a.valide_unite ? fullName(a.valide_unite) : "—"}<br/>
    <span style="color:#666">${formatDateTime(a.valide_unite_at)}</span>
  </div>
  <div class="signature">
    <strong>Chef de Service</strong><br/>
    ${a.valide_chef ? fullName(a.valide_chef) : "—"}<br/>
    <span style="color:#666">${formatDateTime(a.valide_chef_at)}</span>
  </div>
</div>

<footer>Document généré automatiquement par l'application de gestion du Service de Toxicologie — CHU Constantine.</footer>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
