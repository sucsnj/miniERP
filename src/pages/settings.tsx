import Head from 'next/head';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import { useThemeMode, type ThemeMode } from '../contexts/ThemeContext';

const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'Sistema', description: 'Segue o tema do sistema operacional.' },
  { value: 'light', label: 'Claro', description: 'Tema claro para o aplicativo.' },
  { value: 'dark', label: 'Escuro', description: 'Tema escuro para o aplicativo.' },
];

const SettingsPage = () => {
  const { themeMode, setThemeMode } = useThemeMode();

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
      </PageShell>
    </>
  );
};

export default SettingsPage;
