-- ============================================================
-- Migration: Replace prescripteur-based RLS with structure-based RLS
-- ============================================================

-- ── jeunes ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "jeunes_select_own" ON jeunes;
DROP POLICY IF EXISTS "jeunes_insert_own" ON jeunes;
DROP POLICY IF EXISTS "jeunes_update_own" ON jeunes;
DROP POLICY IF EXISTS "jeunes_delete_own" ON jeunes;
DROP POLICY IF EXISTS "prescripteur_select_own" ON jeunes;
DROP POLICY IF EXISTS "prescripteur_insert_own" ON jeunes;
DROP POLICY IF EXISTS "prescripteur_update_own" ON jeunes;
DROP POLICY IF EXISTS "prescripteur_delete_own" ON jeunes;

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

-- ── jeune_sante ─────────────────────────────────────────────

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

-- ── inscriptions ────────────────────────────────────────────

DROP POLICY IF EXISTS "inscriptions_select_own" ON inscriptions;
DROP POLICY IF EXISTS "inscriptions_insert_own" ON inscriptions;
DROP POLICY IF EXISTS "inscriptions_delete_own" ON inscriptions;
DROP POLICY IF EXISTS "prescripteur_select_own" ON inscriptions;
DROP POLICY IF EXISTS "prescripteur_insert_own" ON inscriptions;
DROP POLICY IF EXISTS "prescripteur_delete_own" ON inscriptions;

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
