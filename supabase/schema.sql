-- ============================================================================
-- ERP — Supabase schema (single public schema)
-- Apply this file in the Supabase SQL Editor.
-- Decisions: ADR 0012 (docs/adr/0012-migracao-sqlite-para-supabase.md)
--             ADR 0013 (docs/adr/0013-autenticacao-multiempresa-multiloja.md)
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- Shared helpers
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

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
  avatar_url text,
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
  auto_consolidation_enabled boolean not null default true,
  auto_consolidation_day integer not null default 1
    check (auto_consolidation_day between 1 and 28),
  pix_key text not null default '',
  pix_name text not null default '',
  pix_bank text not null default '',
  pix_city text not null default '',
  pix_presets jsonb not null default '[]'::jsonb,
  updated_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.enforce_max_stores_per_company()
returns trigger
language plpgsql
as $$
begin
  perform 1 from public.companies where id = new.company_id for update;

  if (select count(*) from public.stores where company_id = new.company_id) >= 2 then
    raise exception 'A company can have at most 2 stores';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_max_stores_per_company on public.stores;
create trigger enforce_max_stores_per_company
before insert on public.stores
for each row execute function public.enforce_max_stores_per_company();

-- ----------------------------------------------------------------------------
-- Catalog reference tables
-- ----------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  description text,
  is_default boolean not null default false,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.units_of_measure (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  abbreviation text not null,
  description text,
  is_default boolean not null default false,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Products and services
-- ----------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  description text,
  category_id uuid not null references public.categories (id) on delete restrict,
  base_unit_id uuid not null references public.units_of_measure (id) on delete restrict,
  brand_id uuid not null references public.brands (id) on delete restrict,
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  purchase_price numeric(14, 2) not null default 0,
  profit_margin numeric(14, 2) not null default 0,
  sale_price numeric(14, 2) not null default 0,
  stock integer not null default 0,
  unit_multiplier numeric(14, 3) not null default 1,
  internal_code text,
  reference text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_barcodes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  barcode text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_units (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  unit_id uuid not null references public.units_of_measure (id) on delete restrict,
  unit_multiplier numeric(14, 3) not null default 1,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, unit_id)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  description text,
  category_id uuid not null references public.categories (id) on delete restrict,
  sale_price numeric(14, 2) not null default 0,
  internal_code text,
  reference text,
  duration_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  product_name text not null,
  type text not null check (type in ('IN', 'OUT', 'ADJUST')),
  quantity integer not null,
  final_stock integer not null,
  description text,
  moved_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Sales
-- ----------------------------------------------------------------------------

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  store_id uuid not null references public.stores (id),
  sale_date date not null,
  amount numeric(14, 2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  sale_id uuid not null references public.sales (id) on delete cascade,
  kind text not null check (kind in ('PRODUCT', 'SERVICE')),
  product_id uuid references public.products (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  name text not null,
  quantity numeric(14, 3) not null default 1,
  unit_price numeric(14, 2) not null default 0,
  subtotal numeric(14, 2) not null default 0,
  internal_code text,
  reference text,
  created_at timestamptz not null default now(),
  constraint sale_items_catalog_link_check check (
    (product_id is not null and service_id is null and kind = 'PRODUCT')
    or (service_id is not null and product_id is null and kind = 'SERVICE')
    or (product_id is null and service_id is null)
  )
);

create table if not exists public.monthly_sales (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  store_id uuid not null references public.stores (id),
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year between 1900 and 2200),
  average_ticket numeric(14, 2) not null default 0,
  average_customers numeric(14, 2) not null default 0,
  average_special_customers numeric(14, 2) not null default 0,
  best_day date,
  best_day_amount numeric(14, 2) not null default 0,
  largest_sale numeric(14, 2) not null default 0,
  sales_count integer not null default 0,
  special_sales_count integer not null default 0,
  total numeric(14, 2) not null default 0,
  special_total numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, store_id, year, month)
);

-- ----------------------------------------------------------------------------
-- Payables and invoices
-- ----------------------------------------------------------------------------

