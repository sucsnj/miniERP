-- Dados de contato do administrador (endereço e telefone).
alter table public.users
  add column if not exists phone text not null default '',
  add column if not exists address_street text not null default '',
  add column if not exists address_number text not null default '',
  add column if not exists address_complement text not null default '',
  add column if not exists address_district text not null default '',
  add column if not exists address_city text not null default '',
  add column if not exists address_state char(2) not null default '',
  add column if not exists address_zip text not null default '';
