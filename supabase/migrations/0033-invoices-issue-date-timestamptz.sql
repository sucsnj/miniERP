-- Permite armazenar data e hora de emissão da nota fiscal (dhEmi do XML).
alter table public.invoices
  alter column issue_date type timestamptz
  using issue_date::timestamp at time zone 'UTC';
