-- Configuração de distribuidoras e regras usadas na importação XML.
BEGIN;

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS distributor_config jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'company_settings_distributor_config_array'
      AND conrelid = 'public.company_settings'::regclass
  ) THEN
    ALTER TABLE public.company_settings
      ADD CONSTRAINT company_settings_distributor_config_array
      CHECK (jsonb_typeof(distributor_config) = 'array');
  END IF;
END;
$$;

COMMIT;
