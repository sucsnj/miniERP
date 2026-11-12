import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../database/supabase';

export type AuthRole = 'admin' | 'merchant';

export interface AuthContext {
  userId: string;
  companyId: string;
  companyName: string;
  role: AuthRole;
  name: string;
  login: string;
  email: string;
  storeId: string;
  storeName: string;
  sessionId: string;
}

interface UserRecord {
  id: string;
  company_id: string;
  role: AuthRole;
  name: string;
  login: string;
  email: string;
  password_hash: string;
  active: boolean;
  last_store_id: string | null;
}

interface StoreRecord {
  id: string;
  name: string;
}

const SESSION_MAX_AGE_SECONDS = 2 * 24 * 60 * 60;
const SESSION_COOKIE = 'minierp_session';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDENTIFIER_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$|^[a-z]{4,}$/;

export function normalizeIdentifier(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_PATTERN.test(value);
}

export function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function normalizeName(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function isValidName(value: string): boolean {
  return value.length >= 2 && value.length <= 120;
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseSessionCookie(req: NextApiRequest): string | null {
  const cookie = req.cookies?.[SESSION_COOKIE];
  return cookie || null;
}

export function setSessionCookie(res: NextApiResponse, token: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`
  );
}

export function clearSessionCookie(res: NextApiResponse): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
}

export function verifyMasterPin(candidate: unknown): boolean {
  const expected = process.env.PIN_MASTER?.trim();
  const actual = String(candidate ?? '').trim();
  if (!expected || !actual) return false;
  const expectedHash = crypto.createHash('sha256').update(expected).digest();
  const actualHash = crypto.createHash('sha256').update(actual).digest();
  return crypto.timingSafeEqual(expectedHash, actualHash);
}

export async function findUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from('users')
    .select('id, company_id, role, name, login, email, password_hash, active, last_store_id')
    .or(`login.eq.${identifier},email.eq.${identifier}`)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserRecord;
}

export async function getCompanyName(companyId: string): Promise<string> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .maybeSingle();

  if (error || !data) return '';
  return data.name as string;
}

async function getAuthorizedStores(user: UserRecord): Promise<StoreRecord[]> {
  const client = getSupabaseServerClient();
  const { data: activeStores, error: storesError } = await client
    .from('stores')
    .select('id, name')
    .eq('company_id', user.company_id)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (storesError || !activeStores || activeStores.length === 0) return [];
  if (user.role === 'admin') return activeStores as StoreRecord[];

  const { data: assignments, error: assignmentsError } = await client
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user.id);

  if (assignmentsError || !assignments || assignments.length === 0) return [];
  const allowedIds = new Set(assignments.map((assignment) => String(assignment.store_id)));
  return (activeStores as StoreRecord[]).filter((store) => allowedIds.has(store.id));
}

async function pickStore(user: UserRecord, stores: StoreRecord[]): Promise<StoreRecord | null> {
  const preferred = stores.find((store) => store.id === user.last_store_id);
  if (preferred) return preferred;
  return stores[0] ?? null;
}

export async function createSession(userId: string, storeId: string): Promise<string> {
  const client = getSupabaseServerClient();
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  const { error } = await client.from('sessions').insert({
    user_id: userId,
    store_id: storeId,
    token_hash: hashSessionToken(token),
    expires_at: expiresAt,
  });

  if (error) throw new Error('Could not create session.');
  return token;
}

export async function getAuthContext(req: NextApiRequest): Promise<AuthContext | null> {
  const token = parseSessionCookie(req);
  if (!token) return null;

  const client = getSupabaseServerClient();
  const { data: session, error } = await client
    .from('sessions')
    .select('id, store_id, expires_at, revoked_at, users!inner(id, company_id, role, name, login, email, active, last_store_id)')
    .eq('token_hash', hashSessionToken(token))
    .maybeSingle();

  if (error || !session || session.revoked_at) return null;
  if (new Date(session.expires_at as string).getTime() <= Date.now()) {
    await client.from('sessions').delete().eq('id', session.id);
    return null;
  }

  const userData = session.users as unknown;
  const rawUser = Array.isArray(userData) ? userData[0] : userData;
  if (!rawUser || typeof rawUser !== 'object') return null;
  const user = rawUser as UserRecord;
  if (!user.active) return null;

  const stores = await getAuthorizedStores(user);
  if (stores.length === 0) return null;

  const sessionStore = stores.find((store) => store.id === session.store_id);
  const preferredStore = sessionStore ?? (await pickStore(user, stores));
  if (!preferredStore) return null;

  const companyName = await getCompanyName(user.company_id);

  return {
    userId: user.id,
    companyId: user.company_id,
    companyName,
    role: user.role,
    name: user.name,
    login: user.login,
    email: user.email,
    storeId: preferredStore.id,
    storeName: preferredStore.name,
    sessionId: String(session.id),
  };
}

export async function revokeSession(req: NextApiRequest): Promise<void> {
  const token = parseSessionCookie(req);
  if (!token) return;

  const client = getSupabaseServerClient();
  await client
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', hashSessionToken(token));
}

export async function revokeUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
  const client = getSupabaseServerClient();
  let query = client.from('sessions').delete().eq('user_id', userId);
  if (exceptSessionId) query = query.neq('id', exceptSessionId);
  await query;
}

export async function getBootstrapUserContext(companyId: string, storeId: string, userId: string): Promise<AuthContext | null> {
  const client = getSupabaseServerClient();
  const { data: user, error } = await client
    .from('users')
    .select('id, company_id, role, name, login, email, active, last_store_id')
    .eq('id', userId)
    .eq('company_id', companyId)
    .maybeSingle();

  if (error || !user) return null;
  const companyName = await getCompanyName(companyId);
  const { data: store } = await client
    .from('stores')
    .select('id, name')
    .eq('id', storeId)
    .eq('company_id', companyId)
    .maybeSingle();

  if (!store) return null;
  return {
    userId: user.id as string,
    companyId,
    companyName,
    role: user.role as AuthRole,
    name: user.name as string,
    login: user.login as string,
    email: user.email as string,
    storeId: store.id as string,
    storeName: store.name as string,
    sessionId: '',
  };
}

export async function requireApiAuth(req: NextApiRequest, res: NextApiResponse): Promise<AuthContext | null> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    res.status(401).json({ error: 'Não autenticado.' });
    return null;
  }
  return ctx;
}

export function requireAdmin(ctx: AuthContext): void {
  if (ctx.role !== 'admin') throw new Error('Forbidden');
}

export function isAdmin(ctx: AuthContext): boolean {
  return ctx.role === 'admin';
}
