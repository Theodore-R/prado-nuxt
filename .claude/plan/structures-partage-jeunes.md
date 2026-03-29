# Plan : Structures & Partage de jeunes entre prescripteurs

## Contexte client

> Les jeunes sont associés à une **structure** (pas à un prescripteur individuel).
> Quand une structure s'abonne, l'admin crée la structure. Chaque prescripteur sélectionne sa structure à l'inscription.
> Tous les prescripteurs d'une même structure voient les mêmes fiches jeunes.

## État actuel → État cible

| Élément | Avant | Après |
|---------|-------|-------|
| Structures | Champ texte `prescripteurs.structure` | Table `structures` avec FK |
| Lien jeune | `jeunes.prescripteur_id` (1 prescripteur) | `jeunes.structure_id` (toute la structure) |
| Visibilité jeunes | Prescripteur voit SES jeunes | Prescripteur voit les jeunes de SA STRUCTURE |
| Gestion structures | Liste statique `constants/structures.ts` | Admin CRUD en base |
| Inscription prescripteur | Autocomplete texte libre | Dropdown depuis la base |

---

## Étapes d'implémentation

### Étape 1 — Migration SQL : table `structures` + FK

**Fichier :** `supabase/migrations/YYYYMMDD_create_structures.sql`

```sql
-- 1. Créer la table structures
CREATE TABLE structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE structures ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les structures (pour le dropdown d'inscription)
CREATE POLICY "structures_select_all" ON structures
  FOR SELECT USING (true);

-- Seuls les admins peuvent insérer/modifier/supprimer
CREATE POLICY "structures_admin_insert" ON structures
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM prescripteurs WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "structures_admin_update" ON structures
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM prescripteurs WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "structures_admin_delete" ON structures
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM prescripteurs WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Pré-remplir avec les structures existantes (dédupliquées depuis prescripteurs.structure)
INSERT INTO structures (name)
SELECT DISTINCT structure FROM prescripteurs
WHERE structure IS NOT NULL AND structure != ''
ON CONFLICT (name) DO NOTHING;

-- 3. Ajouter structure_id aux prescripteurs
ALTER TABLE prescripteurs ADD COLUMN structure_id uuid REFERENCES structures(id);

-- Migrer les données existantes
UPDATE prescripteurs p
SET structure_id = s.id
FROM structures s
WHERE p.structure = s.name;

-- 4. Ajouter structure_id aux jeunes
ALTER TABLE jeunes ADD COLUMN structure_id uuid REFERENCES structures(id);

-- Migrer : chaque jeune hérite de la structure de son prescripteur
UPDATE jeunes j
SET structure_id = p.structure_id
FROM prescripteurs p
WHERE j.prescripteur_id = p.id;

-- 5. Index pour les requêtes par structure
CREATE INDEX idx_prescripteurs_structure_id ON prescripteurs(structure_id);
CREATE INDEX idx_jeunes_structure_id ON jeunes(structure_id);
```

**Note :** On garde `prescripteur_id` sur `jeunes` pour tracer qui a créé la fiche. On garde `structure` (texte) sur `prescripteurs` temporairement pour compatibilité, à supprimer après validation.

### Étape 2 — Migration SQL : RLS par structure

**Fichier :** `supabase/migrations/YYYYMMDD_rls_by_structure.sql`

```sql
-- Supprimer les anciennes policies sur jeunes (basées sur prescripteur_id)
-- Note : les noms exacts des policies existantes devront être vérifiés
DROP POLICY IF EXISTS "jeunes_select_own" ON jeunes;
DROP POLICY IF EXISTS "jeunes_insert_own" ON jeunes;
DROP POLICY IF EXISTS "jeunes_update_own" ON jeunes;
DROP POLICY IF EXISTS "jeunes_delete_own" ON jeunes;
-- Variantes possibles des noms
DROP POLICY IF EXISTS "prescripteur_select_own" ON jeunes;
DROP POLICY IF EXISTS "prescripteur_insert_own" ON jeunes;
DROP POLICY IF EXISTS "prescripteur_update_own" ON jeunes;
DROP POLICY IF EXISTS "prescripteur_delete_own" ON jeunes;

-- Nouvelles policies : accès par structure
CREATE POLICY "jeunes_select_by_structure" ON jeunes
  FOR SELECT USING (
    structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
  );

CREATE POLICY "jeunes_insert_by_structure" ON jeunes
  FOR INSERT WITH CHECK (
    structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
  );

CREATE POLICY "jeunes_update_by_structure" ON jeunes
  FOR UPDATE USING (
    structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
  );

CREATE POLICY "jeunes_delete_by_structure" ON jeunes
  FOR DELETE USING (
    structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
  );

-- Mettre à jour RLS sur jeune_sante (accès via structure)
DROP POLICY IF EXISTS "prescripteur_select_own" ON jeune_sante;
DROP POLICY IF EXISTS "prescripteur_insert_own" ON jeune_sante;
DROP POLICY IF EXISTS "prescripteur_update_own" ON jeune_sante;
DROP POLICY IF EXISTS "prescripteur_delete_own" ON jeune_sante;

CREATE POLICY "sante_select_by_structure" ON jeune_sante
  FOR SELECT USING (
    jeune_id IN (
      SELECT id FROM jeunes
      WHERE structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
    )
  );

CREATE POLICY "sante_insert_by_structure" ON jeune_sante
  FOR INSERT WITH CHECK (
    jeune_id IN (
      SELECT id FROM jeunes
      WHERE structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
    )
  );

CREATE POLICY "sante_update_by_structure" ON jeune_sante
  FOR UPDATE USING (
    jeune_id IN (
      SELECT id FROM jeunes
      WHERE structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
    )
  );

CREATE POLICY "sante_delete_by_structure" ON jeune_sante
  FOR DELETE USING (
    jeune_id IN (
      SELECT id FROM jeunes
      WHERE structure_id IN (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
    )
  );

-- Inscriptions : accès par structure aussi
DROP POLICY IF EXISTS "inscriptions_select_own" ON inscriptions;
DROP POLICY IF EXISTS "inscriptions_insert_own" ON inscriptions;
DROP POLICY IF EXISTS "inscriptions_delete_own" ON inscriptions;

CREATE POLICY "inscriptions_select_by_structure" ON inscriptions
  FOR SELECT USING (
    prescripteur_id IN (
      SELECT id FROM prescripteurs
      WHERE structure_id = (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
    )
  );

CREATE POLICY "inscriptions_insert_by_structure" ON inscriptions
  FOR INSERT WITH CHECK (
    prescripteur_id = auth.uid()
  );

CREATE POLICY "inscriptions_delete_by_structure" ON inscriptions
  FOR DELETE USING (
    prescripteur_id IN (
      SELECT id FROM prescripteurs
      WHERE structure_id = (SELECT structure_id FROM prescripteurs WHERE id = auth.uid())
    )
  );
```

