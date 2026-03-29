-- ============================================================
-- Migration: Create structures table + FK on prescripteurs & jeunes
-- ============================================================

-- 1. Create the structures table
CREATE TABLE structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE structures ENABLE ROW LEVEL SECURITY;

-- Everyone can read structures (for registration dropdown)
CREATE POLICY "structures_select_all" ON structures
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
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

-- 2. Populate from existing prescripteurs.structure (deduplicated)
INSERT INTO structures (name)
SELECT DISTINCT structure FROM prescripteurs
WHERE structure IS NOT NULL AND structure != ''
ON CONFLICT (name) DO NOTHING;

-- 3. Add structure_id FK to prescripteurs
ALTER TABLE prescripteurs ADD COLUMN structure_id uuid REFERENCES structures(id);

-- Migrate existing data
UPDATE prescripteurs p
SET structure_id = s.id
FROM structures s
WHERE p.structure = s.name;

-- 4. Add structure_id FK to jeunes
ALTER TABLE jeunes ADD COLUMN structure_id uuid REFERENCES structures(id);

-- Migrate: each jeune inherits their prescripteur's structure
UPDATE jeunes j
SET structure_id = p.structure_id
FROM prescripteurs p
WHERE j.prescripteur_id = p.id;

-- 5. Indexes for structure-based queries
CREATE INDEX idx_prescripteurs_structure_id ON prescripteurs(structure_id);
CREATE INDEX idx_jeunes_structure_id ON jeunes(structure_id);
