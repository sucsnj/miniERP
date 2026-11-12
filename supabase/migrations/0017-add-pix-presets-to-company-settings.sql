-- Adiciona presets completos de PIX compartilhados pela empresa.
alter table public.company_settings
  add column if not exists pix_presets jsonb not null default '[]'::jsonb;

comment on column public.company_settings.pix_presets is
  'Lista de presets PIX completos para preenchimento rápido: [{id,label,pixKey,pixName,pixBank,pixCity}].';

-- Preserva o PIX atual como primeiro preset após a migração.
update public.company_settings
set pix_presets = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid(),
    'label', 'PIX atual',
    'pixKey', trim(pix_key),
    'pixName', trim(pix_name),
    'pixBank', trim(pix_bank),
    'pixCity', trim(pix_city)
  )
)
where pix_presets = '[]'::jsonb
  and (
    trim(pix_key) <> ''
    or trim(pix_name) <> ''
    or trim(pix_bank) <> ''
    or trim(pix_city) <> ''
  );