### Étape 3 — Backend : API structures

**Fichiers à créer/modifier :**

| Fichier | Opération | Description |
|---------|-----------|-------------|
| `server/api/structures.get.ts` | Créer | Liste toutes les structures (public, pour dropdown) |
| `server/api/admin/structures.get.ts` | Créer | Liste structures + nombre de prescripteurs/jeunes |
| `server/api/admin/structures.post.ts` | Créer | Créer une structure (admin) |
| `server/api/admin/structures.patch.ts` | Créer | Modifier une structure (admin) |
| `server/api/admin/structures.delete.ts` | Créer | Supprimer une structure (admin) |

**Endpoint public `GET /api/structures` :**
- Retourne `[{ id, name }]` triées par nom
- Utilisé par le formulaire d'inscription prescripteur

**Endpoints admin CRUD :**
- GET avec stats (nb prescripteurs, nb jeunes par structure)
- POST : crée une structure (nom unique)
- PATCH : renomme une structure
- DELETE : interdit si prescripteurs rattachés

### Étape 4 — Backend : adapter les API jeunes

**Fichiers à modifier :**

| Fichier | Modification |
|---------|-------------|
| `lib/api.ts` | `createJeune` → ajouter `structure_id` (lu depuis le profil prescripteur) |
| `lib/api.ts` | Types `Prescripteur` et `Jeune` → ajouter `structureId` |
| `lib/api.ts` | `fetchPrescripteur` → ajouter `structure_id` au select |
| `server/api/jeunes/[id].put.ts` | Vérification ownership → par structure au lieu de prescripteur |
| `server/api/jeunes/[id]/sante.put.ts` | Idem |
| `server/api/jeunes/[id]/sante.get.ts` | Idem |
| `server/api/complete-profile.post.ts` | Recevoir `structure_id` au lieu de `structure` texte |
| `server/api/update-profile.post.ts` | Idem |
| `server/api/export-data.get.ts` | Filtrer par structure_id au lieu de prescripteur_id |
| `server/api/delete-account.post.ts` | Ne PAS supprimer les jeunes (ils appartiennent à la structure) |

**Changement clé dans `createJeune` :**
```typescript
// Avant
insert({ prescripteur_id: prescripteurId, ... })

// Après
insert({ prescripteur_id: prescripteurId, structure_id: structureId, ... })
// structure_id vient du profil du prescripteur connecté
```

**Changement clé dans `delete-account` :**
- Avant : supprime tous les jeunes du prescripteur
- Après : ne supprime PAS les jeunes (ils appartiennent à la structure, pas au prescripteur)
- Optionnel : supprimer les jeunes seulement si le prescripteur est le dernier de la structure

### Étape 5 — Frontend : inscription prescripteur

**Fichiers à modifier :**

| Fichier | Modification |
|---------|-------------|
| `pages/connexion.vue` | Dropdown structures → fetch depuis API au lieu de constante |
| `components/onboarding/OnboardingStep2.vue` | Idem |
| `components/espace/SettingsProfile.vue` | Idem |
| `composables/useAuth.ts` | `User` interface → ajouter `structureId` |
| `composables/useAuth.ts` | `completeProfile` → envoyer `structure_id` |
| `composables/useAuth.ts` | `register` → envoyer `structure_id` |

