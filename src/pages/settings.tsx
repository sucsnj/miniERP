import Head from 'next/head';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import { useThemeMode, type ThemeMode } from '../contexts/ThemeContext';
import { useSettings, type RecentSalesCount } from '../contexts/SettingsContext';

const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'Sistema', description: 'Segue o tema do sistema operacional.' },
  { value: 'light', label: 'Claro', description: 'Tema claro para o aplicativo.' },
  { value: 'dark', label: 'Escuro', description: 'Tema escuro para o aplicativo.' },
];

const SettingsPage = () => {
  const { themeMode, setThemeMode } = useThemeMode();
  const { recentSalesCount, setRecentSalesCount } = useSettings();

  return (
    <>
      <Head>
        <title>Configurações</title>
      </Head>
      <PageShell>
        <PageHeader title="Configurações" description="Preferências do aplicativo." />
        <Panel>
          <PanelHeader title="Tema do aplicativo" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={themeMode === option.value ? 'primary' : 'outline'}
                onClick={() => setThemeMode(option.value)}
              >
                {option.label} — {option.description}
              </Button>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Histórico de vendas recentes" />
          <p>Quantidade de vendas exibidas no histórico (0 a 8, em pares).</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([0, 2, 4, 6, 8] as RecentSalesCount[]).map((value) => (
              <Button
                key={value}
                type="button"
                variant={recentSalesCount === value ? 'primary' : 'outline'}
                onClick={() => setRecentSalesCount(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </Panel>
      </PageShell>
    </>
  );
};

export default SettingsPage;
