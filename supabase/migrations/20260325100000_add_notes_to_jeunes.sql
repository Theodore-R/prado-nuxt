-- Add internal notes field to jeunes table
ALTER TABLE jeunes ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

COMMENT ON COLUMN jeunes.notes IS 'Private internal notes from prescripteur about this youth.';
