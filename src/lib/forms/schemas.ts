/**
 * Schémas de formulaires métier par unité.
 * Le code de l'unité (`unite.code`) sélectionne le schéma à afficher.
 *
 * Architecture :
 *   - Chaque unité a un schéma typé qui décrit toutes les sections du formulaire
 *   - Le secrétaire saisit, le résultat est stocké en JSONB dans `analyses.resultats`
 *   - Le PDF lit le même JSONB pour générer le rapport conforme aux modèles fournis
 */

export type FieldText = {
  type: "text";
  key: string;
  label: string;
  placeholder?: string;
};
export type FieldTextarea = {
  type: "textarea";
  key: string;
  label: string;
  placeholder?: string;
  rows?: number;
};
export type FieldDate = { type: "date"; key: string; label: string };
export type FieldNumber = {
  type: "number";
  key: string;
  label: string;
  unit?: string;
  step?: number;
};
export type FieldRadio = {
  type: "radio";
  key: string;
  label: string;
  options: { value: string; label: string }[];
};
export type FieldCheckboxRow = {
  type: "checkbox-row";
  key: string;
  label: string;
  /** Colonnes additionnelles à saisir si la case est cochée */
  columns?: { key: string; label: string; placeholder?: string }[];
};
export type FieldQuantitative = {
  type: "quantitative";
  key: string;
  label: string;
  milieu: string;
  unit: string;
  reference: string;
};
export type FieldQualitative = {
  type: "qualitative";
  key: string;
  label: string;
  /** Champs libres optionnels (concentration, valeur de référence personnalisée) */
  withConcentration?: boolean;
};
export type FieldSubstancePharma = {
  type: "substance-pharma";
  key: string;
  label: string;
  seuil: string;
  fenetre: string[];
};

export type Field =
  | FieldText
  | FieldTextarea
  | FieldDate
  | FieldNumber
  | FieldRadio
  | FieldCheckboxRow
  | FieldQuantitative
  | FieldQualitative
  | FieldSubstancePharma;

export type Section = {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
};

export type FormSchema = {
  unitCode: string;
  unitName: string;
  reportTitle: string;
  sections: Section[];
};

/* -------------------------------------------------------------------- */
/*  MEDLEG — Rapport d'expertise toxicologique                          */
/* -------------------------------------------------------------------- */

