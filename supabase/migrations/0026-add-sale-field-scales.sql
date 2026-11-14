-- Ampliação visual dos campos de registro de vendas (data, valor e observação).
BEGIN;

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS field_scale_date numeric(3,1) NOT NULL DEFAULT 1.2,
  ADD COLUMN IF NOT EXISTS field_scale_value numeric(3,1) NOT NULL DEFAULT 1.2,
  ADD COLUMN IF NOT EXISTS field_scale_observations numeric(3,1) NOT NULL DEFAULT 1.2;

ALTER TABLE public.company_settings
  DROP CONSTRAINT IF EXISTS company_settings_scale_check,
  ADD CONSTRAINT company_settings_scale_check CHECK (
    field_scale_date IN (1.2, 1.5, 2.0, 2.5) AND
    field_scale_value IN (1.2, 1.5, 2.0, 2.5) AND
    field_scale_observations IN (1.2, 1.5, 2.0, 2.5)
  );

COMMIT;
