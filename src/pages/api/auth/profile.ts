import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAuthContext,
  isValidEmail,
  isValidName,
  normalizeEmail,
  normalizeIdentifier,
  normalizeName,
  requireAdminApi,
} from '../../../utils/serverAuth';
import { validateLogin } from '../../../utils/password';
import { getSupabaseServerClient } from '../../../database/supabase';
import { normalizeContactProfile } from '../../../utils/businessProfile';

const buildProfile = (ctx: Awaited<ReturnType<typeof getAuthContext>>) => {
  if (!ctx) return null;
  return {
    userId: ctx.userId,
    companyId: ctx.companyId,
    companyName: ctx.companyName,
    role: ctx.role,
    name: ctx.name,
    login: ctx.login,
    email: ctx.email,
    avatarUrl: ctx.avatarUrl ?? null,
    storeId: ctx.storeId,
    storeName: ctx.storeName,
    sessionId: ctx.sessionId,
    contact: ctx.contact,
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAdminApi(req, res);
  if (!ctx) return;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (req.body?.contact !== undefined) {
    if (
      req.body?.name !== undefined ||
      req.body?.login !== undefined ||
      req.body?.email !== undefined
    ) {
      return res.status(400).json({ error: 'Envie dados pessoais ou contato em solicitações separadas.' });
    }

    const parsed = normalizeContactProfile(req.body.contact);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.message });
    }

    const client = getSupabaseServerClient();
    const { error } = await client
      .from('users')
      .update({
        phone: parsed.value.phone,
        address_street: parsed.value.addressStreet,
        address_number: parsed.value.addressNumber,
        address_complement: parsed.value.addressComplement,
        address_district: parsed.value.addressDistrict,
        address_city: parsed.value.addressCity,
        address_state: parsed.value.addressState,
        address_zip: parsed.value.addressZip,
      })
      .eq('id', ctx.userId)
      .eq('company_id', ctx.companyId);

    if (error) {
      return res.status(500).json({ error: 'Não foi possível atualizar o contato.' });
    }

    const refreshed = await getAuthContext(req);
    return res.status(200).json({ user: buildProfile(refreshed) });
  }

  const name = normalizeName(req.body?.name);
  const login = normalizeIdentifier(req.body?.login);
  const email = normalizeEmail(req.body?.email);

  if (!isValidName(name)) {
    return res.status(400).json({ error: 'O nome deve ter entre 2 e 120 caracteres.' });
  }
  if (!validateLogin(login)) {
    return res.status(400).json({ error: 'O apelido deve ter no mínimo 4 letras e apenas letras.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  const client = getSupabaseServerClient();
  const { error } = await client
    .from('users')
    .update({ name, login, email })
    .eq('id', ctx.userId)
    .eq('company_id', ctx.companyId);

  if (error) {
    const message = error.code === '23505'
      ? 'Este apelido ou e-mail já está em uso.'
      : 'Não foi possível atualizar o perfil.';
    return res.status(error.code === '23505' ? 400 : 500).json({ error: message });
  }

  const refreshed = await getAuthContext(req);
  return res.status(200).json({ user: buildProfile(refreshed) });
}
