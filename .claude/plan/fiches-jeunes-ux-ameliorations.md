# Plan : Amélioration UX des fiches jeunes — Autocomplétion & composants intelligents

## Contexte

Les fiches jeunes contiennent 3 onglets (Infos générales, Santé, Situation familiale) avec ~25 champs. Actuellement, la majorité sont des `<input type="text">` ou `<textarea>` libres, ce qui entraîne des erreurs de saisie, des incohérences et une complétion plus lente.

Ce plan propose pour **chaque champ** :
- Le composant UX optimal
- Une API publique / base de données si applicable
- Le niveau de priorité d'implémentation

---

## Onglet 1 : Infos générales

### 1.1 Prénom / Nom
| Actuel | Proposé | API |
|--------|---------|-----|
| `<input text>` | `<input text>` — pas de changement | Aucune |

**Justification** : Champs libres par nature. Ajouter uniquement une validation de longueur min (2) et un `capitalize` automatique sur la première lettre.

---

### 1.2 Date de naissance
| Actuel | Proposé | API |
|--------|---------|-----|
| `UiDateOfBirthPicker` (3 selects jour/mois/année) | OK tel quel | Aucune |

**Statut** : Déjà implémenté avec contrainte -18 ans. Rien à changer.

---

### 1.3 Adresse / Code postal / Ville
| Actuel | Proposé | API |
|--------|---------|-----|
| `<input text>` inline edit séparés | `AddressAutocomplete` existant à réutiliser dans l'inline edit | **API Adresse** (data.gouv.fr) déjà intégré |

**Amélioration** : Actuellement l'`AddressAutocomplete` est utilisé uniquement dans le formulaire de création. Il faut le réutiliser dans le mode inline edit de la fiche pour les 3 champs adresse/CP/ville groupés.

**Priorité** : HAUTE — déjà développé, juste à brancher.

---

### 1.4 Situation
| Actuel | Proposé | API |
|--------|---------|-----|
| `<input text>` | `<select>` avec options prédéfinies + "Autre" | Aucune |

**Options proposées** :
```typescript
export const SITUATIONS = [
  { value: '', label: 'Non renseigné' },
  { value: 'scolarise', label: 'Scolarisé(e)' },
  { value: 'decrochage', label: 'Décrochage scolaire' },
  { value: 'formation', label: 'En formation' },
  { value: 'emploi', label: 'En emploi' },
  { value: 'recherche-emploi', label: 'En recherche d\'emploi' },
  { value: 'service-civique', label: 'Service civique' },
  { value: 'neet', label: 'NEET (ni emploi, ni formation)' },
  { value: 'apprentissage', label: 'En apprentissage' },
  { value: 'autre', label: 'Autre' },
]
```

**Priorité** : HAUTE — réduit drastiquement les erreurs de saisie.

---

## Onglet 2 : Santé

### 2.1 Allergies
| Actuel | Proposé | API |
|--------|---------|-----|
| `<textarea>` libre | **Tag input multi-sélection** avec autocomplétion sur liste curatée + saisie libre | Liste statique curatée (~60 allergènes courants) |

**Composant** : `TagInput` — l'utilisateur tape, des suggestions apparaissent, il sélectionne ou crée un tag libre. Les tags s'affichent comme des badges.

**Liste curatée d'allergènes** (exemples) :
```typescript
export const ALLERGENES_COURANTS = [
  // Alimentaires
  'Arachides', 'Fruits à coque', 'Gluten', 'Lactose', 'Lait de vache',
  'Œufs', 'Poisson', 'Crustacés', 'Soja', 'Sésame', 'Céleri',
  'Moutarde', 'Lupin', 'Mollusques', 'Sulfites',
  // Médicamenteuses
  'Pénicilline', 'Amoxicilline', 'Aspirine', 'Ibuprofène', 'Paracétamol',
  'Sulfamides', 'Codéine', 'Latex',
  // Environnementales
  'Acariens', 'Pollen de graminées', 'Pollen de bouleau', 'Poils de chat',
  'Poils de chien', 'Moisissures', 'Venin d\'abeille', 'Venin de guêpe',
  'Nickel',
]
```

**Stockage DB** : Changer de `TEXT` à `TEXT[]` (array PostgreSQL) ou garder TEXT avec séparateur JSON.

**Priorité** : HAUTE — impact fort sur la qualité des données.

---

### 2.2 Handicap
| Actuel | Proposé | API |
|--------|---------|-----|
| `<input text>` | **Select multi-choix** basé sur la classification MDPH + "Autre" avec texte libre | Aucune API — liste MDPH statique |

