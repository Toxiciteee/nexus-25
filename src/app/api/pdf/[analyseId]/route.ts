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
 * Rapport imprimable v3 — palette olive + contrainte 1 page A4.
 * Compact, dense mais lisible. La feuille @page A4 + tailles réduites
 * + section interprétation tassée garantissent qu'une analyse standard
 * (jusqu'à ~10 substances) tient sur une seule page.
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

  const html = renderReport({ schema, resultats, analyse: a });

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
  interpretation: string | null;
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

/* ====================================================================== */
/*  Palette olive (alignée sur l'app)                                     */
/* ====================================================================== */
const OLIVE = "#7e8a4f";          // primary
const OLIVE_DARK = "#5e6b3a";     // primary-700
const OLIVE_LIGHT = "#f6f5ee";    // primary-50 / cream
const OLIVE_TINT = "#eceddb";     // primary-100
const OLIVE_BORDER = "#d8d9b8";   // border tint
const TEXT = "#2a2f23";
const TEXT_MUTED = "#5d6450";
const POSITIVE = "#a6342e";       // alerte
const NEGATIVE = "#3d6e4a";       // safe
const NEUTRAL = "#7a8068";        // ns

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
  /* === Page A4, marges minimales pour tenir en 1 page === */
  @page { size: A4 portrait; margin: 8mm 10mm; }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #ffffff; color: ${TEXT}; }
  body {
    font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
    font-size: 10px;
    line-height: 1.4;
    padding: 0;
  }

  .page {
    width: 100%;
    max-width: 190mm;
    margin: 0 auto;
    padding: 8mm 10mm;
  }

  /* === Header compact === */
  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    border-bottom: 2px solid ${OLIVE};
    padding-bottom: 8px;
    margin-bottom: 10px;
  }
  .brand { display: flex; gap: 10px; align-items: center; }
  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, ${OLIVE}, ${OLIVE_DARK});
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }
  .brand h1 { font-size: 13px; color: ${OLIVE_DARK}; letter-spacing: 0.2px; }
  .brand p { font-size: 9px; color: ${TEXT_MUTED}; margin-top: 1px; }
  .meta { font-size: 9px; text-align: right; color: ${TEXT_MUTED}; line-height: 1.45; }
  .meta strong { color: ${OLIVE_DARK}; }

  h2.report {
    text-align: center;
    font-size: 11px;
    color: ${OLIVE_DARK};
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin: 8px 0 8px;
    padding: 5px;
    background: ${OLIVE_LIGHT};
    border-radius: 4px;
    font-weight: 700;
  }

  h3.section {
    font-size: 9px;
    color: ${OLIVE_DARK};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 8px 0 4px;
    padding-bottom: 2px;
    border-bottom: 1px solid ${OLIVE_BORDER};
    font-weight: 700;
    page-break-after: avoid;
  }

  /* === Tableaux compacts === */
  table { width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 4px; page-break-inside: avoid; }
  th, td {
    text-align: left;
    padding: 3px 6px;
    border-bottom: 1px solid ${OLIVE_BORDER};
    vertical-align: top;
  }
  th {
    background: ${OLIVE_TINT};
    font-weight: 600;
    color: ${OLIVE_DARK};
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  /* === Grille 2 colonnes pour identité === */
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; font-size: 9.5px; }
  .field { display: flex; gap: 6px; padding: 1px 0; }
  .field label { color: ${TEXT_MUTED}; font-size: 8px; text-transform: uppercase; letter-spacing: 0.4px; min-width: 92px; font-weight: 600; }
  .field span { font-weight: 500; }

  /* Statuts résultats */
  .pos { color: ${POSITIVE}; font-weight: 700; }
  .neg { color: ${NEGATIVE}; }
  .ns { color: ${NEUTRAL}; font-style: italic; }

  /* === Interprétation et conclusion : compact === */
  .conclusion {
    background: ${OLIVE_LIGHT};
    border: 1px solid ${OLIVE_BORDER};
    padding: 6px 8px;
    border-radius: 4px;
    white-space: pre-wrap;
    font-size: 9.5px;
    line-height: 1.45;
  }

  /* === Signatures côte à côte, compactes === */
  .signatures {
    margin-top: 10px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    page-break-inside: avoid;
  }
  .signature {
    padding-top: 6px;
    border-top: 1px solid ${OLIVE};
    font-size: 8.5px;
    line-height: 1.45;
  }
  .signature strong {
    display: block;
    color: ${OLIVE_DARK};
    margin-bottom: 2px;
    font-size: 9px;
  }

  footer {
    margin-top: 8px;
    font-size: 7.5px;
    color: ${NEUTRAL};
    text-align: center;
    padding-top: 4px;
    border-top: 1px dashed ${OLIVE_BORDER};
  }

  /* === Bouton Imprimer (caché à l'impression) === */
  .print-btn {
    position: fixed;
    top: 14px;
    right: 14px;
    padding: 8px 14px;
    background: ${OLIVE};
    color: #fff;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(126, 138, 79, 0.3);
    z-index: 100;
  }
  .print-btn:hover { background: ${OLIVE_DARK}; }

  @media print {
    .print-btn { display: none; }
    .page { padding: 0; }
    body { font-size: 9.5px; }
  }
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">Imprimer</button>

