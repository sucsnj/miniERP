import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { showToast } from '../utils/toast';
import type { ContactProfile } from '../utils/businessProfile';

export type AuthRole = 'admin' | 'merchant';

export interface AuthUser {
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
  sessionExpiresAt: string;
  sessionAbsoluteExpiresAt: string;
  contact: ContactProfile;
}

const SESSION_WARNING_LEAD_MS = 24 * 60 * 60 * 1000;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? 'Não foi possível concluir a operação.');
  return body;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'x-session-heartbeat': '1' },
      });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const body = await parseJson<{ user: AuthUser }>(response);
      setUser(body.user);
    } catch {
      // Mantém o estado atual quando o servidor/rede está indisponível.
    } finally {
      setLoading(false);
      refreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  useEffect(() => {
    if (!user?.sessionExpiresAt || !user.sessionAbsoluteExpiresAt) return;

    const deadline = Math.min(
      new Date(user.sessionExpiresAt).getTime(),
      new Date(user.sessionAbsoluteExpiresAt).getTime(),
    );
    if (Number.isNaN(deadline)) return;

    // Valida no instante do deadline, em vez de esperar o intervalo de poll (30s).
    const id = window.setTimeout(() => {
      void refresh();
    }, Math.max(0, deadline - Date.now()));

    return () => window.clearTimeout(id);
  }, [user?.sessionExpiresAt, user?.sessionAbsoluteExpiresAt, refresh]);

  useEffect(() => {
    if (!user?.sessionExpiresAt || !user.sessionAbsoluteExpiresAt) return;

    const deadline = Math.min(
      new Date(user.sessionExpiresAt).getTime(),
      new Date(user.sessionAbsoluteExpiresAt).getTime(),
    );
    const timeLeft = deadline - Date.now();
    if (Number.isNaN(deadline) || timeLeft > SESSION_WARNING_LEAD_MS || timeLeft <= 0) return;

    const notify = () => {
      const hours = Math.max(1, Math.ceil((deadline - Date.now()) / (60 * 60 * 1000)));
      showToast(`Sua sessão expira em menos de 24 horas (${hours}h). Salve o que estiver pendente.`, 'info', 5000);
    };

    notify();
    const id = window.setInterval(notify, 45_000);

    return () => window.clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const id = window.setInterval(() => {
      void refresh();
    }, 30_000);

    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };

    document.addEventListener('visibilitychange', checkWhenVisible);
    window.addEventListener('focus', checkWhenVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', checkWhenVisible);
      window.removeEventListener('focus', checkWhenVisible);
    };
  }, [refresh, user]);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ identifier, password }),
    });
    const body = await parseJson<{ user: AuthUser }>(response);
    setUser(body.user);
    await router.push('/');
  }, [router]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    setUser(null);
    await router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
