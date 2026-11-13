-- Desativação segura de loja: ao menos uma ativa; vendedores cuja única
-- loja ativa é a desativada são movidos para a outra loja ativa.
create or replace function public.deactivate_store(p_company_id uuid, p_store_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_replacement_id uuid;
begin
  -- Serializa desativações concorrentes no mesmo tenant.
  perform pg_advisory_xact_lock(hashtext(p_company_id::text));

  select id
  into v_replacement_id
  from public.stores
  where company_id = p_company_id
    and active
    and id <> p_store_id
  order by created_at, id
  limit 1
  for update;

  if v_replacement_id is null then
    raise exception 'A empresa precisa manter ao menos uma loja ativa.';
  end if;

  create temporary table if not exists pg_temp.deactivation_affected_merchants (
    user_id uuid primary key
  ) on commit drop;
  truncate pg_temp.deactivation_affected_merchants;

  with affected as (
    select u.id
    from public.users u
    join public.user_stores us on us.user_id = u.id
    join public.stores s on s.id = us.store_id
    where u.company_id = p_company_id
      and u.role = 'merchant'
      and u.active
      and s.active
    group by u.id
    having every(s.id = p_store_id)
  )
  insert into pg_temp.deactivation_affected_merchants (user_id)
  select id from affected;

  delete from public.user_stores us
  using pg_temp.deactivation_affected_merchants affected
  where us.user_id = affected.user_id
    and us.store_id = p_store_id;

  insert into public.user_stores (user_id, store_id)
  select user_id, v_replacement_id
  from pg_temp.deactivation_affected_merchants
  on conflict (user_id, store_id) do nothing;

  update public.sessions s
  set store_id = v_replacement_id
  where s.store_id = p_store_id;

  update public.users u
  set last_store_id = v_replacement_id
  from pg_temp.deactivation_affected_merchants affected
  where u.id = affected.user_id;

  update public.stores
  set active = false
  where id = p_store_id
    and company_id = p_company_id;
end;
$$;
