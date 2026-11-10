import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerEnv } from '@/utils/env';

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase exclusivo do servidor (API routes).
 * Usa a service role key e desabilita sessão/refresh, pois não há auth de usuário
 * nesta fase e o cliente é compartilhado entre requisições.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (client) return client;

  const { url, serviceRoleKey } = getSupabaseServerEnv();

  client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { 'X-Client-Info': 'minierp-server' },
    },
  });

  return client;
}
