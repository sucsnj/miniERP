import { Fragment, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

const PUBLIC_PATHS = ['/login', '/setup'];

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPublic = PUBLIC_PATHS.includes(router.pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      void router.replace('/login');
    }
  }, [isPublic, loading, router, user]);

  if (isPublic) return <>{children}</>;
  if (loading) return <p style={{ padding: '24px' }}>Carregando sessão...</p>;
  if (!user) return null;
  return <Fragment key={user.storeId}>{children}</Fragment>;
}
