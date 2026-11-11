import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/common/Button';
import { useAuth } from '../contexts/AuthContext';

export default function SetupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [pinMaster, setPinMaster] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [firstStoreName, setFirstStoreName] = useState('Loja principal');
  const [adminName, setAdminName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ pinMaster, companyName, firstStoreName, adminName, login, email, password }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? 'Não foi possível concluir o bootstrap.');
      await refresh();
      await router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o bootstrap.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Primeiro acesso</title>
      </Head>
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--background)' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '520px', padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-strong)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Configurar primeiro acesso</h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Disponível apenas enquanto não existe nenhum administrador.</p>
          {available === false && <p role="alert" style={{ margin: 0, color: 'var(--danger)' }}>O bootstrap já foi concluído. <Link href="/login">Entrar</Link>.</p>}
          {available !== false && (
            <>
              {error && <p role="alert" style={{ margin: 0, color: 'var(--danger)' }}>{error}</p>}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>PIN_MASTER<input type="password" value={pinMaster} onChange={(event) => setPinMaster(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Empresa<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Primeira loja<input value={firstStoreName} onChange={(event) => setFirstStoreName(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Nome do administrador<input value={adminName} onChange={(event) => setAdminName(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Login<input value={login} onChange={(event) => setLogin(event.target.value.toLowerCase())} pattern="[A-Za-z]{4,}" required style={{ padding: '10px 12px' }} /></label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ padding: '10px 12px' }} /></label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>Senha<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} style={{ padding: '10px 12px' }} /></label>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>A senha deve ter pelo menos 8 caracteres, letras, números e um caractere especial seguro.</p>
              <Button type="submit" variant="primary" disabled={submitting || available === null}>{submitting ? 'Criando...' : 'Criar primeiro acesso'}</Button>
            </>
          )}
        </form>
      </main>
    </>
  );
}
