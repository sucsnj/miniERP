import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Nav from '../components/Nav';
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
    </QueryClientProvider>
  );
}
