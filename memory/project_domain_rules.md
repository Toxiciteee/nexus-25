---
name: Domain Rules — Workflow & Cloisonnement
description: Validation hierarchy and access rules for the Toxicology app
type: project
---

**Validation workflow (4 tiers):**
1. **Secrétaire** (Niveau 1): saisie des résultats via formulaire à cases à cocher → soumet à l'unité.
2. **Résident** (Niveau 2): vérifie et transmet au responsable d'unité.
3. **Responsable d'Unité** (Niveau 3): valide et signe électroniquement → envoie au Chef de Service.
4. **Chef de Service** (Niveau 4, Mme Benboudiaf Sabah): validation finale + signature + génération PDF.

**Status enum:** `brouillon` → `attente_unite` → `attente_chef` → `valide`.

**Cloisonnement par unité:**
- Un patient est rattaché à **une seule unité** (FK `patients.unite_id`). Pas de partage cross-unité du patient.
- En lecture: les résidents/responsables peuvent **consulter** les dossiers d'autres unités (read-only). Pas d'édition cross-unité.
- En écriture: chacun n'agit que sur les analyses de **son** unité (sauf Chef de Service qui voit/agit sur tout).

**Signature:** simple — horodatage + identité du signataire (`personnel_id`, `signed_at`). Pas de PKI.

**Why:** Conforme à l'organisation hiérarchique du service et préserve la confidentialité inter-unités tout en permettant la consultation académique/médico-légale.

**How to apply:** Toujours filtrer par `unite_id` dans les RLS d'écriture; pour la lecture, autoriser tous les rôles authentifiés sur les données validées ou en cours.
