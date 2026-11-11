import Head from 'next/head';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/common/Button';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

  if (user) {
    void router.replace('/');
    return null;
  }

  return (
    <>
      <Head>
        <title>Entrar</title>
      </Head>
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--background)' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px', padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-strong)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.35rem' }}>MinErp</h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Entre com seu login ou e-mail.</p>
          {error && <p role="alert" style={{ margin: 0, color: 'var(--danger)' }}>{error}</p>}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            Login ou e-mail
            <input
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoFocus
              required
              style={{ padding: '10px 12px' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ padding: '10px 12px' }}
            />
          </label>
          <Button type="submit" variant="primary" disabled={submitting || loading}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </main>
    </>
  );
}