create table if not exists public.payables (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  supplier_name text not null,
  amount numeric(14, 2) not null,
  due_date date not null,
  document text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID')),
  bank_notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  supplier_name text not null,
  access_key text not null unique,
  issue_date date not null,
  amount numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Medicine table search history
-- ----------------------------------------------------------------------------

create table if not exists public.medicine_search_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  query text not null,
  normalized_query text not null,
  results jsonb not null default '[]'::jsonb,
  result_count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

create unique index if not exists categories_company_id_name_uq
  on public.categories (company_id, lower(name));
create unique index if not exists brands_company_id_name_uq
  on public.brands (company_id, lower(name));
create unique index if not exists suppliers_company_id_name_uq
  on public.suppliers (company_id, lower(name));
create unique index if not exists units_of_measure_company_id_abbreviation_uq
  on public.units_of_measure (company_id, upper(abbreviation));
create unique index if not exists categories_company_id_single_default_idx
  on public.categories (company_id) where is_default;
create unique index if not exists brands_company_id_single_default_idx
  on public.brands (company_id) where is_default;
create unique index if not exists suppliers_company_id_single_default_idx
  on public.suppliers (company_id) where is_default;
create unique index if not exists units_of_measure_company_id_single_default_idx
  on public.units_of_measure (company_id) where is_default;
create unique index if not exists products_company_id_internal_code_uq
  on public.products (company_id, lower(internal_code)) where internal_code is not null;
create unique index if not exists products_company_id_reference_uq
  on public.products (company_id, lower(reference)) where reference is not null;
create unique index if not exists product_barcodes_company_id_barcode_uq
  on public.product_barcodes (company_id, barcode);
create unique index if not exists services_company_id_internal_code_uq
  on public.services (company_id, lower(internal_code)) where internal_code is not null;
create unique index if not exists services_company_id_reference_uq
  on public.services (company_id, lower(reference)) where reference is not null;
create unique index if not exists payables_company_id_supplier_document_uq
  on public.payables (company_id, lower(supplier_name), lower(document));
create unique index if not exists medicine_search_history_company_id_normalized_query_uq
  on public.medicine_search_history (company_id, normalized_query);
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

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_brand_id_idx on public.products (brand_id);
create index if not exists products_supplier_id_idx on public.products (supplier_id);
create index if not exists products_base_unit_id_idx on public.products (base_unit_id);
create index if not exists products_active_idx on public.products (active);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index if not exists products_internal_code_trgm_idx on public.products using gin (internal_code gin_trgm_ops);
create index if not exists products_reference_trgm_idx on public.products using gin (reference gin_trgm_ops);

create index if not exists services_category_id_idx on public.services (category_id);
create index if not exists services_name_trgm_idx on public.services using gin (name gin_trgm_ops);
create index if not exists services_internal_code_trgm_idx on public.services using gin (internal_code gin_trgm_ops);

create index if not exists product_barcodes_product_id_idx on public.product_barcodes (product_id);
create index if not exists product_barcodes_barcode_trgm_idx on public.product_barcodes using gin (barcode gin_trgm_ops);

create index if not exists product_units_product_id_idx on public.product_units (product_id);
create index if not exists product_units_unit_id_idx on public.product_units (unit_id);

create index if not exists stock_movements_product_id_idx on public.stock_movements (product_id, moved_at desc);

create index if not exists sales_sale_date_idx on public.sales (sale_date desc);
create index if not exists sale_items_sale_id_idx on public.sale_items (sale_id);
create index if not exists sale_items_product_id_idx on public.sale_items (product_id);
create index if not exists sale_items_service_id_idx on public.sale_items (service_id);

create index if not exists payables_due_date_idx on public.payables (due_date desc);
create index if not exists payables_status_idx on public.payables (status);

create index if not exists invoices_issue_date_idx on public.invoices (issue_date desc);
create index if not exists invoices_amount_idx on public.invoices (amount);

create index if not exists medicine_search_history_updated_at_idx
  on public.medicine_search_history (updated_at desc);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------

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

drop trigger if exists set_updated_at on public.categories;
create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.brands;
create trigger set_updated_at before update on public.brands
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.suppliers;
create trigger set_updated_at before update on public.suppliers
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.units_of_measure;
create trigger set_updated_at before update on public.units_of_measure
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.services;
create trigger set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.sales;
create trigger set_updated_at before update on public.sales
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.monthly_sales;
create trigger set_updated_at before update on public.monthly_sales
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.payables;
create trigger set_updated_at before update on public.payables
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Atomic bootstrap for first admin/company
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

-- ----------------------------------------------------------------------------
-- RPC: stock movements
-- ----------------------------------------------------------------------------

create or replace function public.apply_stock_movement(
  p_company_id uuid,
  p_product_id uuid,
  p_type text,
  p_quantity numeric,
  p_description text default null
)
returns public.stock_movements
language plpgsql
as $$
declare
  v_product public.products;
  v_type text;
  v_quantity numeric;
  v_final_stock integer;
  v_movement public.stock_movements;
begin
  v_type := upper(trim(coalesce(p_type, '')));
  v_quantity := p_quantity;

  if v_type not in ('IN', 'OUT', 'ADJUST') then
    raise exception 'Invalid stock movement type: %', p_type;
  end if;

  if v_quantity is null
     or v_quantity = 'NaN'::numeric
     or v_quantity <> trunc(v_quantity) then
    raise exception 'Stock movement quantity must be an integer';
  end if;

  if v_type in ('IN', 'OUT') and v_quantity <= 0 then
    raise exception 'Quantity must be greater than zero for IN/OUT movements';
  end if;

  if v_type = 'ADJUST' and v_quantity = 0 then
    raise exception 'Quantity cannot be zero for ADJUST movements';
  end if;

  select * into v_product
  from public.products
  where id = p_product_id
    and company_id = p_company_id
  for update;

  if not found then
    raise exception 'Product not found for stock movement: %', p_product_id;
  end if;

  v_final_stock := case
    when v_type = 'OUT' then v_product.stock - v_quantity::integer
    else v_product.stock + v_quantity::integer
  end;

  update public.products
  set stock = v_final_stock,
      updated_at = now()
  where id = p_product_id
    and company_id = p_company_id;

  insert into public.stock_movements (
    company_id,
    product_id,
    product_name,
    type,
    quantity,
    final_stock,
    description
  ) values (
    p_company_id,
    p_product_id,
    v_product.name,
    v_type,
    v_quantity::integer,
    v_final_stock,
    nullif(trim(coalesce(p_description, '')), '')
  )
  returning * into v_movement;

  return v_movement;
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: sales
-- ----------------------------------------------------------------------------

create or replace function public.create_sale(
  p_company_id uuid,
  p_store_id uuid,
  p_sale_date date,
  p_amount numeric,
  p_notes text default null,
  p_created_at timestamptz default null,
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_sale_id uuid;
  v_item jsonb;
  v_kind text;
  v_product_id uuid;
  v_service_id uuid;
  v_quantity numeric;
  v_unit_price numeric;
begin
  if p_sale_date is null then
    raise exception 'Sale date is required';
  end if;

  if p_amount is null then
    raise exception 'Sale amount is required';
  end if;

  if not exists (
    select 1
    from public.stores
    where id = p_store_id and company_id = p_company_id
  ) then
    raise exception 'Store not found for company: %', p_store_id;
  end if;

  insert into public.sales (company_id, store_id, sale_date, amount, notes, created_at)
  values (
    p_company_id,
    p_store_id,
    p_sale_date,
    p_amount,
    nullif(trim(coalesce(p_notes, '')), ''),
    coalesce(p_created_at, now())
  )
  returning id into v_sale_id;

  for v_item in
    select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_kind := upper(trim(coalesce(v_item->>'kind', '')));
    v_product_id := nullif(v_item->>'productId', '')::uuid;
    v_service_id := nullif(v_item->>'serviceId', '')::uuid;
    v_quantity := coalesce((v_item->>'quantity')::numeric, 1);
    v_unit_price := coalesce((v_item->>'unitPrice')::numeric, 0);

    if v_kind not in ('PRODUCT', 'SERVICE') then
      raise exception 'Invalid sale item kind: %', v_kind;
    end if;

    if v_kind = 'PRODUCT'
       and v_product_id is not null
       and not exists (select 1 from public.products where id = v_product_id and company_id = p_company_id) then
      raise exception 'Product not found for company: %', v_product_id;
    end if;

    if v_kind = 'SERVICE'
       and v_service_id is not null
       and not exists (select 1 from public.services where id = v_service_id and company_id = p_company_id) then
      raise exception 'Service not found for company: %', v_service_id;
    end if;

    insert into public.sale_items (
      company_id,
      sale_id,
      kind,
      product_id,
      service_id,
      name,
      quantity,
      unit_price,
      subtotal,
      internal_code,
      reference
    ) values (
      p_company_id,
      v_sale_id,
      v_kind,
      case when v_kind = 'PRODUCT' then v_product_id else null end,
      case when v_kind = 'SERVICE' then v_service_id else null end,
      coalesce(v_item->>'name', ''),
      v_quantity,
      v_unit_price,
      coalesce((v_item->>'subtotal')::numeric, round(v_unit_price * v_quantity, 2)),
      nullif(trim(coalesce(v_item->>'internalCode', '')), ''),
      nullif(trim(coalesce(v_item->>'reference', '')), '')
    );

    if v_kind = 'PRODUCT' and v_product_id is not null and v_quantity <> 0 then
      perform public.apply_stock_movement(
        p_company_id,
        v_product_id,
        'OUT',
        abs(v_quantity),
        format('Sale %s - sale', v_sale_id)
      );
    end if;
  end loop;

  return v_sale_id;
end;
$$;

create or replace function public.update_sale(
  p_company_id uuid,
  p_store_id uuid,
  p_id uuid,
  p_sale_date date,
  p_amount numeric,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns void
language plpgsql
as $$
declare
  v_old_map jsonb;
  v_new_map jsonb;
  v_key text;
  v_old_quantity numeric;
  v_new_quantity numeric;
  v_item jsonb;
  v_kind text;
  v_product_id uuid;
  v_service_id uuid;
  v_quantity numeric;
  v_unit_price numeric;
begin
  if p_sale_date is null then
    raise exception 'Sale date is required';
  end if;

  if p_amount is null then
    raise exception 'Sale amount is required';
  end if;

  if not exists (
    select 1 from public.sales where id = p_id and company_id = p_company_id and store_id = p_store_id
  ) then
    raise exception 'Sale not found: %', p_id;
  end if;

  select coalesce(jsonb_object_agg(product_id::text, total), '{}'::jsonb)
  into v_old_map
  from (
    select product_id, sum(quantity) as total
    from public.sale_items
    where sale_id = p_id
      and company_id = p_company_id
      and kind = 'PRODUCT'
      and product_id is not null
    group by product_id
  ) old_items;

  select coalesce(jsonb_object_agg(product_id::text, total), '{}'::jsonb)
  into v_new_map
  from (
    select nullif(item->>'productId', '')::uuid as product_id,
           sum(coalesce((item->>'quantity')::numeric, 0)) as total
    from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) item
    where upper(trim(coalesce(item->>'kind', ''))) = 'PRODUCT'
      and nullif(item->>'productId', '') is not null
    group by 1
  ) new_items;

  update public.sales
  set sale_date = p_sale_date,
      amount = p_amount,
      notes = nullif(trim(coalesce(p_notes, '')), ''),
      updated_at = now()
  where id = p_id
    and company_id = p_company_id
    and store_id = p_store_id;

  delete from public.sale_items where sale_id = p_id and company_id = p_company_id;

  for v_item in
    select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_kind := upper(trim(coalesce(v_item->>'kind', '')));
    v_product_id := nullif(v_item->>'productId', '')::uuid;
    v_service_id := nullif(v_item->>'serviceId', '')::uuid;
    v_quantity := coalesce((v_item->>'quantity')::numeric, 1);
    v_unit_price := coalesce((v_item->>'unitPrice')::numeric, 0);

    if v_kind not in ('PRODUCT', 'SERVICE') then
      raise exception 'Invalid sale item kind: %', v_kind;
    end if;

    if v_kind = 'PRODUCT'
       and v_product_id is not null
       and not exists (select 1 from public.products where id = v_product_id and company_id = p_company_id) then
      raise exception 'Product not found for company: %', v_product_id;
    end if;

    if v_kind = 'SERVICE'
       and v_service_id is not null
       and not exists (select 1 from public.services where id = v_service_id and company_id = p_company_id) then
      raise exception 'Service not found for company: %', v_service_id;
    end if;

    insert into public.sale_items (
      company_id,
      sale_id,
      kind,
      product_id,
      service_id,
      name,
      quantity,
      unit_price,
      subtotal,
      internal_code,
      reference
    ) values (
      p_company_id,
      p_id,
      v_kind,
      case when v_kind = 'PRODUCT' then v_product_id else null end,
      case when v_kind = 'SERVICE' then v_service_id else null end,
      coalesce(v_item->>'name', ''),
      v_quantity,
      v_unit_price,
      coalesce((v_item->>'subtotal')::numeric, round(v_unit_price * v_quantity, 2)),
      nullif(trim(coalesce(v_item->>'internalCode', '')), ''),
      nullif(trim(coalesce(v_item->>'reference', '')), '')
    );
  end loop;

  for v_key in
    select jsonb_object_keys(v_old_map || v_new_map)
  loop
    v_old_quantity := coalesce((v_old_map->>v_key)::numeric, 0);
    v_new_quantity := coalesce((v_new_map->>v_key)::numeric, 0);

    if v_new_quantity > v_old_quantity then
      perform public.apply_stock_movement(
        p_company_id,
        v_key::uuid,
        'OUT',
        v_new_quantity - v_old_quantity,
        format('Sale %s - stock adjustment', p_id)
      );
    elsif v_new_quantity < v_old_quantity then
      perform public.apply_stock_movement(
        p_company_id,
        v_key::uuid,
        'IN',
        v_old_quantity - v_new_quantity,
        format('Sale %s - stock adjustment', p_id)
      );
    end if;
  end loop;
end;
$$;

create or replace function public.delete_sale(p_company_id uuid, p_store_id uuid, p_id uuid)
  returns void
  language sql
  as $$
    delete from public.sales
    where id = p_id
      and company_id = p_company_id
      and store_id = p_store_id;
  $$;

-- ----------------------------------------------------------------------------
-- RPC: products
-- ----------------------------------------------------------------------------

create or replace function public.create_product(
  p_company_id uuid,
  p_name text,
  p_description text,
  p_category_id uuid,
  p_base_unit_id uuid,
  p_brand_id uuid,
  p_supplier_id uuid,
  p_purchase_price numeric,
  p_profit_margin numeric,
  p_sale_price numeric,
  p_stock integer,
  p_unit_multiplier numeric,
  p_internal_code text,
  p_reference text,
  p_active boolean default true,
  p_barcodes jsonb default '[]'::jsonb,
  p_units jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_product_id uuid;
  v_barcode jsonb;
  v_barcode_code text;
  v_unit jsonb;
  v_unit_id uuid;
  v_has_units boolean := false;
begin
  if p_name is null or trim(p_name) = '' then
    raise exception 'Product name is required';
  end if;

  if not exists (select 1 from public.categories where id = p_category_id and company_id = p_company_id) then
    raise exception 'Category not found for company: %', p_category_id;
  end if;
  if not exists (select 1 from public.units_of_measure where id = p_base_unit_id and company_id = p_company_id) then
    raise exception 'Unit not found for company: %', p_base_unit_id;
  end if;
  if not exists (select 1 from public.brands where id = p_brand_id and company_id = p_company_id) then
    raise exception 'Brand not found for company: %', p_brand_id;
  end if;
  if not exists (select 1 from public.suppliers where id = p_supplier_id and company_id = p_company_id) then
    raise exception 'Supplier not found for company: %', p_supplier_id;
  end if;

  if not exists (select 1 from public.categories where id = p_category_id and company_id = p_company_id) then
    raise exception 'Category not found for company: %', p_category_id;
  end if;
  if not exists (select 1 from public.units_of_measure where id = p_base_unit_id and company_id = p_company_id) then
    raise exception 'Unit not found for company: %', p_base_unit_id;
  end if;
  if not exists (select 1 from public.brands where id = p_brand_id and company_id = p_company_id) then
    raise exception 'Brand not found for company: %', p_brand_id;
  end if;
  if not exists (select 1 from public.suppliers where id = p_supplier_id and company_id = p_company_id) then
    raise exception 'Supplier not found for company: %', p_supplier_id;
  end if;

  insert into public.products (
    company_id,
    name,
    description,
    category_id,
    base_unit_id,
    brand_id,
    supplier_id,
    purchase_price,
    profit_margin,
    sale_price,
    stock,
    unit_multiplier,
    internal_code,
    reference,
    active
  ) values (
    p_company_id,
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    p_category_id,
    p_base_unit_id,
    p_brand_id,
    p_supplier_id,
    coalesce(p_purchase_price, 0),
    coalesce(p_profit_margin, 0),
    coalesce(p_sale_price, 0),
    0,
    coalesce(p_unit_multiplier, 1),
    nullif(trim(coalesce(p_internal_code, '')), ''),
    nullif(trim(coalesce(p_reference, '')), ''),
    coalesce(p_active, true)
  )
  returning id into v_product_id;

  if p_internal_code is null or trim(p_internal_code) = '' then
    update public.products
    set internal_code = v_product_id::text
    where id = v_product_id
      and company_id = p_company_id;
  end if;

  for v_barcode in
    select * from jsonb_array_elements(coalesce(p_barcodes, '[]'::jsonb))
  loop
    v_barcode_code := trim(coalesce(v_barcode->>'barcode', ''));

    if v_barcode_code <> '' then
      insert into public.product_barcodes (company_id, product_id, barcode, is_primary)
      values (
        p_company_id,
        v_product_id,
        v_barcode_code,
        coalesce((v_barcode->>'isPrimary')::boolean, false)
      );
    end if;
  end loop;

  for v_unit in
    select * from jsonb_array_elements(coalesce(p_units, '[]'::jsonb))
  loop
    v_unit_id := nullif(v_unit->>'unitId', '')::uuid;

    if v_unit_id is not null then
      if not exists (select 1 from public.units_of_measure where id = v_unit_id and company_id = p_company_id) then
        raise exception 'Unit not found for company: %', v_unit_id;
      end if;

      insert into public.product_units (
        product_id,
        unit_id,
        unit_multiplier,
        is_primary
      ) values (
        v_product_id,
        v_unit_id,
        coalesce((v_unit->>'unitMultiplier')::numeric, 1),
        coalesce((v_unit->>'isPrimary')::boolean, false)
      )
      on conflict (product_id, unit_id) do update
      set unit_multiplier = excluded.unit_multiplier,
          is_primary = excluded.is_primary;

      v_has_units := true;
    end if;
  end loop;

  if not v_has_units then
    insert into public.product_units (
      product_id,
      unit_id,
      unit_multiplier,
      is_primary
    ) values (
      v_product_id,
      p_base_unit_id,
      coalesce(p_unit_multiplier, 1),
      true
    );
  end if;

  if coalesce(p_stock, 0) > 0 then
    perform public.apply_stock_movement(
      p_company_id,
      v_product_id,
      'IN',
      p_stock,
      'Initial stock via registration'
    );
  end if;

  return v_product_id;
end;
$$;

create or replace function public.update_product(
  p_company_id uuid,
  p_id uuid,
  p_name text,
  p_description text,
  p_category_id uuid,
  p_base_unit_id uuid,
  p_brand_id uuid,
  p_supplier_id uuid,
  p_purchase_price numeric,
  p_profit_margin numeric,
  p_sale_price numeric,
  p_stock integer,
  p_unit_multiplier numeric,
  p_reference text,
  p_active boolean default true,
  p_barcodes jsonb default '[]'::jsonb,
  p_units jsonb default '[]'::jsonb
)
returns void
language plpgsql
as $$
declare
  v_product public.products;
  v_target_stock integer;
  v_barcode jsonb;
  v_barcode_code text;
  v_unit jsonb;
  v_unit_id uuid;
  v_has_units boolean := false;
begin
  select * into v_product
  from public.products
  where id = p_id
    and company_id = p_company_id
  for update;

  if not found then
    raise exception 'Product not found: %', p_id;
  end if;

  if not exists (select 1 from public.categories where id = p_category_id and company_id = p_company_id) then
    raise exception 'Category not found for company: %', p_category_id;
  end if;
  if not exists (select 1 from public.units_of_measure where id = p_base_unit_id and company_id = p_company_id) then
    raise exception 'Unit not found for company: %', p_base_unit_id;
  end if;
  if not exists (select 1 from public.brands where id = p_brand_id and company_id = p_company_id) then
    raise exception 'Brand not found for company: %', p_brand_id;
  end if;
  if not exists (select 1 from public.suppliers where id = p_supplier_id and company_id = p_company_id) then
    raise exception 'Supplier not found for company: %', p_supplier_id;
  end if;

  v_target_stock := coalesce(p_stock, v_product.stock);

  update public.products
  set name = trim(p_name),
      description = nullif(trim(coalesce(p_description, '')), ''),
      category_id = p_category_id,
      base_unit_id = p_base_unit_id,
      brand_id = p_brand_id,
      supplier_id = p_supplier_id,
      purchase_price = coalesce(p_purchase_price, 0),
      profit_margin = coalesce(p_profit_margin, 0),
      sale_price = coalesce(p_sale_price, 0),
      unit_multiplier = coalesce(p_unit_multiplier, 1),
      reference = nullif(trim(coalesce(p_reference, '')), ''),
      active = coalesce(p_active, true),
      updated_at = now()
  where id = p_id
    and company_id = p_company_id;

  if v_target_stock <> v_product.stock then
    perform public.apply_stock_movement(
      p_company_id,
      p_id,
      'ADJUST',
      v_target_stock - v_product.stock,
      'Stock adjustment via registration'
    );
  end if;

  delete from public.product_barcodes where product_id = p_id and company_id = p_company_id;

  for v_barcode in
    select * from jsonb_array_elements(coalesce(p_barcodes, '[]'::jsonb))
  loop
    v_barcode_code := trim(coalesce(v_barcode->>'barcode', ''));

    if v_barcode_code <> '' then
      insert into public.product_barcodes (company_id, product_id, barcode, is_primary)
      values (
        p_company_id,
        p_id,
        v_barcode_code,
        coalesce((v_barcode->>'isPrimary')::boolean, false)
      );
    end if;
  end loop;

  delete from public.product_units where product_id = p_id;

  for v_unit in
    select * from jsonb_array_elements(coalesce(p_units, '[]'::jsonb))
  loop
    v_unit_id := nullif(v_unit->>'unitId', '')::uuid;

    if v_unit_id is not null then
      if not exists (select 1 from public.units_of_measure where id = v_unit_id and company_id = p_company_id) then
        raise exception 'Unit not found for company: %', v_unit_id;
      end if;

      insert into public.product_units (
        product_id,
        unit_id,
        unit_multiplier,
        is_primary
    ) values (
      p_id,
      v_unit_id,
        coalesce((v_unit->>'unitMultiplier')::numeric, 1),
        coalesce((v_unit->>'isPrimary')::boolean, false)
      )
      on conflict (product_id, unit_id) do update
      set unit_multiplier = excluded.unit_multiplier,
          is_primary = excluded.is_primary;

      v_has_units := true;
    end if;
  end loop;

  if not v_has_units then
    insert into public.product_units (
      product_id,
      unit_id,
      unit_multiplier,
      is_primary
    ) values (
      p_id,
      p_base_unit_id,
      coalesce(p_unit_multiplier, 1),
      true
    );
  end if;
end;
$$;

create or replace function public.delete_product(p_company_id uuid, p_id uuid)
returns void
language sql
as $$
  delete from public.products where id = p_id and company_id = p_company_id;
$$;

-- ----------------------------------------------------------------------------
-- RPC: services
-- ----------------------------------------------------------------------------

create or replace function public.create_service(
  p_company_id uuid,
  p_name text,
  p_description text,
  p_category_id uuid,
  p_sale_price numeric,
  p_internal_code text,
  p_reference text,
  p_duration_minutes integer default 0
)
returns uuid
language plpgsql
as $$
declare
  v_service_id uuid;
begin
    if p_name is null or trim(p_name) = '' then
      raise exception 'Service name is required';
    end if;

    if not exists (select 1 from public.categories where id = p_category_id and company_id = p_company_id) then
      raise exception 'Category not found for company: %', p_category_id;
    end if;


    insert into public.services (
      company_id,
      name,
    description,
    category_id,
    sale_price,
    internal_code,
    reference,
    duration_minutes
    ) values (
      p_company_id,
      trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    p_category_id,
    coalesce(p_sale_price, 0),
    nullif(trim(coalesce(p_internal_code, '')), ''),
    nullif(trim(coalesce(p_reference, '')), ''),
    coalesce(p_duration_minutes, 0)
  )
  returning id into v_service_id;

  if p_internal_code is null or trim(p_internal_code) = '' then
    update public.services
    set internal_code = v_service_id::text
      where id = v_service_id
        and company_id = p_company_id;
  end if;

  return v_service_id;
end;
$$;

create or replace function public.update_service(
  p_company_id uuid,
  p_id uuid,
  p_name text,
  p_description text,
  p_category_id uuid,
  p_sale_price numeric,
  p_internal_code text,
  p_reference text,
  p_duration_minutes integer default 0
)
returns void
language plpgsql
as $$
begin
  if not exists (select 1 from public.categories where id = p_category_id and company_id = p_company_id) then
    raise exception 'Category not found for company: %', p_category_id;
  end if;

  update public.services
  set name = trim(p_name),
      description = nullif(trim(coalesce(p_description, '')), ''),
      category_id = p_category_id,
      sale_price = coalesce(p_sale_price, 0),
      internal_code = nullif(trim(coalesce(p_internal_code, '')), ''),
      reference = nullif(trim(coalesce(p_reference, '')), ''),
      duration_minutes = coalesce(p_duration_minutes, 0),
      updated_at = now()
  where id = p_id
    and company_id = p_company_id;

  if not found then
    raise exception 'Service not found: %', p_id;
  end if;
end;
$$;

create or replace function public.delete_service(p_company_id uuid, p_id uuid)
returns void
language sql
as $$
  delete from public.services where id = p_id and company_id = p_company_id;
$$;

-- ----------------------------------------------------------------------------
-- RPC: protected reference data
-- ----------------------------------------------------------------------------

create or replace function public.delete_category(p_company_id uuid, p_id uuid)
returns void
language plpgsql
as $$
declare
  v_default_id uuid;
begin
  if exists (
    select 1 from public.categories where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System categories cannot be deleted';
  end if;

  select id into v_default_id
  from public.categories
  where company_id = p_company_id
    and is_default
  limit 1;

  if v_default_id is null then
    raise exception 'Default category is not configured';
  end if;

  update public.products
  set category_id = v_default_id, updated_at = now()
  where category_id = p_id
    and company_id = p_company_id;

  update public.services
  set category_id = v_default_id, updated_at = now()
  where category_id = p_id
    and company_id = p_company_id;

  delete from public.categories where id = p_id and company_id = p_company_id;
end;
$$;

create or replace function public.update_category(
  p_company_id uuid,
  p_id uuid,
  p_name text,
  p_description text
)
returns void
language plpgsql
as $$
begin
  if exists (
    select 1 from public.categories where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System categories cannot be updated';
  end if;

  update public.categories
  set name = trim(p_name),
      description = nullif(trim(coalesce(p_description, '')), '')
  where id = p_id
    and company_id = p_company_id;

  if not found then
    raise exception 'Category not found: %', p_id;
  end if;
end;
$$;

create or replace function public.delete_brand(p_company_id uuid, p_id uuid)
returns void
language plpgsql
as $$
declare
  v_default_id uuid;
begin
  if exists (
    select 1 from public.brands where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System brands cannot be deleted';
  end if;

  select id into v_default_id
  from public.brands
  where company_id = p_company_id
    and is_default
  limit 1;

  if v_default_id is null then
    raise exception 'Default brand is not configured';
  end if;

  update public.products
  set brand_id = v_default_id, updated_at = now()
  where brand_id = p_id
    and company_id = p_company_id;

  delete from public.brands where id = p_id and company_id = p_company_id;
end;
$$;

create or replace function public.update_brand(
  p_company_id uuid,
  p_id uuid,
  p_name text
)
returns void
language plpgsql
as $$
begin
  if exists (
    select 1 from public.brands where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System brands cannot be updated';
  end if;

  update public.brands
  set name = trim(p_name)
  where id = p_id
    and company_id = p_company_id;

  if not found then
    raise exception 'Brand not found: %', p_id;
  end if;
end;
$$;

create or replace function public.delete_supplier(p_company_id uuid, p_id uuid)
returns void
language plpgsql
as $$
declare
  v_default_id uuid;
begin
  if exists (
    select 1 from public.suppliers where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System suppliers cannot be deleted';
  end if;

  select id into v_default_id
  from public.suppliers
  where company_id = p_company_id
    and is_default
  limit 1;

  if v_default_id is null then
    raise exception 'Default supplier is not configured';
  end if;

  update public.products
  set supplier_id = v_default_id, updated_at = now()
  where supplier_id = p_id
    and company_id = p_company_id;

  delete from public.suppliers where id = p_id and company_id = p_company_id;
end;
$$;

create or replace function public.update_supplier(
  p_company_id uuid,
  p_id uuid,
  p_name text
)
returns void
language plpgsql
as $$
begin
  if exists (
    select 1 from public.suppliers where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System suppliers cannot be updated';
  end if;

  update public.suppliers
  set name = trim(p_name)
  where id = p_id
    and company_id = p_company_id;

  if not found then
    raise exception 'Supplier not found: %', p_id;
  end if;
end;
$$;

create or replace function public.delete_unit_of_measure(p_company_id uuid, p_id uuid)
returns void
language plpgsql
as $$
declare
  v_default_id uuid;
begin
  if exists (
    select 1 from public.units_of_measure where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System units of measure cannot be deleted';
  end if;

  select id into v_default_id
  from public.units_of_measure
  where company_id = p_company_id
    and is_default
  limit 1;

  if v_default_id is null then
    raise exception 'Default unit of measure is not configured';
  end if;

  delete from public.product_units
  where unit_id = p_id
    and exists (
      select 1 from public.products p
      where p.id = product_units.product_id
        and p.company_id = p_company_id
    );

  update public.products
  set base_unit_id = v_default_id, updated_at = now()
  where base_unit_id = p_id
    and company_id = p_company_id;

  delete from public.units_of_measure where id = p_id and company_id = p_company_id;
end;
$$;

create or replace function public.update_unit_of_measure(
  p_company_id uuid,
  p_id uuid,
  p_abbreviation text,
  p_description text
)
returns void
language plpgsql
as $$
begin
  if exists (
    select 1 from public.units_of_measure where id = p_id and company_id = p_company_id and is_system
  ) then
    raise exception 'System units of measure cannot be updated';
  end if;

  update public.units_of_measure
  set abbreviation = trim(p_abbreviation),
      description = nullif(trim(coalesce(p_description, '')), '')
  where id = p_id
    and company_id = p_company_id;

  if not found then
    raise exception 'Unit of measure not found: %', p_id;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: medicine table search history
-- ----------------------------------------------------------------------------

create or replace function public.save_medicine_search(
  p_company_id uuid,
  p_query text,
  p_normalized_query text,
  p_results jsonb
)
returns void
language plpgsql
as $$
begin
  insert into public.medicine_search_history (
    company_id,
    query,
    normalized_query,
    results,
    result_count,
    updated_at
  ) values (
    p_company_id,
    p_query,
    p_normalized_query,
    coalesce(p_results, '[]'::jsonb),
    coalesce(jsonb_array_length(p_results), 0),
    now()
  )
  on conflict (company_id, normalized_query) do update
  set query = excluded.query,
      results = excluded.results,
      result_count = excluded.result_count,
      updated_at = now();

  delete from public.medicine_search_history
  where company_id = p_company_id
    and id not in (
      select id
      from public.medicine_search_history
      where company_id = p_company_id
      order by updated_at desc
      limit 25
    );
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: product and service listings
-- ----------------------------------------------------------------------------

create or replace function public.list_products(
  p_company_id uuid,
  p_search text default null,
  p_category_id uuid default null,
  p_brand_id uuid default null,
  p_supplier_id uuid default null,
  p_active boolean default null,
  p_page integer default 1,
  p_page_size integer default 10
)
returns jsonb
language sql
stable
as $$
with filtered as (
  select
    p.*,
    c.name as category_name,
    b.name as brand_name,
    u.abbreviation as base_unit_abbreviation,
    u.description as base_unit_description,
    (p.stock * p.unit_multiplier) as total_stock
  from public.products p
  join public.categories c on c.id = p.category_id and c.company_id = p_company_id
  join public.brands b on b.id = p.brand_id and b.company_id = p_company_id
  join public.units_of_measure u on u.id = p.base_unit_id and u.company_id = p_company_id
  where p.company_id = p_company_id
    and (p_category_id is null or p.category_id = p_category_id)
    and (p_brand_id is null or p.brand_id = p_brand_id)
    and (p_supplier_id is null or p.supplier_id = p_supplier_id)
    and (p_active is null or p.active = p_active)
    and (
      p_search is null
      or trim(p_search) = ''
      or p.name ilike '%' || trim(p_search) || '%'
      or p.internal_code ilike '%' || trim(p_search) || '%'
      or p.reference ilike '%' || trim(p_search) || '%'
      or exists (
        select 1
        from public.product_barcodes pb
        where pb.product_id = p.id
          and pb.company_id = p_company_id
          and pb.barcode ilike '%' || trim(p_search) || '%'
      )
    )
),
counted as (
  select count(*)::integer as total from filtered
),
paged as (
  select * from filtered
  order by name asc
  limit greatest(p_page_size, 1)
  offset (greatest(p_page, 1) - 1) * greatest(p_page_size, 1)
)
select jsonb_build_object(
  'items', coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', paged.id,
        'name', paged.name,
        'description', paged.description,
        'categoryId', paged.category_id,
        'brandId', paged.brand_id,
        'supplierId', paged.supplier_id,
        'baseUnitId', paged.base_unit_id,
        'purchasePrice', paged.purchase_price,
        'profitMargin', paged.profit_margin,
        'salePrice', paged.sale_price,
        'stock', paged.stock,
        'unitMultiplier', paged.unit_multiplier,
        'totalStock', paged.total_stock,
        'internalCode', paged.internal_code,
        'reference', paged.reference,
        'active', paged.active,
        'createdAt', paged.created_at,
        'updatedAt', paged.updated_at,
        'categoryName', paged.category_name,
        'brandName', paged.brand_name,
        'baseUnitAbbreviation', paged.base_unit_abbreviation,
        'baseUnitDescription', paged.base_unit_description,
        'barcodes', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'barcode', pb.barcode,
              'isPrimary', pb.is_primary
            )
            order by pb.is_primary desc, pb.barcode asc
          )
          from public.product_barcodes pb
          where pb.product_id = paged.id
            and pb.company_id = p_company_id
        ), '[]'::jsonb),
        'units', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'unitId', pu.unit_id,
              'unitMultiplier', pu.unit_multiplier,
              'isPrimary', pu.is_primary,
              'abbreviation', um.abbreviation,
              'description', um.description
            )
            order by pu.is_primary desc, um.abbreviation asc
          )
          from public.product_units pu
          join public.units_of_measure um on um.id = pu.unit_id and um.company_id = p_company_id
          where pu.product_id = paged.id
        ), '[]'::jsonb)
      )
      order by paged.name asc
    )
    from paged
  ), '[]'::jsonb),
  'total', (select total from counted),
  'page', greatest(p_page, 1),
  'pageSize', greatest(p_page_size, 1),
  'totalPages', ceil(((select total from counted)::numeric) / greatest(p_page_size, 1))
);
$$;

