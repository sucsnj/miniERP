import Head from 'next/head';
import { FormEvent, useState } from 'react';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import RequireAdmin from '@/components/auth/RequireAdmin';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import Dialog from '@/components/common/Dialog';
import { validatePassword } from '../utils/password';
import { useToast } from '../hooks/useToast';
import { useAdmin } from '../hooks/useAdmin';

const inputStyle = { padding: '8px 10px', width: '100%' };

export default function AdminPage() {
  const { showToast } = useToast();
  const {
    stores,
    merchants,
    initialLoading,
    companyName,
    setCompanyName,
    storeDrafts,
    setStoreDrafts,
    merchantDrafts,
    saveCompany,
    createStore,
    saveStore,
    toggleStore,
    newMerchant,
    setNewMerchant,
    toggleNewMerchantStore,
    toggleMerchantStore,
    updateMerchantDraft,
    saveMerchant,
    createMerchant,
    resetMerchantPassword,
    createMerchantBusy,
  } = useAdmin(showToast);
  const [newStoreName, setNewStoreName] = useState('');
  const [resetPasswordMerchant, setResetPasswordMerchant] = useState<{ id: string; name: string } | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const openResetPassword = (merchant: { id: string; name: string }) => {
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

  const submitResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    resetMerchantPassword(resetPasswordMerchant.id, resetPassword);
    setResettingPassword(false);
    closeResetPassword();
  };

  return (
    <RequireAdmin>
      <>
        <Head><title>Administração</title></Head>
        <PageShell>
          <PageHeader title="Administração" description="Empresa, lojas e vendedores." />

          {!initialLoading && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Panel>
                <PanelHeader title="Empresa" />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={inputStyle} />
                  <Button type="button" onClick={saveCompany}>Salvar</Button>
                </div>
              </Panel>

              <Panel>
                <PanelHeader title="Lojas" />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    value={newStoreName}
                    onChange={(event) => setNewStoreName(event.target.value)}
                    placeholder="Nova loja"
                    style={inputStyle}
                  />
                  <Button type="button" onClick={() => { createStore(newStoreName); setNewStoreName(''); }} disabled={stores.length >= 2}>Criar loja</Button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Máximo de 2 lojas por empresa.</p>
                {stores.map((store) => (
                  <div key={store.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', marginBottom: '8px' }}>
                    <input
                      value={storeDrafts[store.id] ?? store.name}
                      onChange={(event) => setStoreDrafts((current) => ({ ...current, [store.id]: event.target.value }))}
                      style={inputStyle}
                    />
                    <Button type="button" size="sm" onClick={() => saveStore(store)}>Salvar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => toggleStore(store)}>{store.active ? 'Desativar' : 'Ativar'}</Button>
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
                  <Button type="button" onClick={() => createMerchant(newMerchant)} disabled={createMerchantBusy}>
                    Criar vendedor
                  </Button>
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
                        <Button type="button" size="sm" onClick={() => void saveMerchant(merchant.id)}>Salvar vendedor</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => openResetPassword({ id: merchant.id, name: merchant.name })}>Redefinir senha</Button>
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
            <form onSubmit={submitResetPassword}>
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
                  <Button type="submit" disabled={resettingPassword}>
                    {resettingPassword ? 'Redefinindo...' : 'Redefinir senha'}
                  </Button>
                </div>
              </div>
            </form>
          </Dialog>
        </PageShell>
      </>
    </RequireAdmin>
  );
}
