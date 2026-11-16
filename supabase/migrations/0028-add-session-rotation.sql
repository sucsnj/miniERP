-- Reforço de sessões: rotação do token/hash e 7 dias de graça para reuso.
BEGIN;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS previous_token_hash text,
  ADD COLUMN IF NOT EXISTS previous_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_rotated_at timestamptz;

UPDATE public.sessions
SET last_rotated_at = COALESCE(last_rotated_at, created_at, now())
WHERE last_rotated_at IS NULL;

CREATE INDEX IF NOT EXISTS sessions_previous_token_hash_idx
  ON public.sessions (previous_token_hash)
  WHERE previous_token_hash IS NOT NULL;

COMMIT;
