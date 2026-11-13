-- Dados cadastrais completos de empresa e loja.
alter table public.companies
  add column if not exists phone text not null default '',
  add column if not exists tax_id text not null default '' check (char_length(tax_id) <= 18),
  add column if not exists address_street text not null default '',
  add column if not exists address_number text not null default '',
  add column if not exists address_complement text not null default '',
  add column if not exists address_district text not null default '',
  add column if not exists address_city text not null default '',
  add column if not exists address_state char(2) not null default '',
  add column if not exists address_zip text not null default '';

alter table public.stores
  add column if not exists phone text not null default '',
  add column if not exists tax_id text not null default '' check (char_length(tax_id) <= 18),
  add column if not exists address_street text not null default '',
  add column if not exists address_number text not null default '',
  add column if not exists address_district text not null default '';
