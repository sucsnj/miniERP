-- Permite alterar o tipo de venda (sale_type) na edição de uma venda.
BEGIN;

CREATE OR REPLACE FUNCTION public.update_sale(
  p_company_id uuid,
  p_store_id uuid,
  p_id uuid,
  p_sale_date date,
  p_amount numeric,
  p_notes text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_sale_type text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
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
BEGIN
  IF p_sale_date IS NULL THEN
    RAISE EXCEPTION 'Sale date is required';
  END IF;

  IF p_amount IS NULL THEN
    RAISE EXCEPTION 'Sale amount is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.sales WHERE id = p_id AND company_id = p_company_id AND store_id = p_store_id
  ) THEN
    RAISE EXCEPTION 'Sale not found: %', p_id;
  END IF;

  SELECT coalesce(jsonb_object_agg(product_id::text, total), '{}'::jsonb)
  INTO v_old_map
  FROM (
    SELECT product_id, sum(quantity) AS total
    FROM public.sale_items
    WHERE sale_id = p_id
      AND company_id = p_company_id
      AND kind = 'PRODUCT'
      AND product_id IS NOT NULL
    GROUP BY product_id
  ) old_items;

  SELECT coalesce(jsonb_object_agg(product_id::text, total), '{}'::jsonb)
  INTO v_new_map
  FROM (
    SELECT nullif(item->>'productId', '')::uuid AS product_id,
           sum(coalesce((item->>'quantity')::numeric, 0)) AS total
    FROM jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) item
    WHERE upper(trim(coalesce(item->>'kind', ''))) = 'PRODUCT'
      AND nullif(item->>'productId', '') IS NOT NULL
    GROUP BY 1
  ) new_items;

  UPDATE public.sales
  SET sale_date = p_sale_date,
      amount = p_amount,
      notes = nullif(trim(coalesce(p_notes, '')), ''),
      sale_type = nullif(trim(coalesce(p_sale_type, '')), ''),
      updated_at = now()
  WHERE id = p_id
    AND company_id = p_company_id
    AND store_id = p_store_id;

  DELETE FROM public.sale_items WHERE sale_id = p_id AND company_id = p_company_id;

  FOR v_item IN
    SELECT * FROM jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  LOOP
    v_kind := upper(trim(coalesce(v_item->>'kind', '')));
    v_product_id := nullif(v_item->>'productId', '')::uuid;
    v_service_id := nullif(v_item->>'serviceId', '')::uuid;
    v_quantity := coalesce((v_item->>'quantity')::numeric, 1);
    v_unit_price := coalesce((v_item->>'unitPrice')::numeric, 0);

    IF v_kind NOT IN ('PRODUCT', 'SERVICE') THEN
      RAISE EXCEPTION 'Invalid sale item kind: %', v_kind;
    END IF;

    IF v_kind = 'PRODUCT'
       AND v_product_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.products WHERE id = v_product_id AND company_id = p_company_id) THEN
      RAISE EXCEPTION 'Product not found for company: %', v_product_id;
    END IF;

    IF v_kind = 'SERVICE'
       AND v_service_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.services WHERE id = v_service_id AND company_id = p_company_id) THEN
      RAISE EXCEPTION 'Service not found for company: %', v_service_id;
    END IF;

    INSERT INTO public.sale_items (
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
    ) VALUES (
      p_company_id,
      p_id,
      v_kind,
      CASE WHEN v_kind = 'PRODUCT' THEN v_product_id ELSE NULL END,
      CASE WHEN v_kind = 'SERVICE' THEN v_service_id ELSE NULL END,
      coalesce(v_item->>'name', ''),
      v_quantity,
      v_unit_price,
      coalesce((v_item->>'subtotal')::numeric, round(v_unit_price * v_quantity, 2)),
      nullif(trim(coalesce(v_item->>'internalCode', '')), ''),
      nullif(trim(coalesce(v_item->>'reference', '')), '')
    );
  END LOOP;

  FOR v_key IN
    SELECT jsonb_object_keys(v_old_map || v_new_map)
  LOOP
    v_old_quantity := coalesce((v_old_map->>v_key)::numeric, 0);
    v_new_quantity := coalesce((v_new_map->>v_key)::numeric, 0);

    IF v_new_quantity > v_old_quantity THEN
      PERFORM public.apply_stock_movement(
        p_company_id,
        v_key::uuid,
        'OUT',
        v_new_quantity - v_old_quantity,
        format('Sale %s - stock adjustment', p_id)
      );
    ELSIF v_new_quantity < v_old_quantity THEN
      PERFORM public.apply_stock_movement(
        p_company_id,
        v_key::uuid,
        'IN',
        v_old_quantity - v_new_quantity,
        format('Sale %s - stock adjustment', p_id)
      );
    END IF;
  END LOOP;
END;
$$;

COMMIT;