**Options MDPH** :
```typescript
export const TYPES_HANDICAP = [
  { value: '', label: 'Non renseigné' },
  { value: 'aucun', label: 'Aucun handicap reconnu' },
  { value: 'moteur', label: 'Handicap moteur' },
  { value: 'visuel', label: 'Handicap visuel' },
  { value: 'auditif', label: 'Handicap auditif' },
  { value: 'mental', label: 'Handicap mental / intellectuel' },
  { value: 'psychique', label: 'Handicap psychique' },
  { value: 'tsa', label: 'Troubles du spectre autistique (TSA)' },
  { value: 'cognitif', label: 'Troubles cognitifs (DYS, TDAH)' },
  { value: 'polyhandicap', label: 'Polyhandicap' },
  { value: 'maladie-invalidante', label: 'Maladie invalidante' },
  { value: 'autre', label: 'Autre' },
]
```

**Priorité** : HAUTE — classification standardisée = données exploitables.

---

### 2.3 Taux d'invalidité
| Actuel | Proposé | API |
|--------|---------|-----|
| `<input text>` placeholder "Ex: 80%, MDPH en cours..." | **Composant hybride** : Select pour le statut + Slider pour le taux | Aucune |

**Composant proposé** : `TauxInvalidite`

```
┌─ Reconnaissance MDPH ──────────────────────┐
│  ○ Non concerné                             │
│  ○ Dossier en cours                         │
│  ● Taux reconnu : [====●=========] 80%     │
│  ○ En cours de renouvellement               │
└─────────────────────────────────────────────┘
```

**Logique** :
- Radio buttons pour le statut : `non_concerne` | `en_cours` | `reconnu` | `renouvellement`
- Si `reconnu` → **Slider 0-100%** avec des paliers visuels marqués aux seuils MDPH :
  - < 50% : taux léger (couleur verte)
  - 50-79% : taux moyen (couleur orange) — seuil pour l'AAH partielle
  - ≥ 80% : taux lourd (couleur rouge) — seuil pour l'AAH pleine + carte mobilité inclusion

**Stockage DB** : Changer de `TEXT` à `JSONB` → `{ statut: 'reconnu', taux: 80 }` ou deux colonnes `taux_invalidite_statut TEXT` + `taux_invalidite_pct INTEGER`.

**Priorité** : MOYENNE — le slider est un vrai plus UX mais nécessite un changement de modèle de données.

---

### 2.4 Régime alimentaire
| Actuel | Proposé | API |
|--------|---------|-----|
| `<select>` avec options REGIMES_ALIMENTAIRES | **Multi-select** (checkboxes ou tags) — un jeune peut être halal ET sans gluten | Aucune |

**Amélioration** : Actuellement c'est un select simple, mais un jeune peut cumuler plusieurs régimes. Transformer en multi-select avec checkboxes.

**Stockage DB** : `TEXT` → `TEXT[]` ou `JSONB`.

**Priorité** : MOYENNE — amélioration fonctionnelle réelle.

---

### 2.5 Médecin traitant
| Actuel | Proposé | API |
|--------|---------|-----|
| `<input text>` | **Autocomplete** sur l'Annuaire Santé + saisie libre | **API Annuaire Santé** (annuaire.sante.fr) |

**API Annuaire Santé** :
- URL : `https://annuaire.sante.fr/web/site_pro/api`
- Endpoint : Recherche de professionnels de santé par nom
- Gratuit : Oui
- Format : JSON
- Données : Nom, prénom, spécialité, adresse, téléphone

**Alternative plus simple** : Structurer le champ en 2 sous-champs :
- Nom du médecin (text)
- Téléphone (tel)

**Priorité** : BASSE — l'API Annuaire Santé est complexe. Mieux vaut structurer le champ.

---

### 2.6 Suivi médical
| Actuel | Proposé | API |
|--------|---------|-----|
| `<textarea>` | **Liste structurée** de suivis (spécialité + fréquence) | Aucune |

**Composant** : Liste dynamique similaire aux contacts d'urgence :
```
┌─ Suivi médical ─────────────────────────────┐
│ [Spécialité ▼] [Fréquence ▼] [Détails___]  │
│  Psychiatre      Mensuel       Dr Martin     │
│  Orthophoniste   Hebdomadaire  Centre XYZ    │
│                              [+ Ajouter]     │
└─────────────────────────────────────────────┘
```

**Spécialités** (select) : Médecin généraliste, Psychiatre, Psychologue, Orthophoniste, Psychomotricien, Ergothérapeute, Kinésithérapeute, Neurologue, ORL, Ophtalmologue, Dentiste, Autre

**Fréquences** (select) : Hebdomadaire, Bimensuel, Mensuel, Trimestriel, Ponctuel

**Priorité** : BASSE — restructuration plus complexe mais données plus exploitables.

---

### 2.7 Suivi psychologique
| Actuel | Proposé | API |
|--------|---------|-----|
| `<textarea>` | **Composant structuré** : toggle oui/non + type + fréquence + notes | Aucune |