export const MEDLEG_SCHEMA: FormSchema = {
  unitCode: "MEDLEG",
  unitName: "Médico-légale",
  reportTitle: "RAPPORT D'EXPERTISE TOXICOLOGIQUE",
  sections: [
    {
      id: "demande",
      title: "Demande",
      fields: [
        { type: "text", key: "service_demandeur", label: "Service demandeur / Établissement" },
        { type: "text", key: "medecin_legiste", label: "Médecin légiste" },
      ],
    },
    {
      id: "identite_defunt",
      title: "Identité du défunt / patient",
      fields: [
        { type: "text", key: "contexte", label: "Contexte" },
      ],
    },
    {
      id: "prelevements_dates",
      title: "Prélèvements — dates",
      fields: [
        { type: "date", key: "date_prelevement", label: "Date des prélèvements" },
        { type: "date", key: "date_reception", label: "Date de réception des prélèvements" },
      ],
    },
    {
      id: "prelevements_table",
      title: "Nature des prélèvements",
      description: "Cochez les prélèvements reçus et complétez si besoin.",
      fields: [
        {
          type: "checkbox-row",
          key: "p_sang_cardiaque",
          label: "Sang cardiaque",
          columns: [
            { key: "contenant", label: "Contenant" },
            { key: "nombre", label: "Nombre" },
            { key: "volume", label: "Volume" },
            { key: "observation", label: "Observation" },
          ],
        },
        {
          type: "checkbox-row",
          key: "p_sang_peripherique",
          label: "Sang périphérique",
          columns: [
            { key: "contenant", label: "Contenant" },
            { key: "nombre", label: "Nombre" },
            { key: "volume", label: "Volume" },
            { key: "observation", label: "Observation" },
          ],
        },
        {
          type: "checkbox-row",
          key: "p_urine",
          label: "Urine",
          columns: [
            { key: "contenant", label: "Contenant" },
            { key: "nombre", label: "Nombre" },
            { key: "volume", label: "Volume" },
            { key: "observation", label: "Observation" },
          ],
        },
        {
          type: "checkbox-row",
          key: "p_bile",
          label: "Bile",
          columns: [
            { key: "contenant", label: "Contenant" },
            { key: "nombre", label: "Nombre" },
            { key: "volume", label: "Volume" },
            { key: "observation", label: "Observation" },
          ],
        },
        {
          type: "checkbox-row",
          key: "p_contenu_gastrique",
          label: "Contenu gastrique",
          columns: [
            { key: "contenant", label: "Contenant" },
            { key: "nombre", label: "Nombre" },
            { key: "volume", label: "Volume" },
            { key: "observation", label: "Observation" },
          ],
        },
        {
          type: "checkbox-row",
          key: "p_cerveau",
          label: "Cerveau",
          columns: [
            { key: "contenant", label: "Contenant" },
            { key: "nombre", label: "Nombre" },
            { key: "volume", label: "Volume" },
            { key: "observation", label: "Observation" },
          ],
        },
        {
          type: "checkbox-row",
          key: "p_autres",
          label: "Autres",
          columns: [
            { key: "precision", label: "Préciser" },
            { key: "contenant", label: "Contenant" },
            { key: "nombre", label: "Nombre" },
            { key: "volume", label: "Volume" },
          ],
        },
      ],
    },
    {
      id: "examens_quantitatifs",
      title: "Résultats quantitatifs",
      fields: [
        {
          type: "quantitative",
          key: "alcool_ethylique",
          label: "Alcool éthylique",
          milieu: "Sang périphérique",
          unit: "g/L",
          reference: "< 0,2 g/L",
        },
        {
          type: "quantitative",
          key: "hbco",
          label: "HBCO",
          milieu: "Sang",
          unit: "%",
          reference: "< 3 %",
        },
      ],
    },
    {
      id: "examens_qualitatifs",
      title: "Résultats qualitatifs",
      description: "Indiquer la présence (positif/négatif) et préciser si nécessaire.",
      fields: [
        { type: "qualitative", key: "cannabis", label: "Cannabis" },
        { type: "qualitative", key: "cocaine", label: "Cocaïne" },
        { type: "qualitative", key: "opiaces", label: "Opiacés", withConcentration: true },
        { type: "qualitative", key: "antidepresseurs", label: "Antidépresseurs", withConcentration: true },
        { type: "qualitative", key: "benzodiazepines", label: "Benzodiazépines", withConcentration: true },
        { type: "qualitative", key: "neuroleptiques", label: "Neuroleptiques / Phénothiazines", withConcentration: true },
      ],
    },
    {
      id: "interpretation",
      title: "Interprétation et conclusion",
      fields: [
        {
          type: "textarea",
          key: "interpretation",
          label: "Interprétation",
          rows: 5,
        },
        {
          type: "textarea",
          key: "conclusion",
          label: "Conclusion",
          rows: 4,
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------- */
/*  PHARMA — Résultats Pharmacodépendance                               */
/* -------------------------------------------------------------------- */

export const PHARMA_SCHEMA: FormSchema = {
  unitCode: "PHARMA",
  unitName: "Pharmacodépendance",
  reportTitle: "RÉSULTATS — DÉPISTAGE PHARMACODÉPENDANCE",
  sections: [
    {
      id: "demande",
      title: "Demande",
      fields: [
        { type: "text", key: "service_demandeur", label: "Service / Établissement demandeur" },
        { type: "text", key: "medecin_prescripteur", label: "Médecin prescripteur" },
      ],
    },
    {
      id: "contexte",
      title: "Contexte du dépistage",
      fields: [
        {
          type: "radio",
          key: "contexte",
          label: "Contexte",
          options: [
            { value: "initial", label: "Initial" },
            { value: "controle", label: "Contrôle" },
            { value: "pre_emploi", label: "Pré-emploi" },
          ],
        },
        {
          type: "date",
          key: "date_prelevement_service",
          label: "Date du prélèvement (au niveau du service)",
        },
      ],
    },
    {
      id: "substances",
      title: "Substances recherchées",
      description:
        "Pour chaque substance, indiquer le résultat (positif / négatif).",
      fields: [
        {
          type: "substance-pharma",
          key: "barbituriques",
          label: "Barbituriques",
          seuil: "200 ng/mL",
          fenetre: ["1 – 15 jours"],
        },
        {
          type: "substance-pharma",
          key: "benzodiazepines",
          label: "Benzodiazépines",
          seuil: "200 ng/mL",
          fenetre: ["3 – 5 jours"],
        },
        {
          type: "substance-pharma",
          key: "cannabis",
          label: "Cannabis",
          seuil: "50 ng/mL",
          fenetre: [
            "Consommation unique : 24 – 72 heures",
            "Consommation modérée : 5 jours",
            "Consommation quotidienne : 10 jours",
            "Consommation chronique intense : 30 jours",
          ],
        },
        {
          type: "substance-pharma",
          key: "cocaine",
          label: "Cocaïne",
          seuil: "150 ng/mL",
          fenetre: ["36 – 72 heures", "Consommation intense : 20 jours"],
        },
        {
          type: "substance-pharma",
          key: "ecstasy",
          label: "Ecstasy",
          seuil: "1000 ng/mL",
          fenetre: ["24 – 48 heures"],
        },
        {
          type: "substance-pharma",
          key: "pregabaline",
          label: "Prégabaline",
          seuil: "500 ng/mL",
          fenetre: ["1 – 4 jours"],
        },
        {
          type: "substance-pharma",
          key: "tramadol",
          label: "Tramadol",
          seuil: "100 ng/mL",
          fenetre: ["1 – 4 jours"],
        },
      ],
    },
    {
      id: "technique",
      title: "Technique de dépistage",
      fields: [
        {
          type: "radio",
          key: "technique",
          label: "Technique utilisée",
          options: [
            { value: "immuno_enzymatique", label: "Immuno-enzymatique (*)" },
            { value: "immuno_chromatographique", label: "Immuno-chromatographique (**)" },
          ],
        },
      ],
    },
    {
      id: "conclusion",
      title: "Observations",
      fields: [
        { type: "textarea", key: "observations", label: "Observations / commentaires", rows: 3 },
      ],
    },
  ],
};

/* -------------------------------------------------------------------- */
/*  Fallback — schéma générique pour les autres unités                  */
/* -------------------------------------------------------------------- */

export const GENERIC_SCHEMA: FormSchema = {
  unitCode: "GENERIC",
  unitName: "Analyse générique",
  reportTitle: "RAPPORT D'ANALYSE",
  sections: [
    {
      id: "informations",
      title: "Informations",
      fields: [
        { type: "text", key: "service_demandeur", label: "Service demandeur" },
        { type: "text", key: "medecin", label: "Médecin prescripteur" },
      ],
    },
    {
      id: "resultats_libres",
      title: "Résultats",
      fields: [
        {
          type: "textarea",
          key: "resultats_texte",
          label: "Résultats détaillés",
          rows: 8,
        },
      ],
    },
    {
      id: "conclusion",
      title: "Conclusion",
      fields: [
        { type: "textarea", key: "conclusion", label: "Conclusion", rows: 4 },
      ],
    },
  ],
};

const SCHEMAS: Record<string, FormSchema> = {
  MEDLEG: MEDLEG_SCHEMA,
  PHARMA: PHARMA_SCHEMA,
};

export function getSchemaForUnit(unitCode: string | null | undefined): FormSchema {
  if (!unitCode) return GENERIC_SCHEMA;
  return SCHEMAS[unitCode] ?? GENERIC_SCHEMA;
}
