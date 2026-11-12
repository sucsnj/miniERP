import Head from 'next/head';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/common/Button';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pinMaster, setPinMaster] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [firstStoreName, setFirstStoreName] = useState('Loja principal');
  const [adminName, setAdminName] = useState('');
  const [loginInput, setAdminLoginInput] = useState('');
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/bootstrap')
      .then(async (response) => {
        const body = await response.json();
        if (mounted) setAvailable(Boolean(body.available));
      })
      .catch(() => {
        if (mounted) setAvailable(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBootstrap = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ pinMaster, companyName, firstStoreName, adminName, login: loginInput, email, password: adminPassword }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? 'Não foi possível criar a conta.');
      await refresh();
      await router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    void router.replace('/');
    return null;
  }

  return (
    <>
      <Head>
        <title>MinErp</title>
      </Head>
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--background)' }}>
        <section style={{ width: '100%', maxWidth: '520px', padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-strong)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.35rem' }}>MinErp</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="button" size="sm" variant={mode === 'login' ? 'primary' : 'outline'} onClick={() => setMode('login')}>Entrar</Button>
            {available !== false && (
              <Button type="button" size="sm" variant={mode === 'bootstrap' ? 'primary' : 'outline'} onClick={() => setMode('bootstrap')} disabled={available === null}>Criar conta</Button>
            )}
          </div>

          {error && <p role="alert" style={{ margin: 0, color: 'var(--danger)' }}>{error}</p>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>Entre com seu login ou e-mail.</p>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                Login ou e-mail
                <input autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required style={{ padding: '10px 12px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                Senha
                <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ padding: '10px 12px' }} />
              </label>
              <Button type="submit" variant="primary" disabled={submitting || loading}>{submitting ? 'Entrando...' : 'Entrar'}</Button>
            </form>
          ) : (
            <form onSubmit={handleBootstrap} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>Crie o primeiro administrador da empresa. Após o login, lojas e vendedores podem ser administrados.</p>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>PIN_MASTER<input type="password" value={pinMaster} onChange={(event) => setPinMaster(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Empresa<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Primeira loja<input value={firstStoreName} onChange={(event) => setFirstStoreName(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Seu nome<input value={adminName} onChange={(event) => setAdminName(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Login<input value={loginInput} onChange={(event) => setAdminLoginInput(event.target.value.toLowerCase())} pattern="[A-Za-z]{4,}" required style={{ padding: '10px 12px' }} /></label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Senha<input type="password" autoComplete="new-password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} required minLength={8} style={{ padding: '10px 12px' }} /></label>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>A senha deve ter pelo menos 8 caracteres, letras, números e um caractere especial seguro.</p>
              <Button type="submit" variant="primary" disabled={submitting || available === null}>{submitting ? 'Criando conta...' : 'Criar conta'}</Button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
