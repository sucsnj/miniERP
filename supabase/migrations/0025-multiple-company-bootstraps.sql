-- Permite criar novos tenants/admins de empresas depois do bootstrap inicial.
create or replace function public.bootstrap_company_admin(
  p_company_name text,
  p_first_store_name text,
  p_admin_name text,
  p_login text,
  p_email text,
  p_password_hash text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_company_id uuid;
  v_store_id uuid;
  v_user_id uuid;
begin
  -- Serializa bootstraps concorrentes (inclusive para preservar o tenant legado).
  perform pg_advisory_xact_lock(727265);

  if not exists (select 1 from public.users) then
    select id into v_company_id
    from public.companies
    order by created_at asc
    limit 1
    for update;
  end if;

  if v_company_id is null then
    insert into public.companies (name)
    values (nullif(trim(p_company_name), ''))
    returning id into v_company_id;
  end if;

  if not exists (select 1 from public.stores where company_id = v_company_id) then
    insert into public.stores (company_id, name)
    values (v_company_id, nullif(trim(p_first_store_name), ''))
    returning id into v_store_id;
  else
    select id into v_store_id
    from public.stores
    where company_id = v_company_id
    order by created_at asc
    limit 1;
  end if;

  insert into public.company_settings (company_id)
  values (v_company_id)
  on conflict (company_id) do nothing;

  insert into public.users (
    company_id,
    role,
    name,
    login,
    email,
    password_hash,
    last_store_id
  ) values (
    v_company_id,
    'admin',
    nullif(trim(p_admin_name), ''),
    lower(trim(p_login)),
    lower(trim(p_email)),
    p_password_hash,
    v_store_id
  )
  returning id into v_user_id;

  insert into public.categories (company_id, name, description, is_default, is_system)
  values (v_company_id, 'Geral', 'Categoria padrão', true, true)
  on conflict (company_id, lower(name)) do update set is_default = true, is_system = true;

  insert into public.brands (company_id, name, is_default, is_system)
  values (v_company_id, 'Outros', true, true)
  on conflict (company_id, lower(name)) do update set is_default = true, is_system = true;

  insert into public.suppliers (company_id, name, is_default, is_system)
  values (v_company_id, 'Sem fornecedor', true, true)
  on conflict (company_id, lower(name)) do update set is_default = true, is_system = true;

  insert into public.units_of_measure (company_id, abbreviation, description, is_default, is_system)
  values
    (v_company_id, 'UN', 'Unidade', true, true),
    (v_company_id, 'DZ', 'Dúzia', false, true),
    (v_company_id, 'PR', 'Par', false, true),
    (v_company_id, 'KG', 'Quilograma', false, true),
    (v_company_id, 'G', 'Grama', false, true),
    (v_company_id, 'MG', 'Miligrama', false, true),
    (v_company_id, 'MCG', 'Micrograma', false, true),
    (v_company_id, 'L', 'Litro', false, true),
    (v_company_id, 'ML', 'Mililitro', false, true),
    (v_company_id, 'MT', 'Metro', false, true),
    (v_company_id, 'CX', 'Caixa', false, true),
    (v_company_id, 'PC', 'Peça', false, true),
    (v_company_id, 'SM', 'Saco', false, true),
    (v_company_id, 'TU', 'Tubo', false, true),
    (v_company_id, 'RL', 'Rolo', false, true),
    (v_company_id, 'CD', 'Caixa Display', false, true),
    (v_company_id, 'CJ', 'Conjunto', false, true),
    (v_company_id, 'FG', 'Fardo', false, true),
    (v_company_id, 'LT', 'Lote', false, true),
    (v_company_id, 'PK', 'Pacote', false, true),
    (v_company_id, 'SR', 'Serviço', false, true)
  on conflict (company_id, upper(abbreviation)) do update
    set description = excluded.description,
        is_system = true,
        is_default = excluded.is_default;

  return jsonb_build_object(
    'companyId', v_company_id,
    'storeId', v_store_id,
    'userId', v_user_id
  );
end;
$$;
