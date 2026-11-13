import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/utilities.css';
import '../styles/legacy.css';
import Nav from '../components/common/Nav';
import Toaster from '../components/common/Toaster';
import AuthGate from '../components/auth/AuthGate';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { RouteLoadingProvider, RouteContent } from '../contexts/RouteLoadingContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { tenantQueryPredicate } from '../utils/queryKeys';
import { ThemeProvider } from '../contexts/ThemeContext';
import Head from 'next/head';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: (query) =>
        Array.isArray(query.queryKey) && tenantQueryPredicate(query.queryKey as readonly unknown[]),
      refetchOnReconnect: (query) =>
        Array.isArray(query.queryKey) && tenantQueryPredicate(query.queryKey as readonly unknown[]),
      refetchOnMount: (query) =>
        Array.isArray(query.queryKey) && tenantQueryPredicate(query.queryKey as readonly unknown[])
          ? 'always'
          : false,
    },
  },
});
const PUBLIC_PATHS = ['/login', '/setup'];

// Handler de API ou componente exportado.
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(router.pathname);

  return (
    <RouteLoadingProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <Head>
              <title>Vendas</title>
              <meta name="description" content="Vendas" />
              <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            {!isPublic && <Nav />}
            <RouteContent>
              <AuthGate>
                <Component {...pageProps} />
              </AuthGate>
            </RouteContent>
            <Toaster />
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
    </RouteLoadingProvider>
  );
}
