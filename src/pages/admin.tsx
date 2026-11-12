import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import RequireAdmin from '@/components/auth/RequireAdmin';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import Dialog from '@/components/common/Dialog';
import { validatePassword } from '../utils/password';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { usePendingTask } from '../contexts/RouteLoadingContext';

interface Company {
  id: string;
  name: string;
}

interface StoreAdmin {
  id: string;
  name: string;
  active: boolean;
}

interface MerchantAdmin {
  id: string;
  name: string;
  login: string;
  email: string;
  active: boolean;
  lastStoreId: string | null;
  storeIds: string[];
  avatarUrl?: string | null;
}

const inputStyle = { padding: '8px 10px', width: '100%' };

export default function AdminPage() {
  const { showToast } = useToast();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  usePendingTask('admin', loading);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [stores, setStores] = useState<StoreAdmin[]>([]);
  const [storeDrafts, setStoreDrafts] = useState<Record<string, string>>({});
  const [newStoreName, setNewStoreName] = useState('');
  const [merchants, setMerchants] = useState<MerchantAdmin[]>([]);
  const [merchantDrafts, setMerchantDrafts] = useState<Record<string, MerchantAdmin>>({});
  const [newMerchant, setNewMerchant] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
    avatarUrl: '',
    storeIds: [] as string[],
  });
  const [resetPasswordMerchant, setResetPasswordMerchant] = useState<MerchantAdmin | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const loadAdmin = useCallback(async () => {
    try {
      const [companyResponse, storesResponse, merchantsResponse] = await Promise.all([
        fetch('/api/admin/company'),
        fetch('/api/admin/stores'),
        fetch('/api/admin/merchants'),
      ]);
      if (!companyResponse.ok || !storesResponse.ok || !merchantsResponse.ok) {
        throw new Error('Não foi possível carregar os dados de administração.');
      }
      const companyBody = await companyResponse.json();
      const storesBody = await storesResponse.json();
      const merchantsBody = await merchantsResponse.json();
      setCompany(companyBody.company);
      setCompanyName(companyBody.company?.name ?? '');
      setStores(storesBody.stores ?? []);
      setStoreDrafts(Object.fromEntries((storesBody.stores ?? []).map((store: StoreAdmin) => [store.id, store.name])));
      setMerchants(merchantsBody.merchants ?? []);
      setMerchantDrafts(Object.fromEntries((merchantsBody.merchants ?? []).map((merchant: MerchantAdmin) => [merchant.id, merchant])));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao carregar administração.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAdmin(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAdmin]);

  const saveCompany = async () => {
    const response = await fetch('/api/admin/company', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: companyName }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return showToast(body.error ?? 'Erro ao atualizar empresa.', 'error');
    setCompany(body.company);
    await refresh();
    showToast('Empresa atualizada.', 'success');
  };

  const createStore = async () => {
    const response = await fetch('/api/admin/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newStoreName }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return showToast(body.error ?? 'Erro ao criar loja.', 'error');
    setNewStoreName('');
    await loadAdmin();
    showToast('Loja criada.', 'success');
  };

  const saveStore = async (store: StoreAdmin) => {
    const name = storeDrafts[store.id] ?? store.name;
    const response = await fetch('/api/admin/stores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: store.id, name }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return showToast(body.error ?? 'Erro ao atualizar loja.', 'error');
    await loadAdmin();
    await refresh();
    showToast('Loja atualizada.', 'success');
  };

  const toggleStore = async (store: StoreAdmin) => {
    const response = await fetch('/api/admin/stores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: store.id, active: !store.active }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return showToast(body.error ?? 'Erro ao atualizar loja.', 'error');
    await loadAdmin();
    await refresh();
    showToast(store.active ? 'Loja desativada.' : 'Loja ativada.', 'success');
  };

  const createMerchant = async () => {
    const response = await fetch('/api/admin/merchants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMerchant),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return showToast(body.error ?? 'Erro ao criar vendedor.', 'error');
    setNewMerchant({ name: '', login: '', email: '', password: '', avatarUrl: '', storeIds: [] });
    await loadAdmin();
    showToast('Vendedor criado.', 'success');
  };

  const saveMerchant = async (merchant: MerchantAdmin) => {
    const draft = merchantDrafts[merchant.id];
    const response = await fetch('/api/admin/merchants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: merchant.id,
        name: draft.name,
        login: draft.login,
        email: draft.email,
        active: draft.active,
        storeIds: draft.storeIds,
        avatarUrl: draft.avatarUrl,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return showToast(body.error ?? 'Erro ao atualizar vendedor.', 'error');
    await loadAdmin();
    showToast('Vendedor atualizado.', 'success');
  };

  const openResetPassword = (merchant: MerchantAdmin) => {
    setResetPasswordMerchant(merchant);
    setResetPassword('');
    setResetConfirmPassword('');
  };

  const closeResetPassword = () => {
    setResetPasswordMerchant(null);
    setResetPassword('');
    setResetConfirmPassword('');
    setResettingPassword(false);
  };

  const submitResetPassword = async () => {
    if (!resetPasswordMerchant || resettingPassword) return;

    const passwordCheck = validatePassword(resetPassword);
    if (!passwordCheck.ok) {
      showToast(passwordCheck.message ?? 'Senha inválida.', 'error');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      showToast('A confirmação da senha não confere.', 'error');
      return;
    }

    setResettingPassword(true);
    const response = await fetch('/api/admin/merchants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resetPasswordMerchant.id, password: resetPassword }),
    });
    const body = await response.json().catch(() => ({}));
    setResettingPassword(false);

    if (!response.ok) {
      showToast(body.error ?? 'Erro ao redefinir senha.', 'error');
      return;
    }

    closeResetPassword();
    showToast('Senha redefinida.', 'success');
  };

  const updateMerchantDraft = (id: string, patch: Partial<MerchantAdmin>) => {
    setMerchantDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  };

  const toggleMerchantStore = (id: string, storeId: string, selected: boolean) => {
    const current = merchantDrafts[id]?.storeIds ?? [];
    updateMerchantDraft(id, { storeIds: selected ? [...new Set([...current, storeId])] : current.filter((item) => item !== storeId) });
  };

  const toggleNewMerchantStore = (storeId: string, selected: boolean) => {
    setNewMerchant((current) => ({
      ...current,
      storeIds: selected
        ? [...new Set([...current.storeIds, storeId])]
        : current.storeIds.filter((item) => item !== storeId),
    }));
  };

  return (
    <RequireAdmin>
      <>
        <Head><title>Administração</title></Head>
        <PageShell>
          <PageHeader title="Administração" description="Empresa, lojas e vendedores." />
          {!loading && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Panel>
                <PanelHeader title="Empresa" />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={inputStyle} />
                  <Button type="button" onClick={saveCompany}>Salvar</Button>
                </div>
                {company && <p>ID: {company.id}</p>}
              </Panel>

              <Panel>
                <PanelHeader title="Lojas" />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input value={newStoreName} onChange={(event) => setNewStoreName(event.target.value)} placeholder="Nova loja" style={inputStyle} />
                  <Button type="button" onClick={createStore} disabled={stores.length >= 2}>Criar loja</Button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Máximo de 2 lojas por empresa.</p>
                {stores.map((store) => (
                  <div key={store.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', marginBottom: '8px' }}>
                    <input value={storeDrafts[store.id] ?? store.name} onChange={(event) => setStoreDrafts((current) => ({ ...current, [store.id]: event.target.value }))} style={inputStyle} />
                    <Button type="button" size="sm" onClick={() => void saveStore(store)}>Salvar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void toggleStore(store)}>{store.active ? 'Desativar' : 'Ativar'}</Button>
                  </div>
                ))}
              </Panel>

              <Panel>
                <PanelHeader title="Vendedores" />
                <fieldset style={{ border: '1px solid var(--border)', padding: '10px', marginBottom: '12px' }}>
                  <legend>Novo vendedor</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    <input placeholder="Nome" value={newMerchant.name} onChange={(event) => setNewMerchant({ ...newMerchant, name: event.target.value })} style={inputStyle} />
                    <input placeholder="Login" value={newMerchant.login} onChange={(event) => setNewMerchant({ ...newMerchant, login: event.target.value.toLowerCase() })} style={inputStyle} />
                    <input placeholder="E-mail" value={newMerchant.email} onChange={(event) => setNewMerchant({ ...newMerchant, email: event.target.value })} style={inputStyle} />
                    <input placeholder="URL da foto (opcional)" value={newMerchant.avatarUrl} onChange={(event) => setNewMerchant({ ...newMerchant, avatarUrl: event.target.value })} style={inputStyle} />
                    <input type="password" placeholder="Senha" value={newMerchant.password} onChange={(event) => setNewMerchant({ ...newMerchant, password: event.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
                    {stores.filter((store) => store.active).map((store) => (
                      <label key={store.id} style={{ display: 'inline-flex', gap: '4px' }}>
                        <input type="checkbox" checked={newMerchant.storeIds.includes(store.id)} onChange={(event) => toggleNewMerchantStore(store.id, event.target.checked)} />
                        {store.name}
                      </label>
                    ))}
                  </div>
                  <Button type="button" onClick={createMerchant}>Criar vendedor</Button>
                </fieldset>

                {merchants.map((merchant) => {
                  const draft = merchantDrafts[merchant.id] ?? merchant;
                  return (
                    <div key={merchant.id} style={{ border: '1px solid var(--border)', padding: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                        <input value={draft.name} onChange={(event) => updateMerchantDraft(merchant.id, { name: event.target.value })} style={inputStyle} />
                        <input value={draft.login} onChange={(event) => updateMerchantDraft(merchant.id, { login: event.target.value.toLowerCase() })} style={inputStyle} />
                        <input value={draft.email} onChange={(event) => updateMerchantDraft(merchant.id, { email: event.target.value })} style={inputStyle} />
                        <input placeholder="URL da foto (opcional)" value={draft.avatarUrl ?? ''} onChange={(event) => updateMerchantDraft(merchant.id, { avatarUrl: event.target.value || null })} style={inputStyle} />
                        <label style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <input type="checkbox" checked={draft.active} onChange={(event) => updateMerchantDraft(merchant.id, { active: event.target.checked })} />
                          Ativo
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
                        {stores.filter((store) => store.active).map((store) => (
                          <label key={store.id} style={{ display: 'inline-flex', gap: '4px' }}>
                            <input type="checkbox" checked={draft.storeIds.includes(store.id)} onChange={(event) => toggleMerchantStore(merchant.id, store.id, event.target.checked)} />
                            {store.name}
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button type="button" size="sm" onClick={() => void saveMerchant(merchant)}>Salvar vendedor</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => openResetPassword(merchant)}>Redefinir senha</Button>
                      </div>
                    </div>
                  );
                })}
              </Panel>
            </div>
          )}

          <Dialog
            open={Boolean(resetPasswordMerchant)}
            title={`Redefinir senha de ${resetPasswordMerchant?.name ?? 'vendedor'}`}
            onClose={closeResetPassword}
          >
            <div style={{ display: 'grid', gap: '10px' }}>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Nova senha"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirmação da senha"
                value={resetConfirmPassword}
                onChange={(event) => setResetConfirmPassword(event.target.value)}
                style={inputStyle}
              />
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                A senha deve ter entre 8 e 128 caracteres, letras, número e um caractere especial seguro.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button type="button" variant="outline" onClick={closeResetPassword} disabled={resettingPassword}>
                  Cancelar
                </Button>
                <Button type="button" onClick={submitResetPassword} disabled={resettingPassword}>
                  {resettingPassword ? 'Redefinindo...' : 'Redefinir senha'}
                </Button>
              </div>
            </div>
          </Dialog>
        </PageShell>
      </>
    </RequireAdmin>
  );
}
