-- Geracao automatica de codigo interno com prefixo PROD/SERV e 11 digitos aleatorios unicos.

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
  v_internal_code text;
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

  if p_internal_code is null or trim(p_internal_code) = '' then
    loop
      v_internal_code := 'PROD-' || lpad((floor(random() * 100000000000))::bigint::text, 11, '0');
      exit when not exists (
        select 1 from public.products
        where company_id = p_company_id
          and lower(internal_code) = lower(v_internal_code)
      );
    end loop;
    p_internal_code := v_internal_code;
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
  v_internal_code text;
begin
    if p_name is null or trim(p_name) = '' then
      raise exception 'Service name is required';
    end if;

    if not exists (select 1 from public.categories where id = p_category_id and company_id = p_company_id) then
      raise exception 'Category not found for company: %', p_category_id;
    end if;

    if p_internal_code is null or trim(p_internal_code) = '' then
      loop
        v_internal_code := 'SERV-' || lpad((floor(random() * 100000000000))::bigint::text, 11, '0');
        exit when not exists (
          select 1 from public.services
          where company_id = p_company_id
            and lower(internal_code) = lower(v_internal_code)
        );
      end loop;
      p_internal_code := v_internal_code;
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

  return v_service_id;
end;
$$;
