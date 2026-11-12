-- Adiciona configuração compartilhada de auto consolidação mensal.
alter table public.company_settings
  add column if not exists auto_consolidation_enabled boolean not null default true,
  add column if not exists auto_consolidation_day integer not null default 1
    check (auto_consolidation_day between 1 and 28);

comment on column public.company_settings.auto_consolidation_enabled is
  'Define se a consolidação do mês anterior ocorre automaticamente.';

comment on column public.company_settings.auto_consolidation_day is
  'Dia do mês seguinte (1-28) em que a consolidação do mês anterior pode ser executada automaticamente.';
