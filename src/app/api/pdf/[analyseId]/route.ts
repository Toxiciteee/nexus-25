import { NextResponse } from "next/server";
import { requirePersonnel } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import {
  STATUT_LABELS,
  formatDate,
  formatDateTime,
  fullName,
} from "@/lib/format";
import {
  getSchemaForUnit,
  type FormSchema,
  type Field,
} from "@/lib/forms/schemas";

/**
 * Rapport imprimable v2 — basé sur le schéma de l'unité.
 * Page HTML auto-imprimable conforme aux modèles Word fournis (Médico-légale,
 * Pharmacodépendance). Pour les autres unités : rendu générique.
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

  const schema = getSchemaForUnit(a.unite?.code ?? null);
  const resultats = (a.resultats ?? {}) as Record<string, unknown>;

  const html = renderReport({
    schema,
    resultats,
    analyse: a,
  });

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

type AnalyseFull = {
  id: string;
  numero: string | null;
  statut: string;
  date_prelevement: string | null;
  conclusion: string | null;
  valide_unite_at: string | null;
  valide_chef_at: string | null;
  patient: {
    ini: string;
    nom: string;
    prenom: string;
    date_naissance: string | null;
    sexe: string | null;
    ville_naissance: string | null;
  } | null;
  type: { nom: string } | null;
  unite: { code: string; nom: string } | null;
  cree_par: { nom: string; prenom: string } | null;
  valide_unite: { nom: string; prenom: string } | null;
  valide_chef: { nom: string; prenom: string } | null;
};

function renderReport({
  schema,
  resultats,
  analyse,
}: {
  schema: FormSchema;
  resultats: Record<string, unknown>;
  analyse: AnalyseFull;
}): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${schema.reportTitle} — ${analyse.numero ?? analyse.id.slice(0, 8)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, system-ui, sans-serif; color: #111827; margin: 28px; font-size: 12px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0369a1; padding-bottom: 14px; margin-bottom: 22px; }
  .brand { display: flex; gap: 14px; align-items: center; }
  .brand-logo { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #0369a1, #38bdf8); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
  .brand h1 { margin: 0; font-size: 16px; color: #0c4a6e; letter-spacing: 0.3px; }
  .brand p { margin: 2px 0; color: #475569; font-size: 11px; }
  .meta { font-size: 11px; text-align: right; color: #475569; line-height: 1.5; }
  .meta strong { color: #0c4a6e; }
  h2.report { text-align: center; font-size: 14px; color: #0c4a6e; letter-spacing: 1px; margin: 18px 0 14px; padding: 8px; background: #f0f9ff; border-radius: 6px; }
  h3.section { font-size: 11px; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 600; color: #334155; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; font-size: 11px; }
  .field { display: flex; gap: 8px; padding: 4px 0; }
  .field label { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; min-width: 130px; }
  .field span { font-weight: 500; }
  .pos { color: #b91c1c; font-weight: 700; }
  .neg { color: #166534; }
  .ns { color: #64748b; font-style: italic; }
  .signatures { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .signature { padding-top: 10px; border-top: 1px solid #94a3b8; font-size: 10px; }
  .signature strong { display: block; color: #0c4a6e; margin-bottom: 4px; font-size: 11px; }
  .conclusion { background: #fafafa; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-size: 11px; }
  footer { margin-top: 30px; font-size: 9px; color: #94a3b8; text-align: center; padding-top: 12px; border-top: 1px dashed #e2e8f0; }
  @media print {
    body { margin: 14mm; }
    .print-btn { display: none; }
    header { page-break-after: avoid; }
    h3.section { page-break-after: avoid; }
  }
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()" style="position:fixed;top:14px;right:14px;padding:8px 14px;background:#0369a1;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;box-shadow:0 4px 12px rgba(3,105,161,0.25);">
  Imprimer
</button>

<header>
  <div class="brand">
    <div class="brand-logo">Tx</div>
    <div>
      <h1>Service de Toxicologie</h1>
      <p>CHU Constantine</p>
      <p>Unité : ${escape(analyse.unite?.nom)} (${escape(analyse.unite?.code)})</p>
    </div>
  </div>
  <div class="meta">
    <p><strong>N° rapport :</strong> ${escape(analyse.numero) || analyse.id.slice(0, 8)}</p>
    <p>Édité le ${formatDateTime(new Date().toISOString())}</p>
    <p>Statut : ${STATUT_LABELS[analyse.statut as keyof typeof STATUT_LABELS] ?? analyse.statut}</p>
  </div>
</header>

<h2 class="report">${schema.reportTitle}</h2>

<h3 class="section">Identité du patient</h3>
<div class="grid2">
  <div class="field"><label>Nom complet</label><span>${analyse.patient ? fullName(analyse.patient) : "—"}</span></div>
  <div class="field"><label>Numéro INI</label><span>${escape(analyse.patient?.ini)}</span></div>
  <div class="field"><label>Date de naissance</label><span>${formatDate(analyse.patient?.date_naissance)}</span></div>
  <div class="field"><label>Sexe</label><span>${escape(analyse.patient?.sexe)}</span></div>
  <div class="field"><label>Ville de naissance</label><span>${escape(analyse.patient?.ville_naissance)}</span></div>
  <div class="field"><label>Type de prélèvement</label><span>${escape(analyse.type?.nom)}</span></div>
  <div class="field"><label>Date de prélèvement</label><span>${formatDate(analyse.date_prelevement)}</span></div>
</div>

${schema.sections.map((s) => renderSection(s, resultats)).join("")}

${
  analyse.conclusion
    ? `<h3 class="section">Conclusion globale</h3><div class="conclusion">${escape(analyse.conclusion)}</div>`
    : ""
}

<div class="signatures">
  <div class="signature">
    <strong>Validation Unité</strong>
    ${analyse.valide_unite ? fullName(analyse.valide_unite) : "—"}<br/>
    <span style="color:#64748b">${formatDateTime(analyse.valide_unite_at)}</span>
  </div>
  <div class="signature">
    <strong>Cheffe du Service de Toxicologie</strong>
    ${analyse.valide_chef ? fullName(analyse.valide_chef) : "—"}<br/>
    <span style="color:#64748b">${formatDateTime(analyse.valide_chef_at)}</span>
  </div>
</div>

<footer>Document généré automatiquement par l'application de gestion du Service de Toxicologie — CHU Constantine.</footer>
</body>
</html>`;
}

function renderSection(
  section: { id: string; title: string; fields: Field[] },
  values: Record<string, unknown>,
): string {
  // Sections traitées séparément (déjà rendues ailleurs ou non utiles dans le PDF)
  if (section.id === "interpretation" || section.id === "conclusion") {
    return renderTextSection(section, values);
  }

  // Sections "table" (prélèvements MEDLEG, substances PHARMA, qualitatifs, quantitatifs)
  const isTableLike = section.fields.some((f) =>
    ["checkbox-row", "quantitative", "qualitative", "substance-pharma"].includes(
      f.type,
    ),
  );

  if (isTableLike) {
    return `
      <h3 class="section">${section.title}</h3>
      <table>
        ${renderTableHeader(section.fields)}
        <tbody>
          ${section.fields.map((f) => renderTableRow(f, values[f.key])).join("")}
        </tbody>
      </table>
    `;
  }

  // Sections de champs simples
  return `
    <h3 class="section">${section.title}</h3>
    <div class="grid2">
      ${section.fields
        .map((f) => {
          const v = values[f.key];
          let display = "";
          if (f.type === "radio" && f.options) {
            display = f.options.find((o) => o.value === v)?.label ?? "—";
          } else if (f.type === "date") {
            display = formatDate(v as string);
          } else {
            display = (v as string) || "—";
          }
          return `<div class="field"><label>${escape(f.label)}</label><span>${escape(display)}</span></div>`;
        })
        .join("")}
    </div>
  `;
}

function renderTextSection(
  section: { title: string; fields: Field[] },
  values: Record<string, unknown>,
): string {
  return section.fields
    .map((f) => {
      const v = (values[f.key] as string) || "";
      if (!v) return "";
      return `
        <h3 class="section">${escape(f.label)}</h3>
        <div class="conclusion">${escape(v)}</div>
      `;
    })
    .join("");
}

function renderTableHeader(fields: Field[]): string {
  const first = fields[0];
  if (first.type === "checkbox-row") {
    return `<thead><tr>
      <th>Nature</th>
      <th>Présent</th>
      ${(first.columns ?? []).map((c) => `<th>${escape(c.label)}</th>`).join("")}
    </tr></thead>`;
  }
  if (first.type === "quantitative") {
    return `<thead><tr>
      <th>Substance</th>
      <th>Milieu</th>
      <th>Concentration</th>
      <th>Référence</th>
      <th>Observation</th>
    </tr></thead>`;
  }
  if (first.type === "qualitative") {
    return `<thead><tr>
      <th>Substance</th>
      <th>Résultat</th>
      <th>Concentration</th>
      <th>Référence</th>
    </tr></thead>`;
  }
  if (first.type === "substance-pharma") {
    return `<thead><tr>
      <th>Substance</th>
      <th>Seuil</th>
      <th>Résultat</th>
      <th>Fenêtre de détection</th>
    </tr></thead>`;
  }
  return "";
}

function renderTableRow(field: Field, value: unknown): string {
  const data = (value as Record<string, unknown> | undefined) ?? {};

  if (field.type === "checkbox-row") {
    const checked = Boolean(data.checked);
    return `<tr>
      <td><strong>${escape(field.label)}</strong></td>
      <td>${checked ? "☑" : "☐"}</td>
      ${(field.columns ?? []).map((c) => `<td>${escape(data[c.key] as string)}</td>`).join("")}
    </tr>`;
  }

  if (field.type === "quantitative") {
    return `<tr>
      <td><strong>${escape(field.label)}</strong></td>
      <td>${escape(field.milieu)}</td>
      <td>${escape(data.concentration as string)} ${field.unit ?? ""}</td>
      <td>${escape(field.reference)}</td>
      <td>${escape(data.observation as string)}</td>
    </tr>`;
  }

  if (field.type === "qualitative") {
    const result = (data.result as string) || "";
    const cls = result === "positif" ? "pos" : result === "negatif" ? "neg" : "ns";
    const label =
      result === "positif"
        ? "POSITIF"
        : result === "negatif"
          ? "Négatif"
          : result === "ns"
            ? "Non recherché"
            : "—";
    return `<tr>
      <td><strong>${escape(field.label)}</strong></td>
      <td class="${cls}">${label}</td>
      <td>${escape(data.concentration as string)}</td>
      <td>${escape(data.reference as string)}</td>
    </tr>`;
  }

  if (field.type === "substance-pharma") {
    const result = (data.result as string) || "";
    const cls = result === "positif" ? "pos" : "neg";
    const label = result === "positif" ? "POSITIF" : result === "negatif" ? "Négatif" : "—";
    return `<tr>
      <td><strong>${escape(field.label)}</strong></td>
      <td>${escape(field.seuil)}</td>
      <td class="${cls}">${label}</td>
      <td>${field.fenetre.map(escape).join("<br/>")}</td>
    </tr>`;
  }

  return "";
}

function escape(s: unknown): string {
  if (s === null || s === undefined || s === "") return "—";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
