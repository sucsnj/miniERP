import Head from 'next/head';
import { FormEvent, useState } from 'react';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import RequireAdmin from '@/components/auth/RequireAdmin';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import {
  changeProfilePassword,
  updateProfile,
  updateProfileContact,
} from '../services/profileService';
import { uploadAvatar } from '../services/avatarService';
import AvatarPicker from '@/components/common/AvatarPicker';
import styles from '../styles/profile.module.css';
import { normalizeContactProfile } from '../utils/businessProfile';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const data = new FormData(event.currentTarget);
    setSavingProfile(true);
    try {
      const body = await updateProfile({
        name: String(data.get('name') ?? '').trim(),
        login: String(data.get('login') ?? '').toLowerCase().trim(),
        email: String(data.get('email') ?? '').trim(),
      });
      if (body.user) setUser(body.user);
      showToast('Perfil atualizado com sucesso.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar o perfil.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const data = new FormData(event.currentTarget);
    const parsed = normalizeContactProfile(Object.fromEntries(data.entries()));
    if (!parsed.ok) {
      showToast(parsed.message, 'error');
      return;
    }

    setSavingContact(true);
    try {
      const body = await updateProfileContact(parsed.value);
      if (body.user) setUser(body.user);
      showToast('Dados de contato atualizados com sucesso.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar os dados de contato.', 'error');
    } finally {
      setSavingContact(false);
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      showToast('A confirmação da senha não confere.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const body = await changeProfilePassword({ currentPassword, newPassword });
      if (body.user) setUser(body.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha atualizada com sucesso.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar a senha.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const uploadProfileAvatar = async (file: File) => {
    const body = await uploadAvatar(file);
    if (body.user) setUser(body.user);
    showToast('Foto de perfil atualizada.', 'success');
  };

  return (
    <RequireAdmin>
      <>
        <Head>
          <title>Perfil | MinErp</title>
          <meta name="description" content="Perfil do administrador do sistema." />
        </Head>
        <PageShell>
          <PageHeader title="Perfil" description="Dados e senha da conta de administrador." />
          <div className={styles.grid}>
            <Panel style={{ padding: '12px' }}>
              <PanelHeader title="Foto de perfil" />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <AvatarPicker
                  value={user?.avatarUrl}
                  fallback={user?.name ?? ''}
                  size={96}
                  label="Escolher foto"
                  caption="PNG, JPEG, GIF ou WebP, até 5 MB."
                  onUpload={uploadProfileAvatar}
                />
              </div>
            </Panel>

            <form key={user?.userId} onSubmit={saveProfile}>
              <Panel style={{ padding: '12px' }}>
                <PanelHeader title="Dados pessoais" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Nome *
                    <input type="text" name="name" defaultValue={user?.name ?? ''} required autoComplete="name" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Apelido *
                    <input type="text" name="login" defaultValue={user?.login ?? ''} pattern="[A-Za-z]{4,}" required autoComplete="username" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    E-mail *
                    <input type="email" name="email" defaultValue={user?.email ?? ''} required autoComplete="email" style={{ padding: '8px' }} />
                  </label>
                  <Button type="submit" size="sm" disabled={savingProfile}>
                    {savingProfile ? 'Salvando...' : 'Salvar dados'}
                  </Button>
                </div>
              </Panel>
            </form>

            <form key={`${user?.userId}-contact`} onSubmit={saveContact}>
              <Panel style={{ padding: '12px' }}>
                <PanelHeader title="Dados de contato" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '12px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                    Telefone
                    <input type="tel" name="phone" defaultValue={user?.contact.phone ?? ''} autoComplete="tel" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                    Logradouro
                    <input type="text" name="addressStreet" defaultValue={user?.contact.addressStreet ?? ''} autoComplete="street-address" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Número
                    <input type="text" name="addressNumber" defaultValue={user?.contact.addressNumber ?? ''} autoComplete="off" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Complemento
                    <input type="text" name="addressComplement" defaultValue={user?.contact.addressComplement ?? ''} autoComplete="off" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Bairro
                    <input type="text" name="addressDistrict" defaultValue={user?.contact.addressDistrict ?? ''} autoComplete="off" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Cidade
                    <input type="text" name="addressCity" defaultValue={user?.contact.addressCity ?? ''} autoComplete="address-level2" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    UF
                    <input type="text" name="addressState" defaultValue={user?.contact.addressState ?? ''} maxLength={2} autoComplete="address-level1" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    CEP
                    <input type="text" name="addressZip" defaultValue={user?.contact.addressZip ?? ''} maxLength={9} autoComplete="postal-code" style={{ padding: '8px' }} />
                  </label>
                  <Button type="submit" size="sm" disabled={savingContact} style={{ alignSelf: 'flex-start' }}>
                    {savingContact ? 'Salvando...' : 'Salvar contato'}
                  </Button>
                </div>
              </Panel>
            </form>

            <form onSubmit={savePassword}>
              <Panel style={{ padding: '12px' }}>
                <PanelHeader title="Alterar senha" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Senha atual *
                    <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Nova senha *
                    <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} autoComplete="new-password" style={{ padding: '8px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Confirmar nova senha *
                    <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" style={{ padding: '8px' }} />
                  </label>
                  <Button type="submit" size="sm" variant="outline" disabled={savingPassword}>
                    {savingPassword ? 'Salvando...' : 'Alterar senha'}
                  </Button>
                </div>
              </Panel>
            </form>
          </div>
        </PageShell>
      </>
    </RequireAdmin>
  );
};

export default ProfilePage;
