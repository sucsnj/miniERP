import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useId,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { PageSkeleton } from '../components/common/Skeleton';

interface RouteLoadingContextValue {
  pendingCount: number;
  register: (key: string) => () => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextValue | undefined>(undefined);

export function RouteLoadingProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<Record<string, number>>({});

  const register = useCallback((key: string) => {
    setKeys((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }));

    let released = false;
    return () => {
      if (released) return;
      released = true;
      setKeys((current) => {
        const next = { ...current };
        const count = (next[key] ?? 1) - 1;
        if (count <= 0) delete next[key];
        else next[key] = count;
        return next;
      });
    };
  }, []);

  const value = useMemo(
    () => ({ pendingCount: Object.values(keys).reduce((sum, count) => sum + count, 0), register }),
    [keys, register]
  );

  return <RouteLoadingContext.Provider value={value}>{children}</RouteLoadingContext.Provider>;
}

export function RouteContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const context = useContext(RouteLoadingContext);
  const isPublic = router.pathname === '/login' || router.pathname === '/setup';
  const isLoading = !isPublic && (context?.pendingCount ?? 0) > 0;

  if (isPublic) return <>{children}</>;

  return (
    <>
      {isLoading && <PageSkeleton cards={4} />}
      <div aria-hidden={isLoading} style={{ display: isLoading ? 'none' : undefined }}>
        {children}
      </div>
    </>
  );
}

export function usePendingTask(key: string, pending: boolean): void {
  const context = useContext(RouteLoadingContext);
  const id = useId();

  useEffect(() => {
    if (!pending || !context) return undefined;
    return context.register(`${key}:${id}`);
  }, [context, id, key, pending]);
}