**Changement UX :**
- Avant : autocomplete texte libre + option "Autre"
- Après : dropdown strict depuis les structures en base (pas de saisie libre)
- Si la structure n'existe pas → message "Contactez l'administrateur"

### Étape 6 — Frontend : jeune creation auto-assignation

**Fichiers à modifier :**

| Fichier | Modification |
|---------|-------------|
| `lib/api.ts` | `createJeune` → passer `structureId` en plus de `prescripteurId` |
| `composables/useAuth.ts` | `addJeune` → passer `user.structureId` |

**Logique :**
- Le prescripteur crée un jeune → `structure_id` = la structure du prescripteur
- Pas de choix à faire côté UI, c'est automatique
- Le `prescripteur_id` est toujours enregistré (pour traçabilité : qui a créé la fiche)

### Étape 7 — Frontend : visibilité partagée (automatique via RLS)

**Ce qui change automatiquement grâce aux nouvelles RLS :**
- `fetchJeunes` → retourne tous les jeunes de la structure (pas seulement ceux du prescripteur)
- Les inscriptions de la structure sont visibles par tous
- Les données santé sont accessibles par tous les prescripteurs de la structure

**Aucune modification de code nécessaire** pour la liste des jeunes — la RLS fait le travail.

### Étape 8 — Admin : gestion des structures

**Fichier à créer :** `pages/admin/structures.vue`

**Fonctionnalités :**
- Tableau : Nom de la structure, Nb prescripteurs, Nb jeunes, Date création
- Bouton "Ajouter une structure" → modal avec champ nom
- Bouton "Modifier" → renommer
- Bouton "Supprimer" → seulement si 0 prescripteur rattaché
- Export CSV

**Fichier à modifier :** `pages/admin/prescripteurs.vue`
- Ajouter une colonne "Structure" avec le nom de la structure (pas juste le texte)
- Filtrer par structure

### Étape 9 — Nettoyage

- Supprimer `constants/structures.ts` (remplacé par la table en base)
- Supprimer `DOMAIN_TO_STRUCTURE` (plus pertinent avec les structures gérées)
- Après validation : migration pour `ALTER TABLE prescripteurs DROP COLUMN structure`
- Mettre à jour `lib/adminApi.ts` pour les stats admin

---

## Fichiers impactés (résumé)

| Fichier | Opération |
|---------|-----------|
| `supabase/migrations/YYYYMMDD_create_structures.sql` | Créer |
| `supabase/migrations/YYYYMMDD_rls_by_structure.sql` | Créer |
| `server/api/structures.get.ts` | Créer |
| `server/api/admin/structures.get.ts` | Créer |
| `server/api/admin/structures.post.ts` | Créer |
| `server/api/admin/structures.patch.ts` | Créer |
| `server/api/admin/structures.delete.ts` | Créer |
| `pages/admin/structures.vue` | Créer |
| `lib/api.ts` | Modifier (types + createJeune + fetchPrescripteur) |
| `composables/useAuth.ts` | Modifier (User type + structure_id) |
| `pages/connexion.vue` | Modifier (dropdown structures) |
| `components/onboarding/OnboardingStep2.vue` | Modifier (dropdown) |
| `components/espace/SettingsProfile.vue` | Modifier (dropdown) |
| `server/api/complete-profile.post.ts` | Modifier (structure_id) |
| `server/api/update-profile.post.ts` | Modifier (structure_id) |
| `server/api/jeunes/[id].put.ts` | Modifier (vérification par structure) |
| `server/api/jeunes/[id]/sante.put.ts` | Modifier (vérification par structure) |
| `server/api/jeunes/[id]/sante.get.ts` | Modifier (vérification par structure) |
| `server/api/delete-account.post.ts` | Modifier (ne plus supprimer les jeunes) |
| `server/api/export-data.get.ts` | Modifier (filtrer par structure) |
| `lib/adminApi.ts` | Modifier (stats structures) |
| `pages/admin/prescripteurs.vue` | Modifier (colonne structure) |
| `constants/structures.ts` | Supprimer |

---

## Risques et mitigation

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Données existantes sans structure_id | Jeunes/prescripteurs orphelins | Migration peuple structure_id depuis le champ texte |
| RLS cassée pendant migration | Accès perdu aux données | Tester en local, déployer en maintenance window |
| Prescripteur change de structure | Ses anciens jeunes restent dans l'ancienne structure | C'est le comportement voulu (les jeunes appartiennent à la structure) |
| Suppression de compte prescripteur | Les jeunes de la structure ne doivent pas être supprimés | Modifier delete-account pour ne supprimer que le profil prescripteur |
| Structure supprimée avec données | Perte de données | FK + contrainte admin (interdire suppression si membres) |

---

## Task Type
- [x] Fullstack (migrations SQL + API backend + frontend)

## Ordre d'exécution recommandé
1. Migrations SQL (étapes 1-2) — fondation
2. API structures (étape 3) — endpoints admin + public
3. API jeunes adaptées (étape 4) — logique métier
4. Frontend inscription (étape 5) — UX prescripteur
5. Frontend création jeune (étape 6) — auto-assignation
6. Admin structures (étape 8) — gestion
7. Nettoyage (étape 9) — suppression code mort
