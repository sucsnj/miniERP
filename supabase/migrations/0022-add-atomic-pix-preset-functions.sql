-- Operações atômicas de presets PIX por empresa.
create or replace function public.upsert_pix_preset(p_company_id uuid, p_preset jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_current jsonb;
  v_existing_index integer;
  v_new_presets jsonb;
begin
  insert into public.company_settings (company_id)
  values (p_company_id)
  on conflict (company_id) do nothing;

  select pix_presets
  into v_current
  from public.company_settings
  where company_id = p_company_id
  for update;

  if v_current is null or jsonb_typeof(v_current) <> 'array' then
    v_current := '[]'::jsonb;
  end if;

  select t.idx
  into v_existing_index
  from jsonb_array_elements(v_current) with ordinality as t(preset, idx)
  where t.preset->>'id' = p_preset->>'id'
     or (
       t.preset->>'pixKey' = p_preset->>'pixKey'
       and t.preset->>'pixName' = p_preset->>'pixName'
       and t.preset->>'pixBank' = p_preset->>'pixBank'
       and t.preset->>'pixCity' = p_preset->>'pixCity'
     )
  limit 1;

  if v_existing_index is not null then
    v_new_presets := jsonb_set(v_current, array[(v_existing_index - 1)::text], p_preset, false);
  else
    v_new_presets := jsonb_build_array(p_preset) || v_current;
  end if;

  if v_existing_index is null and jsonb_array_length(v_new_presets) > 20 then
    raise exception 'Limite de 20 presets atingido.';
  end if;

  update public.company_settings
  set pix_presets = v_new_presets
  where company_id = p_company_id;

  return v_new_presets;
end;
$$;

create or replace function public.delete_pix_preset(p_company_id uuid, p_preset_id text)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_current jsonb;
  v_new_presets jsonb;
begin
  select pix_presets
  into v_current
  from public.company_settings
  where company_id = p_company_id
  for update;

  if v_current is null or jsonb_typeof(v_current) <> 'array' then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(preset), '[]'::jsonb)
  into v_new_presets
  from jsonb_array_elements(v_current) as preset
  where preset->>'id' <> p_preset_id;

  update public.company_settings
  set pix_presets = v_new_presets
  where company_id = p_company_id;

  return v_new_presets;
end;
$$;
