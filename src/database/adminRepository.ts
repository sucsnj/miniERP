import { getSupabaseServerClient } from './supabase';
import type { AuthContext } from '../utils/serverAuth';
import { hashPassword } from '../utils/password';
import {
  normalizeEmail,
  normalizeIdentifier,
  normalizeName,
} from '../utils/serverAuth';

export interface CompanySummary {
  id: string;
  name: string;
}

export interface StoreAdmin {
  id: string;
  name: string;
  active: boolean;
}

export interface MerchantAdmin {
  id: string;
  name: string;
  login: string;
  email: string;
  active: boolean;
  lastStoreId: string | null;
  storeIds: string[];
}

function oneError(message: string): Error {
  return new Error(message);
}

export async function getCompany(ctx: AuthContext): Promise<CompanySummary> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from('companies')
    .select('id, name')
    .eq('id', ctx.companyId)
    .single();
  if (error) throw oneError('Não foi possível carregar a empresa.');
  return { id: String(data.id), name: String(data.name) };
}

export async function updateCompanyName(name: string, ctx: AuthContext): Promise<void> {
  const client = getSupabaseServerClient();
  const { error } = await client
    .from('companies')
    .update({ name: normalizeName(name) })
    .eq('id', ctx.companyId);
  if (error) throw oneError('Não foi possível atualizar a empresa.');
}

export async function listStores(ctx: AuthContext): Promise<StoreAdmin[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from('stores')
    .select('id, name, active')
    .eq('company_id', ctx.companyId)
    .order('created_at', { ascending: true });
  if (error) throw oneError('Não foi possível listar as lojas.');
  return (data ?? []).map((store) => ({
    id: String(store.id),
    name: String(store.name),
    active: Boolean(store.active),
  }));
}

export async function createStore(name: string, ctx: AuthContext): Promise<StoreAdmin> {
  const client = getSupabaseServerClient();
  const stores = await listStores(ctx);
  if (stores.length >= 2) throw oneError('A empresa pode ter no máximo 2 lojas.');

  const { data, error } = await client
    .from('stores')
    .insert({ company_id: ctx.companyId, name: normalizeName(name) })
    .select('id, name, active')
    .single();
  if (error) {
    throw oneError(String(error.message).includes('at most 2 stores') || error.code === 'P0001'
      ? 'A empresa pode ter no máximo 2 lojas.'
      : 'Não foi possível criar a loja.');
  }
  return { id: String(data.id), name: String(data.name), active: Boolean(data.active) };
}

