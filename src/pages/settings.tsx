import Head from 'next/head';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import { useThemeMode, type ThemeMode } from '../contexts/ThemeContext';
import { useSettings, type RecentSalesCount } from '../contexts/SettingsContext';

const timezoneOptions = [
  { value: 'America/Recife', label: 'Recife (UTC-03)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-03)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC-03)' },
  { value: 'America/Belem', label: 'Belém (UTC-03)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-04)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (UTC-05)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-02)' },
  { value: 'UTC', label: 'UTC (UTC+00)' },
  { value: 'Europe/Lisbon', label: 'Lisboa (UTC+00/+01)' },
  { value: 'America/New_York', label: 'Nova York (UTC-05/-04)' },
];

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

const SettingsPage = () => {
  const { themeMode, setThemeMode } = useThemeMode();
  const { recentSalesCount, setRecentSalesCount, timezone, setTimezone } = useSettings();

  return (
    <>
      <Head>
        <title>Configurações</title>
      </Head>
      <PageShell>
        <PageHeader title="Configurações" description="Preferências do aplicativo." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          <Panel style={{ padding: '10px' }}>
            <PanelHeader title="Tema" />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={themeMode === option.value ? 'primary' : 'outline'}
                  onClick={() => setThemeMode(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Panel>

          <Panel style={{ padding: '10px' }}>
            <PanelHeader title="Histórico recente" />
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem' }}>Quantidade de vendas (0 a 8, em pares).</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {([0, 2, 4, 6, 8] as RecentSalesCount[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={recentSalesCount === value ? 'primary' : 'outline'}
                  onClick={() => setRecentSalesCount(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </Panel>

          <Panel style={{ padding: '10px' }}>
            <PanelHeader title="Fuso horário" />
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem' }}>Usado para registrar e exibir datas.</p>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{ padding: '6px', width: '100%' }}
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Panel>
        </div>
      </PageShell>
    </>
  );
};

export default SettingsPage;
