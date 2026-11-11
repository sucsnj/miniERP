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
  const { recentSalesCount, setRecentSalesCount, timezone, setTimezone, autoFocusSaleInput, setAutoFocusSaleInput, autoFocusSaleInputDelay, setAutoFocusSaleInputDelay } = useSettings();

  return (
    <>
      <Head>
        <title>Configurações</title>
      </Head>
      <PageShell>
        <PageHeader title="Configurações" description="Preferências do aplicativo." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Tema" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Aparência do aplicativo.</p>
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
            </div>
          </Panel>

          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Foco automático" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Foca o campo de venda periodicamente.</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  size="sm"
                  variant={autoFocusSaleInput ? 'primary' : 'outline'}
                  onClick={() => setAutoFocusSaleInput(true)}
                >
                  Ativado
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!autoFocusSaleInput ? 'primary' : 'outline'}
                  onClick={() => setAutoFocusSaleInput(false)}
                >
                  Desativado
                </Button>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', fontSize: '0.8rem', opacity: autoFocusSaleInput ? 1 : 0.5 }}>
                Delay do foco (segundos)
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={autoFocusSaleInputDelay}
                  disabled={!autoFocusSaleInput}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!Number.isNaN(parsed)) setAutoFocusSaleInputDelay(parsed);
                  }}
                  style={{ padding: '6px', width: '100%', cursor: autoFocusSaleInput ? 'text' : 'not-allowed' }}
                />
              </label>
            </div>
          </Panel>

          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Histórico recente" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Quantidade de vendas exibidas (0 a 8, em pares).</p>
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
            </div>
          </Panel>

          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Fuso horário" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Usado para registrar e exibir datas.</p>
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
            </div>
          </Panel>
        </div>
      </PageShell>
    </>
  );
};

export default SettingsPage;
