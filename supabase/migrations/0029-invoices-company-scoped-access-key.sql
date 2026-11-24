-- Escopo de empresa para a unicidade da chave de acesso da nota fiscal.
-- Antes, `invoices.access_key` era unique global, o que bloqueava a importação
-- da mesma nota em empresas distintas (erro 23505) e quebrava o isolamento
-- multiempresa. A partir de agora a unicidade vale por (company_id, access_key).

alter table public.invoices drop constraint if exists invoices_access_key_key;

create unique index if not exists invoices_company_id_access_key_uq
  on public.invoices (company_id, access_key);
