-- ============================================================================
-- ADR 0013 — autenticação própria, multiempresa e multi-loja
-- Aplica-se a bancos que já possuem o schema ADR 0012.
-- Aplicar em uma janela de manutenção, após backup completo do Supabase.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Tenant tables
-- ----------------------------------------------------------------------------

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  role text not null check (role in ('admin', 'merchant')),
  name text not null,
  login text not null unique,
  email text not null unique,
  password_hash text not null,
  active boolean not null default true,
  last_store_id uuid references public.stores (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_login_format check (login ~ '^[a-z]{4,}$')
);

create unique index if not exists users_one_admin_per_company_idx
  on public.users (company_id)
  where role = 'admin';

create table if not exists public.user_stores (
  user_id uuid not null references public.users (id) on delete cascade,
  store_id uuid not null references public.stores (id) on delete cascade,
  primary key (user_id, store_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  token_hash text not null unique,
  store_id uuid references public.stores (id) on delete set null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.company_settings (
  company_id uuid primary key references public.companies (id) on delete cascade,
  theme_mode text not null default 'system'
    check (theme_mode in ('system', 'light', 'dark')),
  timezone text not null default 'America/Recife',
  recent_sales_count integer not null default 4
    check (recent_sales_count in (0, 2, 4, 6, 8)),
  auto_focus_sale_input boolean not null default true,
  auto_focus_sale_input_delay integer not null default 60
    check (auto_focus_sale_input_delay >= 5),
  pix_key text not null default '',
  pix_name text not null default '',
  pix_bank text not null default '',
  pix_city text not null default '',
  updated_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Tenant columns on existing business tables
-- ----------------------------------------------------------------------------

alter table public.categories add column if not exists company_id uuid references public.companies (id);
alter table public.brands add column if not exists company_id uuid references public.companies (id);
alter table public.suppliers add column if not exists company_id uuid references public.companies (id);
alter table public.units_of_measure add column if not exists company_id uuid references public.companies (id);
alter table public.products add column if not exists company_id uuid references public.companies (id);
alter table public.product_barcodes add column if not exists company_id uuid references public.companies (id);
alter table public.services add column if not exists company_id uuid references public.companies (id);
alter table public.stock_movements add column if not exists company_id uuid references public.companies (id);
alter table public.sales add column if not exists company_id uuid references public.companies (id);
alter table public.sales add column if not exists store_id uuid references public.stores (id);
alter table public.sale_items add column if not exists company_id uuid references public.companies (id);
alter table public.monthly_sales add column if not exists company_id uuid references public.companies (id);
alter table public.monthly_sales add column if not exists store_id uuid references public.stores (id);
alter table public.payables add column if not exists company_id uuid references public.companies (id);
alter table public.invoices add column if not exists company_id uuid references public.companies (id);
alter table public.medicine_search_history add column if not exists company_id uuid references public.companies (id);

-- ----------------------------------------------------------------------------
-- Legacy data: create and assign one tenant, one default store and settings.
-- Existing empty installations are left untouched.
-- ----------------------------------------------------------------------------

do $$
declare
  v_has_data boolean;
  v_company_id uuid;
  v_store_id uuid;
begin
  if exists (select 1 from public.companies) then
    return;
  end if;

  select (
    exists (select 1 from public.categories)
    or exists (select 1 from public.brands)
    or exists (select 1 from public.suppliers)
    or exists (select 1 from public.units_of_measure)
    or exists (select 1 from public.products)
    or exists (select 1 from public.services)
    or exists (select 1 from public.sales)
    or exists (select 1 from public.monthly_sales)
    or exists (select 1 from public.stock_movements)
    or exists (select 1 from public.payables)
    or exists (select 1 from public.invoices)
    or exists (select 1 from public.medicine_search_history)
  ) into v_has_data;

  if not v_has_data then
    return;
  end if;

  insert into public.companies (name)
  values ('Empresa legada')
  returning id into v_company_id;

  insert into public.stores (company_id, name)
  values (v_company_id, 'Loja principal')
  returning id into v_store_id;

  insert into public.company_settings (company_id)
  values (v_company_id);

  update public.categories set company_id = v_company_id where company_id is null;
  update public.brands set company_id = v_company_id where company_id is null;
  update public.suppliers set company_id = v_company_id where company_id is null;
  update public.units_of_measure set company_id = v_company_id where company_id is null;
  update public.products set company_id = v_company_id where company_id is null;
  update public.product_barcodes set company_id = v_company_id where company_id is null;
  update public.services set company_id = v_company_id where company_id is null;
  update public.stock_movements set company_id = v_company_id where company_id is null;
  update public.sales set company_id = v_company_id, store_id = v_store_id where company_id is null;
  update public.sale_items si
     set company_id = s.company_id
    from public.sales s
   where si.sale_id = s.id
     and si.company_id is null;
  update public.monthly_sales set company_id = v_company_id, store_id = v_store_id where company_id is null;
  update public.payables set company_id = v_company_id where company_id is null;
  update public.invoices set company_id = v_company_id where company_id is null;
  update public.medicine_search_history set company_id = v_company_id where company_id is null;
end;
$$;

-- ----------------------------------------------------------------------------
-- Constraints and indexes
-- ----------------------------------------------------------------------------

alter table public.categories alter column company_id set not null;
alter table public.brands alter column company_id set not null;
alter table public.suppliers alter column company_id set not null;
alter table public.units_of_measure alter column company_id set not null;
alter table public.products alter column company_id set not null;
alter table public.product_barcodes alter column company_id set not null;
alter table public.services alter column company_id set not null;
alter table public.stock_movements alter column company_id set not null;
alter table public.sales alter column company_id set not null;
alter table public.sales alter column store_id set not null;
alter table public.sale_items alter column company_id set not null;
alter table public.monthly_sales alter column company_id set not null;
alter table public.monthly_sales alter column store_id set not null;
alter table public.payables alter column company_id set not null;
alter table public.invoices alter column company_id set not null;
alter table public.medicine_search_history alter column company_id set not null;

alter table public.categories drop constraint if exists categories_name_key;
alter table public.brands drop constraint if exists brands_name_key;
alter table public.suppliers drop constraint if exists suppliers_name_key;
alter table public.units_of_measure drop constraint if exists units_of_measure_abbreviation_key;
alter table public.products drop constraint if exists products_internal_code_key;
alter table public.products drop constraint if exists products_reference_key;
alter table public.product_barcodes drop constraint if exists product_barcodes_barcode_key;
alter table public.services drop constraint if exists services_internal_code_key;
alter table public.services drop constraint if exists services_reference_key;
alter table public.monthly_sales drop constraint if exists monthly_sales_year_month_key;
alter table public.payables drop constraint if exists payables_supplier_name_document_key;
alter table public.medicine_search_history drop constraint if exists medicine_search_history_normalized_query_key;

create unique index if not exists categories_company_id_name_uq
  on public.categories (company_id, lower(name));
create unique index if not exists brands_company_id_name_uq
  on public.brands (company_id, lower(name));
create unique index if not exists suppliers_company_id_name_uq
  on public.suppliers (company_id, lower(name));
create unique index if not exists units_of_measure_company_id_abbreviation_uq
  on public.units_of_measure (company_id, upper(abbreviation));
create unique index if not exists products_company_id_internal_code_uq
  on public.products (company_id, lower(internal_code))
  where internal_code is not null;
create unique index if not exists products_company_id_reference_uq
  on public.products (company_id, lower(reference))
  where reference is not null;
create unique index if not exists product_barcodes_company_id_barcode_uq
  on public.product_barcodes (company_id, barcode);
create unique index if not exists services_company_id_internal_code_uq
  on public.services (company_id, lower(internal_code))
  where internal_code is not null;
create unique index if not exists services_company_id_reference_uq
  on public.services (company_id, lower(reference))
  where reference is not null;
create unique index if not exists monthly_sales_company_id_store_id_year_month_uq
  on public.monthly_sales (company_id, store_id, year, month);
create unique index if not exists payables_company_id_supplier_document_uq
  on public.payables (company_id, lower(supplier_name), lower(document));
create unique index if not exists medicine_search_history_company_id_normalized_query_uq
  on public.medicine_search_history (company_id, normalized_query);

-- Replace global default flags with company-scoped rules.
drop index if exists public.categories_single_default_idx;
drop index if exists public.brands_single_default_idx;
drop index if exists public.suppliers_single_default_idx;
drop index if exists public.units_of_measure_single_default_idx;

create unique index if not exists categories_company_id_single_default_idx
  on public.categories (company_id)
  where is_default;
create unique index if not exists brands_company_id_single_default_idx
  on public.brands (company_id)
  where is_default;
create unique index if not exists suppliers_company_id_single_default_idx
  on public.suppliers (company_id)
  where is_default;
create unique index if not exists units_of_measure_company_id_single_default_idx
  on public.units_of_measure (company_id)
  where is_default;

-- Query indexes.
create index if not exists stores_company_id_idx on public.stores (company_id);
create index if not exists users_company_id_idx on public.users (company_id);
create index if not exists users_login_idx on public.users (login);
create index if not exists users_email_idx on public.users (email);
create index if not exists sessions_token_hash_idx on public.sessions (token_hash);
create index if not exists sessions_user_id_expires_at_idx on public.sessions (user_id, expires_at desc);
create index if not exists sales_company_id_store_id_sale_date_idx
  on public.sales (company_id, store_id, sale_date desc);
create index if not exists monthly_sales_company_id_store_id_year_month_idx
  on public.monthly_sales (company_id, store_id, year, month desc);
create index if not exists payables_company_id_due_date_idx on public.payables (company_id, due_date desc);
create index if not exists products_company_id_name_idx on public.products (company_id, lower(name));
create index if not exists services_company_id_name_idx on public.services (company_id, lower(name));
create index if not exists stock_movements_company_id_moved_at_idx
  on public.stock_movements (company_id, moved_at desc);

-- ----------------------------------------------------------------------------
-- Store limit and updated_at triggers
-- ----------------------------------------------------------------------------

create or replace function public.enforce_max_stores_per_company()
returns trigger
language plpgsql
as $$
begin
  -- Serializa inserções na empresa para evitar duas transações criarem 3 lojas.
  perform 1 from public.companies where id = new.company_id for update;

  if (
    select count(*)
    from public.stores
    where company_id = new.company_id
  ) >= 2 then
    raise exception 'A company can have at most 2 stores';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_max_stores_per_company on public.stores;
create trigger enforce_max_stores_per_company
before insert on public.stores
for each row execute function public.enforce_max_stores_per_company();

drop trigger if exists set_updated_at on public.companies;
create trigger set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.stores;
create trigger set_updated_at before update on public.stores
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.company_settings;
create trigger set_updated_at before update on public.company_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Atomic bootstrap for first admin/company.
-- Existing tenant with no users is claimed; otherwise a fresh company is made.
-- ----------------------------------------------------------------------------

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
as $$
declare
  v_company_id uuid;
  v_store_id uuid;
  v_user_id uuid;
  v_is_new boolean := false;
  v_category_id uuid;
  v_brand_id uuid;
  v_supplier_id uuid;
  v_unit_id uuid;
begin
  if exists (select 1 from public.users) then
    raise exception 'Bootstrap already completed';
  end if;

  select id into v_company_id
  from public.companies
  order by created_at asc
  limit 1
  for update;

  if v_company_id is null then
    insert into public.companies (name)
    values (nullif(trim(p_company_name), ''))
    returning id into v_company_id;
    v_is_new := true;
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

  if exists (select 1 from public.users where company_id = v_company_id) then
    raise exception 'Company already has users';
  end if;

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

  -- Seeds for a newly created company. Existing legacy data is already tenant-scoped.
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

  -- Defensive backfill for pre-ADR-0013 rows.
  update public.sales set store_id = v_store_id where store_id is null;
  update public.monthly_sales set store_id = v_store_id where store_id is null;

  return jsonb_build_object(
    'companyId', v_company_id,
    'storeId', v_store_id,
    'userId', v_user_id
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- Least-privilege grants
-- ----------------------------------------------------------------------------

revoke all on public.companies from anon, authenticated;
revoke all on public.stores from anon, authenticated;
revoke all on public.users from anon, authenticated;
revoke all on public.user_stores from anon, authenticated;
revoke all on public.sessions from anon, authenticated;
revoke all on public.company_settings from anon, authenticated;

alter table public.companies enable row level security;
alter table public.stores enable row level security;
alter table public.users enable row level security;
alter table public.user_stores enable row level security;
alter table public.sessions enable row level security;
alter table public.company_settings enable row level security;

grant select, insert, update, delete on public.companies to service_role;
grant select, insert, update, delete on public.stores to service_role;
grant select, insert, update, delete on public.users to service_role;
grant select, insert, update, delete on public.user_stores to service_role;
grant select, insert, update, delete on public.sessions to service_role;
grant select, insert, update, delete on public.company_settings to service_role;

commit;
