-- Move identity verification from prescripteurs to jeunes
ALTER TABLE prescripteurs
  DROP COLUMN IF EXISTS identity_verified,
  DROP COLUMN IF EXISTS veriff_session_id;

ALTER TABLE jeunes
  ADD COLUMN IF NOT EXISTS identity_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS veriff_session_id text;
