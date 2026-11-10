import type { AppProps } from 'next/app';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/utilities.css';
import '../styles/legacy.css';
import Nav from '../components/common/Nav';
import Toaster from '../components/common/Toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';

const queryClient = new QueryClient();

// Handler de API ou componente exportado.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Vendas</title>
        <meta name="description" content="Vendas" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <Nav />
      <Component {...pageProps} />
      <Toaster />
    </QueryClientProvider>
  );
}