**Composant** :
```
┌─ Suivi psychologique ───────────────────────┐
│ Suivi en cours : [Oui ● / Non ○]           │
│ Type : [Psychologue ▼]                       │
│ Fréquence : [Hebdomadaire ▼]                │
│ Notes : [________________________]           │
└─────────────────────────────────────────────┘
```

**Priorité** : BASSE — similaire au suivi médical, peut être fusionné.

---

### 2.8 Traitements en cours
| Actuel | Proposé | API |
|--------|---------|-----|
| `<textarea>` | **Tag input** avec autocomplétion sur la BDPM (Base de Données Publique des Médicaments) | **BDPM** — fichier TSV auto-hébergé |

**API / Données** :
- Source : https://base-donnees-publique.medicaments.gouv.fr/telechargement.php
- Fichier : `CIS_bdpm.txt` (~15 000 médicaments)
- Gratuit : Oui
- Format : TSV → à importer dans Supabase pour recherche

**Implémentation** :
1. Importer `CIS_bdpm.txt` dans une table `medicaments(id, nom, forme, voie_administration)`
2. Créer un endpoint `/api/medicaments/search?q=parace`
3. Composant TagInput avec autocomplétion

**Alternative légère** : Liste curatée des ~100 médicaments les plus prescrits aux jeunes (antidépresseurs, anxiolytiques, Ritaline/Concerta, antiépileptiques, etc.) + saisie libre.

**Priorité** : BASSE — la BDPM est volumineuse. Commencer par la liste curatée.

---

### 2.9 Contacts d'urgence
| Actuel | Proposé | API |
|--------|---------|-----|
| `JeuneContactsUrgence` (nom + tel + lien select) | Ajouter **validation téléphone** + **format automatique** | Aucune |

**Améliorations** :
- Masque de saisie téléphone : `06 XX XX XX XX` ou `+33 6 XX XX XX XX`
- Validation regex sur le format
- Icône indicative selon le lien (père/mère/éducateur)

**Priorité** : MOYENNE — amélioration qualité rapide.

---

## Onglet 3 : Situation familiale

### 3.1 Mesure de protection
| Actuel | Proposé | API |
|--------|---------|-----|
| `<select>` avec MESURES_PROTECTION | OK tel quel — peut-être ajouter **multi-select** | Aucune |

**Amélioration** : Un jeune peut avoir une mesure ASE + AEMO simultanément. Envisager un multi-select.

**Priorité** : BASSE.

---

### 3.2 Lieu d'hébergement
| Actuel | Proposé | API |
|--------|---------|-----|
| `<select>` avec LIEUX_HEBERGEMENT | OK tel quel | Aucune |

**Statut** : Bien implémenté. Options couvrent les cas principaux.

---

### 3.3 Référent ASE / PJJ
| Actuel | Proposé | API |
|--------|---------|-----|
| `<input text>` | **Champ structuré** : Nom + Fonction (select) + Téléphone + Email | Aucune |

**Composant** :
```
┌─ Référent ASE / PJJ ───────────────────────┐
│ Nom : [__________________]                   │
│ Fonction : [Éducateur ASE ▼]                │
│ Téléphone : [__ __ __ __ __]                │
│ Email : [__________________]                 │
└─────────────────────────────────────────────┘
```

**Fonctions** (select) : Éducateur ASE, Éducateur PJJ, Assistante sociale, Chef de service, Référent MNA, Autre

**Priorité** : MOYENNE — structurer améliore la contactabilité.

---

### 3.4 Composition familiale
| Actuel | Proposé | API |
|--------|---------|-----|
| `<textarea>` | **Formulaire structuré** de membres familiaux | Aucune |

**Composant** : Liste dynamique :
```
┌─ Composition familiale ─────────────────────┐
│ [Lien ▼]    [Prénom______] [Âge__] [Vit avec ☐] │
│  Père        Mohamed        45      ☐            │
│  Mère        Fatima         42      ☑            │
│  Frère       Karim          14      ☑            │
│                              [+ Ajouter]         │
└─────────────────────────────────────────────┘
```

**Priorité** : BASSE — restructuration importante pour un gain modéré.

---

### 3.5 Droits parentaux
| Actuel | Proposé | API |
|--------|---------|-----|
| `<textarea>` | **Select** pour le type principal + textarea pour les détails | Aucune |

**Options** :
```typescript
export const DROITS_PARENTAUX = [
  { value: '', label: 'Non renseigné' },
  { value: 'exercice-commun', label: 'Autorité parentale conjointe' },
  { value: 'exercice-exclusif', label: 'Autorité parentale exclusive (un parent)' },
  { value: 'retrait-partiel', label: 'Retrait partiel de l\'autorité parentale' },
  { value: 'retrait-total', label: 'Retrait total de l\'autorité parentale' },
  { value: 'delegation', label: 'Délégation d\'autorité parentale' },
  { value: 'tutelle', label: 'Tutelle (pupille)' },
  { value: 'mna', label: 'Mineur non accompagné (MNA)' },
  { value: 'autre', label: 'Autre' },
]
```

