-- Migration: upgrade des colonnes jeune_sante TEXT → JSONB
-- Convertit les données existantes (texte libre) vers les formats structurés.
-- Rétrocompatible : les chaînes vides deviennent des defaults JSONB propres.

-- ═══ Allergies: TEXT → JSONB (array de strings) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN allergies TYPE jsonb
  USING CASE
    WHEN allergies = '' OR allergies IS NULL THEN '[]'::jsonb
    WHEN allergies::text ~ '^\[' THEN allergies::jsonb
    ELSE jsonb_build_array(allergies)
  END;
ALTER TABLE jeune_sante ALTER COLUMN allergies SET DEFAULT '[]'::jsonb;

-- ═══ Regime alimentaire: TEXT → JSONB (array de strings) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN regime_alimentaire TYPE jsonb
  USING CASE
    WHEN regime_alimentaire = '' OR regime_alimentaire IS NULL THEN '[]'::jsonb
    WHEN regime_alimentaire::text ~ '^\[' THEN regime_alimentaire::jsonb
    ELSE jsonb_build_array(regime_alimentaire)
  END;
ALTER TABLE jeune_sante ALTER COLUMN regime_alimentaire SET DEFAULT '[]'::jsonb;

-- ═══ Traitements en cours: TEXT → JSONB (array de strings) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN traitements_en_cours TYPE jsonb
  USING CASE
    WHEN traitements_en_cours = '' OR traitements_en_cours IS NULL THEN '[]'::jsonb
    WHEN traitements_en_cours::text ~ '^\[' THEN traitements_en_cours::jsonb
    ELSE jsonb_build_array(traitements_en_cours)
  END;
ALTER TABLE jeune_sante ALTER COLUMN traitements_en_cours SET DEFAULT '[]'::jsonb;

-- ═══ Mesure protection: TEXT → JSONB (array de strings) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN mesure_protection TYPE jsonb
  USING CASE
    WHEN mesure_protection = '' OR mesure_protection IS NULL THEN '[]'::jsonb
    WHEN mesure_protection::text ~ '^\[' THEN mesure_protection::jsonb
    ELSE CASE WHEN mesure_protection != '' THEN jsonb_build_array(mesure_protection) ELSE '[]'::jsonb END
  END;
ALTER TABLE jeune_sante ALTER COLUMN mesure_protection SET DEFAULT '[]'::jsonb;

-- ═══ Suivi medical: TEXT → JSONB (array d'objets) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN suivi_medical TYPE jsonb
  USING CASE
    WHEN suivi_medical = '' OR suivi_medical IS NULL THEN '[]'::jsonb
    WHEN suivi_medical::text ~ '^\[' THEN suivi_medical::jsonb
    ELSE '[]'::jsonb  -- Texte libre ne peut pas être converti en struct
  END;
ALTER TABLE jeune_sante ALTER COLUMN suivi_medical SET DEFAULT '[]'::jsonb;

-- ═══ Suivi psychologique: TEXT → JSONB (objet) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN suivi_psychologique TYPE jsonb
  USING CASE
    WHEN suivi_psychologique = '' OR suivi_psychologique IS NULL
      THEN '{"enCours":false,"type":"","frequence":"","notes":""}'::jsonb
    WHEN suivi_psychologique::text ~ '^\{' THEN suivi_psychologique::jsonb
    ELSE jsonb_build_object('enCours', true, 'type', '', 'frequence', '', 'notes', suivi_psychologique)
  END;
ALTER TABLE jeune_sante ALTER COLUMN suivi_psychologique SET DEFAULT '{"enCours":false,"type":"","frequence":"","notes":""}'::jsonb;

-- ═══ Medecin traitant: TEXT → JSONB (objet) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN medecin_traitant TYPE jsonb
  USING CASE
    WHEN medecin_traitant = '' OR medecin_traitant IS NULL
      THEN '{"nom":"","telephone":"","adresse":"","codePostal":"","specialite":""}'::jsonb
    WHEN medecin_traitant::text ~ '^\{' THEN medecin_traitant::jsonb
    ELSE jsonb_build_object('nom', medecin_traitant, 'telephone', '', 'adresse', '', 'codePostal', '', 'specialite', '')
  END;
ALTER TABLE jeune_sante ALTER COLUMN medecin_traitant SET DEFAULT '{"nom":"","telephone":"","adresse":"","codePostal":"","specialite":""}'::jsonb;

-- ═══ Referent ASE: TEXT → JSONB (objet) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN referent_ase TYPE jsonb
  USING CASE
    WHEN referent_ase = '' OR referent_ase IS NULL
      THEN '{"nom":"","fonction":"","telephone":"","email":""}'::jsonb
    WHEN referent_ase::text ~ '^\{' THEN referent_ase::jsonb
    ELSE jsonb_build_object('nom', referent_ase, 'fonction', '', 'telephone', '', 'email', '')
  END;
ALTER TABLE jeune_sante ALTER COLUMN referent_ase SET DEFAULT '{"nom":"","fonction":"","telephone":"","email":""}'::jsonb;

-- ═══ Composition familiale: TEXT → JSONB (array d'objets) ═══
ALTER TABLE jeune_sante
  ALTER COLUMN composition_familiale TYPE jsonb
  USING CASE
    WHEN composition_familiale = '' OR composition_familiale IS NULL THEN '[]'::jsonb
    WHEN composition_familiale::text ~ '^\[' THEN composition_familiale::jsonb
    ELSE '[]'::jsonb  -- Texte libre ne peut pas être converti en struct
  END;
ALTER TABLE jeune_sante ALTER COLUMN composition_familiale SET DEFAULT '[]'::jsonb;
