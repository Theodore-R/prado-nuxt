-- Add archived_at column to actions table
ALTER TABLE actions ADD COLUMN IF NOT EXISTS archived_at timestamptz;

COMMENT ON COLUMN actions.archived_at IS 'Timestamp when action was archived. NULL = active.';
