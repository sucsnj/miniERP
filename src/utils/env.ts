
/**
 * Validação centralizada das variáveis de ambiente usadas no servidor.
 * Falha cedo (na primeira leitura) quando uma variável obrigatória está ausente
 * ou inválida, evitando erros silenciosos nas rotas de API.
 */
export interface SupabaseServerEnv {
  url: string;
  serviceRoleKey: string;
}

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function readUrl(name: string): string {
  const value = readRequired(name);
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('protocolo inválido');
    }
  } catch {
    throw new Error(`Variável de ambiente inválida: ${name}`);
  }
  return value;
}

let cachedEnv: SupabaseServerEnv | null = null;

export function getSupabaseServerEnv(): SupabaseServerEnv {
  if (cachedEnv) return cachedEnv;

  cachedEnv = {
    url: readUrl('NEXT_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: readRequired('SUPABASE_SERVICE_ROLE_KEY'),
  };

  return cachedEnv;
}
