-- Opção de auto consolidação: recuperar todos os meses ausentes ou apenas o anterior.
alter table public.company_settings
  add column if not exists auto_consolidation_mode text not null default 'all-previous'
  check (auto_consolidation_mode in ('all-previous', 'previous-month'));

create or replace function public.missing_monthly_consolidation_months(
  p_company_id uuid,
  p_store_id uuid
)
returns table(month smallint, year smallint)
language sql
stable
set search_path = public
as $$
  with bounds as (
    select date_trunc('month', min(sale_date))::date as first_month,
           date_trunc('month', (current_date - interval '1 month'))::date as previous_month
    from public.sales
    where company_id = p_company_id
      and store_id = p_store_id
  ),
  months as (
    select generate_series(first_month, previous_month, interval '1 month')::date as month_start
    from bounds
  )
  select
    extract(month from months.month_start)::smallint,
    extract(year from months.month_start)::smallint
  from months
  where exists (
      select 1
      from public.sales s
      where s.company_id = p_company_id
        and s.store_id = p_store_id
        and date_trunc('month', s.sale_date::date)::date = months.month_start
    )
    and not exists (
      select 1
      from public.monthly_sales monthly
      where monthly.company_id = p_company_id
        and monthly.store_id = p_store_id
        and monthly.month = extract(month from months.month_start)::smallint
        and monthly.year = extract(year from months.month_start)::smallint
    )
  order by months.month_start;
$$;