create or replace function public.list_services(
  p_company_id uuid,
  p_search text default null,
  p_category_id uuid default null,
  p_page integer default 1,
  p_page_size integer default 10
)
returns jsonb
language sql
stable
as $$
with filtered as (
  select
    s.*,
    c.name as category_name
  from public.services s
  join public.categories c on c.id = s.category_id and c.company_id = p_company_id
  where s.company_id = p_company_id
    and (p_category_id is null or s.category_id = p_category_id)
    and (
      p_search is null
      or trim(p_search) = ''
      or s.name ilike '%' || trim(p_search) || '%'
      or s.internal_code ilike '%' || trim(p_search) || '%'
      or s.reference ilike '%' || trim(p_search) || '%'
    )
),
counted as (
  select count(*)::integer as total from filtered
),
paged as (
  select * from filtered
  order by name asc
  limit greatest(p_page_size, 1)
  offset (greatest(p_page, 1) - 1) * greatest(p_page_size, 1)
)
select jsonb_build_object(
  'items', coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', paged.id,
        'name', paged.name,
        'description', paged.description,
        'categoryId', paged.category_id,
        'salePrice', paged.sale_price,
        'internalCode', paged.internal_code,
        'reference', paged.reference,
        'durationMinutes', paged.duration_minutes,
        'createdAt', paged.created_at,
        'updatedAt', paged.updated_at,
        'categoryName', paged.category_name
      )
      order by paged.name asc
    )
    from paged
  ), '[]'::jsonb),
  'total', (select total from counted),
  'page', greatest(p_page, 1),
  'pageSize', greatest(p_page_size, 1),
  'totalPages', ceil(((select total from counted)::numeric) / greatest(p_page_size, 1))
);
$$;

-- ----------------------------------------------------------------------------
-- Security
-- ----------------------------------------------------------------------------
-- The application talks to Postgres only from the server, using the service
-- role key. RLS is enabled with no policies, so anon/authenticated cannot read
-- or write any table. Add policies only if client-side access is introduced.

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.suppliers enable row level security;
alter table public.units_of_measure enable row level security;
alter table public.companies enable row level security;
alter table public.stores enable row level security;
alter table public.users enable row level security;
alter table public.user_stores enable row level security;
alter table public.sessions enable row level security;
alter table public.company_settings enable row level security;
alter table public.products enable row level security;
alter table public.product_barcodes enable row level security;
alter table public.product_units enable row level security;
alter table public.services enable row level security;
alter table public.stock_movements enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.monthly_sales enable row level security;
alter table public.payables enable row level security;
alter table public.invoices enable row level security;
alter table public.medicine_search_history enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;
