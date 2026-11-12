import Head from 'next/head';
import { FormEvent, useRef, useState } from 'react';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import {
  useSettings,
  type CompanySettingsPatch,
  type RecentSalesCount,
  type ThemeMode,
  type PixPreset,
} from '../contexts/SettingsContext';

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

const recentSalesOptions: RecentSalesCount[] = [0, 2, 4, 6, 8];

const MAX_PIX_PRESETS = 20;

const createPresetId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const upsertPixPreset = (presets: PixPreset[], candidate: Omit<PixPreset, 'id' | 'label'> & { label: string }): PixPreset[] => {
  const existingIndex = presets.findIndex((preset) => (
    preset.pixKey === candidate.pixKey
    && preset.pixName === candidate.pixName
    && preset.pixBank === candidate.pixBank
    && preset.pixCity === candidate.pixCity
  ));

  if (existingIndex >= 0) {
    return presets.map((preset, index) => (
      index === existingIndex ? { ...preset, label: candidate.label } : preset
    ));
  }

  return [
    {
      id: createPresetId(),
      label: candidate.label,
      pixKey: candidate.pixKey,
      pixName: candidate.pixName,
      pixBank: candidate.pixBank,
      pixCity: candidate.pixCity,
    },
    ...presets,
  ].slice(0, MAX_PIX_PRESETS);
};

const formatPixPresetLabel = (preset: PixPreset) => (
  preset.label ? `${preset.label} · ${preset.pixKey}` : preset.pixKey
);