**Priorité** : HAUTE — transforme un champ ambigu en donnée structurée.

---

### 3.6 Notes confidentielles
| Actuel | Proposé | API |
|--------|---------|-----|
| `<textarea>` | Pas de changement — champ libre par nature | Aucune |

**Statut** : Correct. Le message sur le chiffrement est bien présent.

---

## Résumé des APIs publiques recommandées

| API | Champ | Gratuite | Inscription | Déjà intégrée |
|-----|-------|----------|-------------|----------------|
| **API Adresse** (data.gouv.fr) | Adresse/CP/Ville | ✅ | Non | ✅ Oui |
| **API Geo** (geo.api.gouv.fr) | Ville par CP | ✅ | Non | Non |
| **REST Countries** | Nationalité/Pays | ✅ | Non | Non |
| **France Travail** (ROME) | Métiers/compétences | ✅ | Oui (gratuit) | Non |
| **BDPM** (medicaments.gouv.fr) | Médicaments | ✅ | Non | Non |
| **Annuaire Santé** | Médecin traitant | ✅ | Non | Non |
| **SNOMED CT** | Pathologies | ✅ | Non | Non |

---

## Plan d'implémentation par priorité

### Phase 1 — Quick wins (1-2 jours)
1. **Situation** → Select avec options prédéfinies
2. **Handicap** → Select avec classification MDPH
3. **Droits parentaux** → Select + textarea détails
4. **Adresse inline edit** → Réutiliser `AddressAutocomplete` existant
5. **Régime alimentaire** → Multi-select (checkboxes)

### Phase 2 — Composants enrichis (2-3 jours)
6. **Allergies** → Composant `TagInput` avec liste curatée
7. **Taux d'invalidité** → Radio buttons + Slider conditionnel
8. **Contacts d'urgence** → Ajout masque téléphone + validation
9. **Référent ASE** → Champs structurés (nom/fonction/tel/email)

### Phase 3 — Intégrations API (2-3 jours)
10. **Traitements en cours** → TagInput + BDPM (ou liste curatée)
11. **Suivi médical** → Liste structurée avec spécialités
12. **Suivi psychologique** → Toggle + fréquence + notes

### Phase 4 — Optionnel
13. **Composition familiale** → Liste dynamique structurée
14. **Mesure de protection** → Multi-select
15. **Médecin traitant** → Autocomplétion Annuaire Santé

---

## Composants UI à créer

| Composant | Usage | Fichier |
|-----------|-------|---------|
| `TagInput` | Allergies, traitements | `components/ui/TagInput.vue` |
| `TauxInvaliditeInput` | Taux d'invalidité | `components/ui/TauxInvaliditeInput.vue` |
| `PhoneInput` | Contacts urgence, référent | `components/ui/PhoneInput.vue` |
| `MultiSelect` | Régime alimentaire, mesures | `components/ui/MultiSelect.vue` |

---

## Changements DB nécessaires

```sql
-- Migration : amélioration types de champs santé
ALTER TABLE jeune_sante
  ALTER COLUMN allergies TYPE JSONB USING COALESCE(
    CASE WHEN allergies != '' THEN jsonb_build_array(allergies) ELSE '[]'::jsonb END,
    '[]'::jsonb
  ),
  ALTER COLUMN regime_alimentaire TYPE TEXT[] USING
    CASE WHEN regime_alimentaire != '' THEN ARRAY[regime_alimentaire] ELSE '{}'::text[] END;

-- Ajouter colonnes structurées pour taux d'invalidité
ALTER TABLE jeune_sante
  ADD COLUMN IF NOT EXISTS taux_invalidite_statut TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS taux_invalidite_pct INTEGER DEFAULT NULL;

-- Structurer le référent ASE
ALTER TABLE jeune_sante
  ADD COLUMN IF NOT EXISTS referent_ase_nom TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS referent_ase_fonction TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS referent_ase_telephone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS referent_ase_email TEXT DEFAULT '';
```

---

## Notes techniques

- **Pas d'API externe pour les allergies/handicaps** : Les bases médicales (CIM-10, SNOMED) sont trop complexes pour ce contexte social. Des listes curatées sont plus adaptées.
- **Le slider pour le taux d'invalidité** : OUI, c'est pertinent. Les seuils MDPH (50% et 80%) sont des paliers administratifs importants qu'on peut marquer visuellement.
- **TagInput** : Patron réutilisable — allergies, traitements, et potentiellement d'autres champs futurs.
- **Rétrocompatibilité** : Les migrations DB doivent convertir les données TEXT existantes vers les nouveaux formats.
