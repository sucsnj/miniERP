import Head from 'next/head';
import { FormEvent, useRef, useState, type CSSProperties } from 'react';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import RequireAdmin from '@/components/auth/RequireAdmin';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import Dialog from '@/components/common/Dialog';
import { validatePassword } from '../utils/password';
import { useToast } from '../hooks/useToast';
import { useAdmin, type StoreAdmin } from '../hooks/useAdmin';
import { uploadAvatar } from '../services/avatarService';
import AvatarPicker from '@/components/common/AvatarPicker';
import {
  normalizeCompanyProfile,
  normalizeStoreProfile,
} from '../utils/businessProfile';
import { CARDS_GRID_STYLE } from '../utils/layout';

const inputStyle = { padding: '6px 8px', width: '100%' };
const panelStyle: CSSProperties = { padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' };

export default function AdminPage() {
  const { showToast } = useToast();
  const {
    stores,
    company,
    merchants,
    initialLoading,
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
    updateMerchantAvatar,
    saveMerchant,
    createMerchant,
    resetMerchantPassword,
    createMerchantBusy,
  } = useAdmin(showToast);
  const [newStoreName, setNewStoreName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const storeFormRef = useRef<HTMLFormElement | null>(null);
  const selectedStore = stores.find((store) => store.id === selectedStoreId) ?? null;
  const [resetPasswordMerchant, setResetPasswordMerchant] = useState<{ id: string; name: string } | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const uploadMerchantAvatar = async (merchantId: string, file: File) => {
    const body = await uploadAvatar(file, merchantId);
    updateMerchantAvatar(merchantId, body.avatarUrl);
    showToast('Foto do vendedor atualizada.', 'success');
  };

  const clearStoreForm = () => {
    const form = storeFormRef.current;
    if (!form) return;

    for (const fieldName of ['name', 'phone', 'taxId', 'addressStreet', 'addressNumber', 'addressDistrict'] as const) {
      const field = form.elements.namedItem(fieldName);
      if (field instanceof HTMLInputElement) {
        field.value = '';
      }
    }
  };

  const saveCompanyForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = normalizeCompanyProfile(Object.fromEntries(data.entries()));
    if (!parsed.ok) {
      showToast(parsed.message, 'error');
      return;
    }

    const profilePayload = { ...parsed.value };
    delete profilePayload.id;
    saveCompany(profilePayload);
  };

  const saveStoreForm = (event: FormEvent<HTMLFormElement>, store: StoreAdmin) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = normalizeStoreProfile(Object.fromEntries(data.entries()));
    if (!parsed.ok) {
      showToast(parsed.message, 'error');
      return;
    }

    const profilePayload = { ...parsed.value };
    delete profilePayload.id;
    delete profilePayload.active;
    saveStore({ id: store.id, ...profilePayload });
  };

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
            <div style={CARDS_GRID_STYLE}>
              <form key={company?.id} onSubmit={saveCompanyForm}>
                <Panel style={panelStyle}>
                  <PanelHeader title="Empresa" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                      Nome *
                      <input name="name" defaultValue={company?.name ?? ''} required autoComplete="organization" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                      Telefone
                      <input name="phone" defaultValue={company?.phone ?? ''} autoComplete="tel" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                      CPF/CNPJ
                      <input name="taxId" defaultValue={company?.taxId ?? ''} autoComplete="off" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                      Logradouro
                      <input name="addressStreet" defaultValue={company?.addressStreet ?? ''} autoComplete="street-address" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Número
                      <input name="addressNumber" defaultValue={company?.addressNumber ?? ''} autoComplete="off" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Complemento
                      <input name="addressComplement" defaultValue={company?.addressComplement ?? ''} autoComplete="off" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Bairro
                      <input name="addressDistrict" defaultValue={company?.addressDistrict ?? ''} autoComplete="off" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Cidade
                      <input name="addressCity" defaultValue={company?.addressCity ?? ''} autoComplete="address-level2" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      UF
                      <input name="addressState" defaultValue={company?.addressState ?? ''} maxLength={2} autoComplete="address-level1" style={inputStyle} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      CEP
                      <input name="addressZip" defaultValue={company?.addressZip ?? ''} maxLength={9} autoComplete="postal-code" style={inputStyle} />
                    </label>
                  </div>
                  <Button type="submit" size="sm" style={{ alignSelf: 'flex-start' }}>Salvar</Button>
                </Panel>
              </form>

              <Panel style={panelStyle}>
                <PanelHeader title="Lojas" />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <input
                    value={newStoreName}
                    onChange={(event) => setNewStoreName(event.target.value)}
                    placeholder="Nova loja"
                    style={inputStyle}
                  />
                  <Button type="button" onClick={() => { createStore(newStoreName); setNewStoreName(''); }} disabled={stores.length >= 2}>Criar loja</Button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Máximo de 2 lojas por empresa.</p>
                {stores.length > 0 && (
                  <select
                    value={selectedStoreId}
                    onChange={(event) => setSelectedStoreId(event.target.value)}
                    style={inputStyle}
                    aria-label="Loja"
                  >
                    <option value="">Selecionar loja...</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                )}
                {selectedStore && (
                  <form key={`${selectedStore.id}-${selectedStore.active}`} ref={storeFormRef} onSubmit={(event) => saveStoreForm(event, selectedStore)}>
                      <fieldset style={{ border: '1px solid var(--border)', padding: '8px', marginBottom: '6px' }}>
                        <legend>Loja</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                            Nome *
                            <input name="name" defaultValue={selectedStore.name} required autoComplete="organization" style={inputStyle} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                            Telefone
                            <input name="phone" defaultValue={selectedStore.phone} autoComplete="tel" style={inputStyle} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                            CPF/CNPJ
                            <input name="taxId" defaultValue={selectedStore.taxId} autoComplete="off" style={inputStyle} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                            Logradouro
                            <input name="addressStreet" defaultValue={selectedStore.addressStreet} autoComplete="street-address" style={inputStyle} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                            Número
                            <input name="addressNumber" defaultValue={selectedStore.addressNumber} autoComplete="off" style={inputStyle} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                            Bairro
                            <input name="addressDistrict" defaultValue={selectedStore.addressDistrict} autoComplete="off" style={inputStyle} />
                          </label>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <Button type="submit" size="sm">Salvar</Button>
                          <Button type="button" size="sm" variant="outline" onClick={clearStoreForm}>Limpar</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => toggleStore(selectedStore)}>{selectedStore.active ? 'Desativar' : 'Ativar'}</Button>
                        </div>
                      </fieldset>
                  </form>
                )}
              </Panel>

              <Panel style={panelStyle}>
                <PanelHeader title="Vendedores" />
                <fieldset style={{ border: '1px solid var(--border)', padding: '8px', marginBottom: '8px' }}>
                  <legend>Novo vendedor</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '6px' }}>
                    <input placeholder="Nome" value={newMerchant.name} onChange={(event) => setNewMerchant({ ...newMerchant, name: event.target.value })} style={inputStyle} />
                    <input placeholder="Login" value={newMerchant.login} onChange={(event) => setNewMerchant({ ...newMerchant, login: event.target.value.toLowerCase() })} style={inputStyle} />
                    <input placeholder="E-mail" value={newMerchant.email} onChange={(event) => setNewMerchant({ ...newMerchant, email: event.target.value })} style={inputStyle} />
                    <input type="password" placeholder="Senha" value={newMerchant.password} onChange={(event) => setNewMerchant({ ...newMerchant, password: event.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0' }}>
                    {stores.filter((store) => store.active).map((store) => (
                      <label key={store.id} style={{ display: 'inline-flex', gap: '4px' }}>
                        <input type="checkbox" checked={newMerchant.storeIds.includes(store.id)} onChange={(event) => toggleNewMerchantStore(store.id, event.target.checked)} />
                        {store.name}
                      </label>
                    ))}
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    Para adicionar uma foto, crie o vendedor e use o seletor no card correspondente.
                  </p>
                  <Button type="button" onClick={() => createMerchant(newMerchant)} disabled={createMerchantBusy}>
                    Criar vendedor
                  </Button>
                </fieldset>

                {merchants.map((merchant) => {
                  const draft = merchantDrafts[merchant.id] ?? merchant;
                  return (
                    <div key={merchant.id} style={{ border: '1px solid var(--border)', padding: '6px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <AvatarPicker
                        value={draft.avatarUrl}
                        fallback={draft.name}
                        size={48}
                        label="Escolher foto"
                        onUpload={(file) => uploadMerchantAvatar(merchant.id, file)}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '6px', flex: 1 }}>
                        <input value={draft.name} onChange={(event) => updateMerchantDraft(merchant.id, { name: event.target.value })} style={inputStyle} />
                        <input value={draft.login} onChange={(event) => updateMerchantDraft(merchant.id, { login: event.target.value.toLowerCase() })} style={inputStyle} />
                        <input value={draft.email} onChange={(event) => updateMerchantDraft(merchant.id, { email: event.target.value })} style={inputStyle} />
                        <label style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <input type="checkbox" checked={draft.active} onChange={(event) => updateMerchantDraft(merchant.id, { active: event.target.checked })} />
                          Ativo
                        </label>
                      </div>
                    </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0' }}>
                        {stores.filter((store) => store.active).map((store) => (
                          <label key={store.id} style={{ display: 'inline-flex', gap: '4px' }}>
                            <input type="checkbox" checked={draft.storeIds.includes(store.id)} onChange={(event) => toggleMerchantStore(merchant.id, store.id, event.target.checked)} />
                            {store.name}
                          </label>
                        ))}
                      </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