const SettingsPage = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const settings = useSettings();
  const {
    companySettings,
    themeModeOverride,
    recentSalesCountOverride,
    timezoneOverride,
    autoFocusSaleInput,
    autoFocusSaleInputOverride,
    autoFocusSaleInputDelay,
    pixKey,
    pixName,
    pixBank,
    pixCity,
    pixPresets,
    setThemeMode,
    clearThemeMode,
    setRecentSalesCount,
    clearRecentSalesCount,
    setTimezone,
    clearTimezone,
    setAutoFocusSaleInput,
    clearAutoFocusSaleInput,
    setAutoFocusSaleInputDelay,
    clearAutoFocusSaleInputDelay,
    patchCompanySettings,
    clearPixData,
  } = settings;

  const [savingCompany, setSavingCompany] = useState(false);
  const pixFormRef = useRef<HTMLFormElement | null>(null);
  const [selectedPixPresetId, setSelectedPixPresetId] = useState('');

  const setPixField = (name: 'pixKey' | 'pixName' | 'pixBank' | 'pixCity' | 'pixPresetLabel', value: string) => {
    const form = pixFormRef.current;
    const field = form?.elements.namedItem(name);
    if (field instanceof HTMLInputElement) {
      field.value = value;
    }
  };

  const clearPixInputValues = () => {
    for (const name of ['pixKey', 'pixName', 'pixBank', 'pixCity', 'pixPresetLabel'] as const) {
      setPixField(name, '');
    }
  };

  const fillPixPreset = (presetId: string) => {
    const preset = pixPresets.find((item) => item.id === presetId);
    if (!preset) return;

    setPixField('pixKey', preset.pixKey);
    setPixField('pixName', preset.pixName);
    setPixField('pixBank', preset.pixBank);
    setPixField('pixCity', preset.pixCity);
    setPixField('pixPresetLabel', preset.label);
  };

  const patchCompany = async (patch: CompanySettingsPatch) => {
    setSavingCompany(true);
    try {
      await patchCompanySettings(patch);
      showToast('Configuração da empresa atualizada.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar configuração.', 'error');
    } finally {
      setSavingCompany(false);
    }
  };

  const saveCompanyPix = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;

    const data = new FormData(event.currentTarget);
    const pixValues = {
      pixKey: String(data.get('pixKey') ?? '').trim(),
      pixName: String(data.get('pixName') ?? '').trim(),
      pixBank: String(data.get('pixBank') ?? '').trim(),
      pixCity: String(data.get('pixCity') ?? '').trim(),
    };
    const presetLabel = String(data.get('pixPresetLabel') ?? '').trim();
    const pixFormFilled = Object.values(pixValues).every(Boolean);
    const nextPixPresets = pixFormFilled
      ? upsertPixPreset(pixPresets, {
          ...pixValues,
          label: presetLabel,
        })
      : pixPresets;

    await patchCompany({
      ...pixValues,
      ...(pixFormFilled ? { pixPresets: nextPixPresets } : {}),
    });
  };

  const deletePixPreset = async (presetId: string) => {
    const pixPresetsNext = pixPresets.filter((item) => item.id !== presetId);
    if (selectedPixPresetId === presetId) {
      setSelectedPixPresetId('');
    }
    await patchCompany({ pixPresets: pixPresetsNext });
  };

  const clearPix = async () => {
    clearPixInputValues();
    try {
      await clearPixData();
      showToast('Dados PIX da empresa foram removidos.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao limpar PIX.', 'error');
    }
  };

  const companyTheme = companySettings?.themeMode ?? 'system';
  const companyRecentSalesCount = companySettings?.recentSalesCount ?? 4;
  const companyTimezone = companySettings?.timezone ?? 'America/Recife';
  const companyAutoFocusSaleInput = companySettings?.autoFocusSaleInput ?? true;
  const companyAutoFocusSaleInputDelay = companySettings?.autoFocusSaleInputDelay ?? 60;
  const companyAutoConsolidationEnabled = companySettings?.autoConsolidationEnabled ?? true;
  const companyAutoConsolidationDay = companySettings?.autoConsolidationDay ?? 1;

  const adminOnlyControls = (label: string, description: string, children: React.ReactNode) => (
    <div>
      <p style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: 600 }}>{label}</p>
      {isAdmin ? children : <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{description}</p>}
    </div>
  );

  return (
    <>
      <Head><title>Configurações</title></Head>
      <PageShell>
        <PageHeader title="Configurações" description="Padrão da empresa; cada dispositivo pode usar um override local." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Tema" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Padrão visual da empresa e override local.</p>
              {adminOnlyControls('Padrão da empresa', `Atual: padrão da empresa (${companyTheme})`, (
                <select disabled={savingCompany} value={companyTheme} onChange={(event) => void patchCompany({ themeMode: event.target.value as ThemeMode })} style={{ padding: '6px', width: '100%', marginBottom: '8px' }}>
                  {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                Neste dispositivo
                <select value={themeModeOverride ?? 'company'} onChange={(event) => event.target.value === 'company' ? clearThemeMode() : setThemeMode(event.target.value as ThemeMode)} style={{ padding: '6px' }}>
                  <option value="company">Usar padrão da empresa</option>
                  {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </Panel>

          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Histórico recente" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Quantidade de vendas exibidas (0 a 8, em pares).</p>
              {adminOnlyControls('Padrão da empresa', `Atual: padrão da empresa (${companyRecentSalesCount})`, (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {recentSalesOptions.map((value) => (
                    <Button key={value} type="button" size="sm" disabled={savingCompany} variant={companyRecentSalesCount === value ? 'primary' : 'outline'} onClick={() => void patchCompany({ recentSalesCount: value })}>
                      {value}
                    </Button>
                  ))}
                </div>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                Neste dispositivo
                <select value={recentSalesCountOverride ?? 'company'} onChange={(event) => event.target.value === 'company' ? clearRecentSalesCount() : setRecentSalesCount(Number(event.target.value) as RecentSalesCount)} style={{ padding: '6px' }}>
                  <option value="company">Usar padrão da empresa</option>
                  {recentSalesOptions.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            </div>
          </Panel>

          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Fuso horário" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Padrão empresarial e override local.</p>
              {adminOnlyControls('Padrão da empresa', `Atual: padrão da empresa (${companyTimezone})`, (
                <select disabled={savingCompany} value={companyTimezone} onChange={(event) => void patchCompany({ timezone: event.target.value })} style={{ padding: '6px', width: '100%', marginBottom: '8px' }}>
                  {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                Neste dispositivo
                <select value={timezoneOverride ?? 'company'} onChange={(event) => event.target.value === 'company' ? clearTimezone() : setTimezone(event.target.value)} style={{ padding: '6px' }}>
                  <option value="company">Usar padrão da empresa</option>
                  {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </Panel>

          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Foco automático" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Foca o campo de venda periodicamente.</p>
              {adminOnlyControls('Padrão da empresa', `Atual: ${companyAutoFocusSaleInput ? 'ativado' : 'desativado'} (${companyAutoFocusSaleInputDelay}s)`, (
                <>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <Button type="button" size="sm" disabled={savingCompany} variant={companyAutoFocusSaleInput ? 'primary' : 'outline'} onClick={() => void patchCompany({ autoFocusSaleInput: true })}>Ativado</Button>
                    <Button type="button" size="sm" disabled={savingCompany} variant={!companyAutoFocusSaleInput ? 'primary' : 'outline'} onClick={() => void patchCompany({ autoFocusSaleInput: false })}>Desativado</Button>
                  </div>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', marginBottom: '8px' }}>
                    Delay (segundos)
                    <input type="number" min={5} step={5} disabled={savingCompany || !companyAutoFocusSaleInput} defaultValue={companyAutoFocusSaleInputDelay} key={companyAutoFocusSaleInputDelay} onBlur={(event) => void patchCompany({ autoFocusSaleInputDelay: Number(event.target.value) })} style={{ padding: '6px', width: '100%' }} />
                  </label>
                </>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                  Neste dispositivo
                  <select value={autoFocusSaleInputOverride === null ? 'company' : String(autoFocusSaleInputOverride)} onChange={(event) => event.target.value === 'company' ? clearAutoFocusSaleInput() : setAutoFocusSaleInput(event.target.value === 'true')} style={{ padding: '6px' }}>
                    <option value="company">Usar padrão da empresa</option>
                    <option value="true">Ativado</option>
                    <option value="false">Desativado</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', opacity: autoFocusSaleInput ? 1 : 0.5 }}>
                  Delay (segundos)
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="number" min={5} step={5} disabled={!autoFocusSaleInput} key={autoFocusSaleInputDelay} defaultValue={autoFocusSaleInputDelay} onBlur={(event) => setAutoFocusSaleInputDelay(Number(event.target.value))} style={{ padding: '6px', width: '100%' }} />
                    <Button type="button" size="sm" variant="outline" onClick={clearAutoFocusSaleInputDelay}>Usar padrão</Button>
                  </div>
                </label>
              </div>
            </div>
          </Panel>

          <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <PanelHeader title="Auto consolidação" />
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Consolida automaticamente o mês anterior no dia escolhido do mês seguinte.</p>
              {adminOnlyControls('Padrão da empresa', `Atual: ${companyAutoConsolidationEnabled ? `ativada, dia ${companyAutoConsolidationDay}` : 'desativada'}`, (
                <>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <Button type="button" size="sm" disabled={savingCompany} variant={companyAutoConsolidationEnabled ? 'primary' : 'outline'} onClick={() => void patchCompany({ autoConsolidationEnabled: true })}>Ativada</Button>
                    <Button type="button" size="sm" disabled={savingCompany} variant={!companyAutoConsolidationEnabled ? 'primary' : 'outline'} onClick={() => void patchCompany({ autoConsolidationEnabled: false })}>Desativada</Button>
                  </div>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Dia do mês seguinte
                    <select
                      value={companyAutoConsolidationDay}
                      disabled={savingCompany || !companyAutoConsolidationEnabled}
                      onChange={(event) => void patchCompany({ autoConsolidationDay: Number(event.target.value) })}
                      style={{ padding: '6px', width: '100%' }}
                    >
                      {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </label>
                </>
              ))}
            </div>
          </Panel>

          <form ref={pixFormRef} key={`${pixKey}-${pixName}-${pixBank}-${pixCity}`} onSubmit={saveCompanyPix} autoComplete="off">
            <Panel style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <PanelHeader title="PIX" />
                <p style={{ margin: '0 0 8px', fontSize: '0.8rem' }}>Dados compartilhados pela empresa. Todos são obrigatórios para o QR Code.</p>
                {isAdmin && pixPresets.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', marginBottom: '8px' }}>
                    Preenchimento rápido
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        value={selectedPixPresetId}
                        onChange={(event) => {
                          const presetId = event.target.value;
                          setSelectedPixPresetId(presetId);
                          if (presetId) fillPixPreset(presetId);
                        }}
                        style={{ padding: '6px', width: '100%' }}
                      >
                        <option value="">Selecionar preset...</option>
                        {pixPresets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {formatPixPresetLabel(preset)}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        iconOnly
                        leftIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => void deletePixPreset(selectedPixPresetId)}
                        aria-label="Excluir preset selecionado"
                        title="Excluir preset selecionado"
                        disabled={!selectedPixPresetId || savingCompany}
                      >
                        Excluir preset selecionado
                      </Button>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {isAdmin && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Apelido do preset
                      <input type="text" name="pixPresetLabel" defaultValue="" placeholder="Ex.: Conta principal, loja 2..." autoComplete="off" style={{ padding: '6px', width: '100%' }} />
                    </label>
                  )}
                  {[
                    { name: 'pixKey', label: 'Chave PIX', defaultValue: pixKey, placeholder: 'CPF/CNPJ, e-mail, telefone...' },
                    { name: 'pixName', label: 'Nome', defaultValue: pixName, placeholder: 'Nome do recebedor' },
                    { name: 'pixBank', label: 'Banco', defaultValue: pixBank, placeholder: 'Nome ou código do banco' },
                    { name: 'pixCity', label: 'Local', defaultValue: pixCity, placeholder: 'Cidade' },
                  ].map((field) => (
                    <label key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      {field.label} *
                      <input type="text" name={field.name} required defaultValue={field.defaultValue} placeholder={field.placeholder} disabled={!isAdmin} autoComplete="off" style={{ padding: '6px', width: '100%' }} />
                    </label>
                  ))}
                </div>
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <Button type="submit" size="sm" disabled={savingCompany}>Salvar PIX</Button>
                  <Button type="button" size="sm" variant="outline" onClick={clearPix}>Limpar dados PIX</Button>
                </div>
              )}
            </Panel>
          </form>
        </div>
      </PageShell>
    </>
  );
};

export default SettingsPage;
