-- Tipo de venda (opcional): registra a origem da venda (ex.: pix).
BEGIN;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS sale_type text;

CREATE OR REPLACE FUNCTION public.create_sale(
  p_company_id uuid,
  p_store_id uuid,
  p_sale_date date,
  p_amount numeric,
  p_notes text DEFAULT NULL,
  p_created_at timestamptz DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_idempotency_key uuid DEFAULT NULL,
  p_sale_type text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_sale_id uuid;
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
    SELECT 1
    FROM public.stores
    WHERE id = p_store_id AND company_id = p_company_id
  ) THEN
    RAISE EXCEPTION 'Store not found for company: %', p_store_id;
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT id
      INTO v_sale_id
      FROM public.sales
      WHERE company_id = p_company_id
        AND store_id = p_store_id
        AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN v_sale_id;
    END IF;
  END IF;

  BEGIN
    INSERT INTO public.sales (
      company_id,
      store_id,
      sale_date,
      amount,
      notes,
      created_at,
      idempotency_key,
      sale_type
    ) VALUES (
      p_company_id,
      p_store_id,
      p_sale_date,
      p_amount,
      NULLIF(TRIM(COALESCE(p_notes, '')), ''),
      COALESCE(p_created_at, now()),
      p_idempotency_key,
      NULLIF(TRIM(COALESCE(p_sale_type, '')), '')
    )
    RETURNING id INTO v_sale_id;
  EXCEPTION
    WHEN unique_violation THEN
      IF p_idempotency_key IS NULL THEN
        RAISE;
      END IF;

      SELECT id
        INTO v_sale_id
        FROM public.sales
        WHERE company_id = p_company_id
          AND store_id = p_store_id
          AND idempotency_key = p_idempotency_key;

      RETURN v_sale_id;
  END;

  FOR v_item IN
    SELECT * FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb))
  LOOP
    v_kind := UPPER(TRIM(COALESCE(v_item->>'kind', '')));
    v_product_id := NULLIF(v_item->>'productId', '')::uuid;
    v_service_id := NULLIF(v_item->>'serviceId', '')::uuid;
    v_quantity := COALESCE((v_item->>'quantity')::numeric, 1);
    v_unit_price := COALESCE((v_item->>'unitPrice')::numeric, 0);

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
      v_sale_id,
      v_kind,
      CASE WHEN v_kind = 'PRODUCT' THEN v_product_id ELSE NULL END,
      CASE WHEN v_kind = 'SERVICE' THEN v_service_id ELSE NULL END,
      COALESCE(v_item->>'name', ''),
      v_quantity,
      v_unit_price,
      COALESCE((v_item->>'subtotal')::numeric, ROUND(v_unit_price * v_quantity, 2)),
      NULLIF(TRIM(COALESCE(v_item->>'internalCode', '')), ''),
      NULLIF(TRIM(COALESCE(v_item->>'reference', '')), '')
    );

    IF v_kind = 'PRODUCT' AND v_product_id IS NOT NULL AND v_quantity <> 0 THEN
      PERFORM public.apply_stock_movement(
        p_company_id,
        v_product_id,
        'OUT',
        ABS(v_quantity),
        format('Sale %s - sale', v_sale_id)
      );
    END IF;
  END LOOP;

  RETURN v_sale_id;
END;
$$;

COMMIT;