<div class="page">

<header>
  <div class="brand">
    <div class="brand-logo">☠</div>
    <div>
      <h1>Service de Toxicologie</h1>
      <p>CHU Constantine — Unité ${escape(analyse.unite?.code)} — ${escape(analyse.unite?.nom)}</p>
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
  <div class="field"><label>Date naissance</label><span>${formatDate(analyse.patient?.date_naissance)}</span></div>
  <div class="field"><label>Sexe</label><span>${escape(analyse.patient?.sexe)}</span></div>
  <div class="field"><label>Ville naissance</label><span>${escape(analyse.patient?.ville_naissance)}</span></div>
  <div class="field"><label>Type prélèvement</label><span>${escape(analyse.type?.nom)}</span></div>
  <div class="field"><label>Date prélèvement</label><span>${formatDate(analyse.date_prelevement)}</span></div>
</div>

${schema.sections.map((s) => renderSection(s, resultats)).join("")}

${
  analyse.interpretation
    ? `<h3 class="section">Interprétation clinique (Chef d'unité)</h3><div class="conclusion">${escape(analyse.interpretation)}</div>`
    : ""
}

${
  analyse.conclusion
    ? `<h3 class="section">Conclusion globale</h3><div class="conclusion">${escape(analyse.conclusion)}</div>`
    : ""
}

<div class="signatures">
  <div class="signature">
    <strong>Validation Chef d'unité</strong>
    ${analyse.valide_unite ? fullName(analyse.valide_unite) : "—"}<br/>
    <span style="color:${TEXT_MUTED}">${formatDateTime(analyse.valide_unite_at)}</span>
  </div>
  <div class="signature">
    <strong>Cheffe du Service de Toxicologie</strong>
    ${analyse.valide_chef ? fullName(analyse.valide_chef) : "—"}<br/>
    <span style="color:${TEXT_MUTED}">${formatDateTime(analyse.valide_chef_at)}</span>
  </div>
</div>

<footer>Document généré automatiquement par l'application de gestion du Service de Toxicologie — CHU Constantine.</footer>

</div>
</body>
</html>`;
}

function renderSection(
  section: { id: string; title: string; fields: Field[] },
  values: Record<string, unknown>,
): string {
  // L'ancienne section "interpretation" du schéma MEDLEG est désormais traitée
  // séparément (champ analyses.interpretation). On la skip si présente dans le
  // schéma pour ne pas dupliquer.
  if (section.id === "interpretation") return "";
  if (section.id === "conclusion") return renderTextSection(section, values);

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
      <td style="font-size: 8.5px;">${field.fenetre.map(escape).join(" · ")}</td>
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