export async function updateStore(
  storeId: string,
  input: { name?: string; active?: boolean },
  ctx: AuthContext
): Promise<void> {
  const client = getSupabaseServerClient();
  const stores = await listStores(ctx);
  const store = stores.find((item) => item.id === storeId);
  if (!store) throw oneError('Loja não encontrada.');

  if (input.active === false) {
    const activeStores = stores.filter((item) => item.active);
    if (activeStores.length <= 1 && store.active) {
      throw oneError('A empresa precisa manter ao menos uma loja ativa.');
    }
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = normalizeName(input.name);
  if (input.active !== undefined) patch.active = input.active;
  if (Object.keys(patch).length === 0) return;

  const { error } = await client
    .from('stores')
    .update(patch)
    .eq('id', storeId)
    .eq('company_id', ctx.companyId);
  if (error) throw oneError('Não foi possível atualizar a loja.');
}

export async function listMerchants(ctx: AuthContext): Promise<MerchantAdmin[]> {
  const client = getSupabaseServerClient();
  const { data: users, error } = await client
    .from('users')
    .select('id, name, login, email, active, last_store_id')
    .eq('company_id', ctx.companyId)
    .eq('role', 'merchant')
    .order('name', { ascending: true });
  if (error) throw oneError('Não foi possível listar os vendedores.');

  const ids = (users ?? []).map((user) => String(user.id));
  const assignments = ids.length === 0
    ? []
    : (await client
        .from('user_stores')
        .select('user_id, store_id')
        .in('user_id', ids)
      ).data ?? [];

  const storeIdsByUser = new Map<string, string[]>();
  for (const assignment of assignments) {
    const userId = String(assignment.user_id);
    const current = storeIdsByUser.get(userId) ?? [];
    current.push(String(assignment.store_id));
    storeIdsByUser.set(userId, current);
  }

  return (users ?? []).map((user) => ({
    id: String(user.id),
    name: String(user.name),
    login: String(user.login),
    email: String(user.email),
    active: Boolean(user.active),
    lastStoreId: user.last_store_id ? String(user.last_store_id) : null,
    storeIds: storeIdsByUser.get(String(user.id)) ?? [],
  }));
}

async function validateStoreIds(storeIds: string[], ctx: AuthContext): Promise<string[]> {
  const unique = [...new Set(storeIds.map((id) => String(id)).filter(Boolean))];
  if (unique.length === 0) throw oneError('Selecione ao menos uma loja para o vendedor.');

  const stores = await listStores(ctx);
  const validIds = new Set(stores.filter((store) => store.active).map((store) => store.id));
  for (const id of unique) {
    if (!validIds.has(id)) throw oneError('Uma das lojas selecionadas não está disponível.');
  }
  return unique;
}

async function replaceStoreAssignments(userId: string, storeIds: string[], ctx: AuthContext): Promise<void> {
  const client = getSupabaseServerClient();
  const unique = await validateStoreIds(storeIds, ctx);

  const { error: deleteError } = await client
    .from('user_stores')
    .delete()
    .eq('user_id', userId);
  if (deleteError) throw oneError('Não foi possível atualizar as lojas do vendedor.');

  const { error: insertError } = await client
    .from('user_stores')
    .insert(unique.map((storeId) => ({ user_id: userId, store_id: storeId })));
  if (insertError) throw oneError('Não foi possível atualizar as lojas do vendedor.');

  const { error: updateError } = await client
    .from('users')
    .update({ last_store_id: unique[0] ?? null })
    .eq('id', userId)
    .eq('company_id', ctx.companyId)
    .eq('role', 'merchant');
  if (updateError) throw oneError('Não foi possível atualizar a loja atual do vendedor.');
}

export async function createMerchant(
  input: { name: string; login: string; email: string; password: string; storeIds: string[] },
  ctx: AuthContext
): Promise<MerchantAdmin> {
  const client = getSupabaseServerClient();
  const login = normalizeIdentifier(input.login);
  const email = normalizeEmail(input.email);
  const name = normalizeName(input.name);
  const uniqueStoreIds = await validateStoreIds(input.storeIds, ctx);
  const passwordHash = await hashPassword(input.password);

  const { data: user, error } = await client
    .from('users')
    .insert({
      company_id: ctx.companyId,
      role: 'merchant',
      name,
      login,
      email,
      password_hash: passwordHash,
      last_store_id: uniqueStoreIds[0] ?? null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') throw oneError('Login ou e-mail já cadastrado.');
    throw oneError('Não foi possível criar o vendedor.');
  }

  try {
    const { error: assignmentError } = await client
      .from('user_stores')
      .insert(uniqueStoreIds.map((storeId) => ({ user_id: String(user.id), store_id: storeId })));
    if (assignmentError) throw assignmentError;
  } catch {
    await client.from('users').delete().eq('id', String(user.id)).eq('company_id', ctx.companyId);
    throw oneError('Não foi possível vincular as lojas ao vendedor.');
  }

  const merchants = await listMerchants(ctx);
  const created = merchants.find((merchant) => merchant.id === String(user.id));
  if (!created) throw oneError('Vendedor criado, mas não foi possível carregá-lo.');
  return created;
}

export async function updateMerchant(
  merchantId: string,
  input: {
    name?: string;
    login?: string;
    email?: string;
    active?: boolean;
    storeIds?: string[];
    password?: string;
  },
  ctx: AuthContext
): Promise<void> {
  const client = getSupabaseServerClient();
  const merchants = await listMerchants(ctx);
  if (!merchants.some((merchant) => merchant.id === merchantId)) {
    throw oneError('Vendedor não encontrado.');
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = normalizeName(input.name);
  if (input.login !== undefined) patch.login = normalizeIdentifier(input.login);
  if (input.email !== undefined) patch.email = normalizeEmail(input.email);
  if (input.active !== undefined) patch.active = input.active;
  if (input.password) patch.password_hash = await hashPassword(input.password);

  if (Object.keys(patch).length > 0) {
    const { error } = await client
      .from('users')
      .update(patch)
      .eq('id', merchantId)
      .eq('company_id', ctx.companyId)
      .eq('role', 'merchant');
    if (error) {
      if (error.code === '23505') throw oneError('Login ou e-mail já cadastrado.');
      throw oneError('Não foi possível atualizar o vendedor.');
    }
  }

  if (input.storeIds !== undefined) {
    await replaceStoreAssignments(merchantId, input.storeIds, ctx);
  }

  if (input.active === false || input.password) {
    const { error } = await client
      .from('sessions')
      .delete()
      .eq('user_id', merchantId);
    if (error) throw oneError('Não foi possível revogar as sessões do vendedor.');
  }
}
