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

const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'Sistema', description: 'Segue o tema do sistema operacional.' },
  { value: 'light', label: 'Claro', description: 'Tema claro para o aplicativo.' },
  { value: 'dark', label: 'Escuro', description: 'Tema escuro para o aplicativo.' },
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
        <Panel>
          <PanelHeader title="Fuso horário" />
          <p>Usado para registrar e exibir datas e horários.</p>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            style={{ padding: '8px', minWidth: '260px' }}
          >
            {timezoneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Panel>
      </PageShell>
    </>
  );
};

export default SettingsPage;
