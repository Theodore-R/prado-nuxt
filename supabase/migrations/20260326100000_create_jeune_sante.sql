-- Donnees de sante et situation familiale des jeunes
-- NOTE: Stocke temporairement sur Supabase. A migrer vers un hebergeur HDS
-- certifie quand le client validera le budget (obligation legale Art. L1111-8 CSP).

CREATE TABLE IF NOT EXISTS jeune_sante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jeune_id uuid NOT NULL UNIQUE REFERENCES jeunes(id) ON DELETE CASCADE,

  -- Sante
  allergies text DEFAULT '',
  handicap text DEFAULT '',
  taux_invalidite text DEFAULT '',
  suivi_psychologique text DEFAULT '',
  suivi_medical text DEFAULT '',
  traitements_en_cours text DEFAULT '',
  regime_alimentaire text DEFAULT '',
  contacts_urgence jsonb DEFAULT '[]',
  medecin_traitant text DEFAULT '',

  -- Situation familiale
  mesure_protection text DEFAULT '',
  referent_ase text DEFAULT '',
  composition_familiale text DEFAULT '',
  lieu_hebergement text DEFAULT '',
  droits_parentaux text DEFAULT '',

  -- Meta
  notes_confidentielles text DEFAULT '',
  derniere_mise_a_jour timestamptz DEFAULT now(),
  mis_a_jour_par uuid REFERENCES prescripteurs(id),
  created_at timestamptz DEFAULT now()
);

-- RLS: prescripteurs ne voient que les fiches de leurs jeunes
ALTER TABLE jeune_sante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prescripteur_select_own" ON jeune_sante
  FOR SELECT USING (
    jeune_id IN (SELECT id FROM jeunes WHERE prescripteur_id = auth.uid())
  );

CREATE POLICY "prescripteur_insert_own" ON jeune_sante
  FOR INSERT WITH CHECK (
    jeune_id IN (SELECT id FROM jeunes WHERE prescripteur_id = auth.uid())
  );

CREATE POLICY "prescripteur_update_own" ON jeune_sante
  FOR UPDATE USING (
    jeune_id IN (SELECT id FROM jeunes WHERE prescripteur_id = auth.uid())
  );

CREATE POLICY "prescripteur_delete_own" ON jeune_sante
  FOR DELETE USING (
    jeune_id IN (SELECT id FROM jeunes WHERE prescripteur_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_jeune_sante_jeune_id ON jeune_sante(jeune_id);
