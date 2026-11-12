-- ============================================================================
-- Avatar do usuário (foto opcional, exibida na navbar)
-- ============================================================================

alter table public.users
  add column if not exists avatar_url text;

notify pgrst, 'reload schema';
