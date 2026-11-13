import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../database/supabase';
import { readCompanyNameCache, writeCompanyNameCache } from './companyCache';
import type { ContactProfile } from './businessProfile';

export type AuthRole = 'admin' | 'merchant';

export interface AuthContext {
  userId: string;
  companyId: string;
  companyName: string;
  role: AuthRole;
  name: string;
  login: string;
  email: string;
  avatarUrl?: string | null;
  storeId: string;
  storeName: string;
  sessionId: string;
  contact: ContactProfile;
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
  avatar_url?: string | null;
  phone?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_district?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
}

interface StoreRecord {
  id: string;
  name: string;
}

const SESSION_MAX_AGE_SECONDS = 2 * 24 * 60 * 60;
const SESSION_COOKIE = 'minierp_session';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDENTIFIER_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$|^[a-z]{4,}$/;
const USER_PROFILE_SELECT = 'id, company_id, role, name, login, email, password_hash, active, last_store_id, avatar_url, phone, address_street, address_number, address_complement, address_district, address_city, address_state, address_zip';
const USER_PUBLIC_PROFILE_SELECT = 'id, company_id, role, name, login, email, active, last_store_id, avatar_url, phone, address_street, address_number, address_complement, address_district, address_city, address_state, address_zip';

export function normalizeIdentifier(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_PATTERN.test(value);
}

const userContact = (user: UserRecord): ContactProfile => ({
  phone: String(user.phone ?? ''),
  addressStreet: String(user.address_street ?? ''),
  addressNumber: String(user.address_number ?? ''),
  addressComplement: String(user.address_complement ?? ''),
  addressDistrict: String(user.address_district ?? ''),
  addressCity: String(user.address_city ?? ''),
  addressState: String(user.address_state ?? ''),
  addressZip: String(user.address_zip ?? ''),
});

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
    .select(USER_PROFILE_SELECT)
    .or(`login.eq.${identifier},email.eq.${identifier}`)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserRecord;
}

export async function getCompanyName(companyId: string): Promise<string> {
  const cached = readCompanyNameCache(companyId);
  if (cached) return cached;

  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .maybeSingle();

  if (error || !data) return '';
  const companyName = String(data.name);
  writeCompanyNameCache(companyId, companyName);
  return companyName;
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
    .select(`id, store_id, expires_at, revoked_at, users!inner(${USER_PUBLIC_PROFILE_SELECT})`)
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
    avatarUrl: user.avatar_url ?? null,
    storeId: preferredStore.id,
    storeName: preferredStore.name,
    sessionId: String(session.id),
    contact: userContact(user),
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

export async function revokeUserSessions(userId: string, exceptSessionId?: string): Promise<boolean> {
  const client = getSupabaseServerClient();
  let query = client.from('sessions').delete().eq('user_id', userId);
  if (exceptSessionId) query = query.neq('id', exceptSessionId);
  const { error } = await query;
  return !error;
}

export async function getBootstrapUserContext(companyId: string, storeId: string, userId: string): Promise<AuthContext | null> {
  const client = getSupabaseServerClient();
  const { data: user, error } = await client
    .from('users')
    .select(USER_PUBLIC_PROFILE_SELECT)
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
    avatarUrl: (user.avatar_url ?? null) as string | null,
    storeId: store.id as string,
    storeName: store.name as string,
    sessionId: '',
    contact: userContact(user as UserRecord),
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

export async function requireAdminApi(req: NextApiRequest, res: NextApiResponse): Promise<AuthContext | null> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    res.status(401).json({ error: 'Não autenticado.' });
    return null;
  }
  if (ctx.role !== 'admin') {
    res.status(403).json({ error: 'Ação permitida apenas para administradores.' });
    return null;
  }
  return ctx;
}

export async function listAuthorizedStores(ctx: AuthContext): Promise<StoreRecord[]> {
  return getAuthorizedStores({
    id: ctx.userId,
    company_id: ctx.companyId,
    role: ctx.role,
    name: ctx.name,
    login: ctx.login,
    email: ctx.email,
    password_hash: '',
    active: true,
    last_store_id: ctx.storeId,
  });
}

export async function setCurrentStore(
  ctx: AuthContext,
  storeId: string
): Promise<StoreRecord | null> {
  const client = getSupabaseServerClient();
  const authorizedStores = await listAuthorizedStores(ctx);
  const store = authorizedStores.find((item) => item.id === storeId) ?? null;
  if (!store) return null;

  const { error: sessionError } = await client
    .from('sessions')
    .update({ store_id: storeId })
    .eq('user_id', ctx.userId)
    .eq('id', ctx.sessionId);

  const { error: userError } = await client
    .from('users')
    .update({ last_store_id: storeId })
    .eq('id', ctx.userId)
    .eq('company_id', ctx.companyId);

  if (sessionError || userError) return null;
  return store as StoreRecord;
}

export function requireAdmin(ctx: AuthContext): void {
  if (ctx.role !== 'admin') throw new Error('Forbidden');
}

export function isAdmin(ctx: AuthContext): boolean {
  return ctx.role === 'admin';
}
