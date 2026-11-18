import { useEffect, useState } from 'react';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useToast } from '../../hooks/useToast';
import styles from '../../styles/distributorSettings.module.css';
import type { DistributorConfig } from '../../services/adminService';
import { fetchDistributors, replaceDistributors } from '../../services/adminService';
import { MASONRY_CARD_STYLE } from '../../utils/layout';

const newId = () => crypto.randomUUID();

const parseDraftAliases = (value: string) => value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);

export default function DistributorSettings() {
  const { showToast } = useToast();
  const [distributors, setDistributors] = useState<DistributorConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAliases, setDraftAliases] = useState('');
  const [ruleId, setRuleId] = useState('');
  const [ruleName, setRuleName] = useState('Nova regra');
  const [ruleType, setRuleType] = useState<'amount_adjustment' | 'name_override'>('amount_adjustment');
  const [ruleValue, setRuleValue] = useState('0');

  const selected = distributors.find((item) => item.id === selectedId) ?? null;

  const setActive = (_distributors: DistributorConfig[], id: string) => {
    const item = _distributors.find((row) => row.id === id);
    setSelectedId(item?.id ?? '');
    setDraftName(item?.name ?? '');
    setDraftAliases(item?.aliases.join(', ') ?? '');
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const body = await fetchDistributors();
        if (!mounted) return;

        setDistributors(body.distributors);
        const first = body.distributors[0];
        setActive(body.distributors, first?.id ?? '');
      } catch (error) {
        if (mounted) {
          showToast(error instanceof Error ? error.message : 'Erro ao carregar distribuidoras.', 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = (config: DistributorConfig[], preferredId?: string) => {
    setDistributors(config);
    const targetId = preferredId && config.some((item) => item.id === preferredId)
      ? preferredId
      : config[0]?.id;
    setActive(config, targetId ?? '');
    setIsEditing(false);
  };

  const persist = async (next: DistributorConfig[], preferredId?: string) => {
    setSaving(true);

    try {
      const body = await replaceDistributors(next);
      show(body.distributors, preferredId);
      showToast('Distribuidoras atualizadas.', 'success');
      return body.distributors;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao salvar distribuidoras.', 'error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const startNew = () => {
    setIsEditing(true);
    setSelectedId(`new-${newId()}`);
    setDraftName('');
    setDraftAliases('');
  };

  const selectDistributor = (item: DistributorConfig) => {
    setSelectedId(item.id);
    setDraftName(item.name);
    setDraftAliases(item.aliases.join(', '));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    if (selected) {
      setDraftName(selected.name);
      setDraftAliases(selected.aliases.join(', '));
    } else {
      setDraftName('');
      setDraftAliases('');
    }
    setIsEditing(false);
  };

  const saveDistributor = async () => {
    const name = draftName.trim();
    const aliases = parseDraftAliases(draftAliases);

    if (!name) {
      showToast('Informe o nome da distribuidora.', 'error');
      return;
    }

    const wasNew = selectedId.startsWith('new-');
    const id = wasNew ? newId() : selectedId;
    const nextDistributor: DistributorConfig = {
      id,
      name,
      aliases,
      enabled: selected?.enabled ?? true,
      rules: selected?.rules ?? [],
    };

    const next = wasNew
      ? [...distributors, nextDistributor]
      : distributors.map((item) => item.id === selectedId ? nextDistributor : item);

    await persist(next, id);
  };

  const deleteDistributor = async () => {
    if (!selected) return;
    const next = distributors.filter((item) => item.id !== selected.id);
    await persist(next, next[0]?.id);
  };

  const resetRuleEditor = () => {
    setRuleId('');
    setRuleName('Nova regra');
    setRuleType('amount_adjustment');
    setRuleValue('0');
  };

  const startNewRule = () => {
    resetRuleEditor();
  };

  const startEditRule = (ruleIdToEdit: string) => {
    const rule = selected?.rules.find((item) => item.id === ruleIdToEdit);
    if (!rule) return;
    setRuleId(rule.id);
    setRuleName(rule.name);
    setRuleType(rule.type);
    setRuleValue(String(rule.value));
  };

  const saveRule = async () => {
    if (!selected) return;

    const value = ruleType === 'amount_adjustment' ? Number(ruleValue) : ruleValue.trim();
    if (ruleType === 'amount_adjustment' && !Number.isFinite(value as number)) {
      showToast('Informe um valor numérico válido.', 'error');
      return;
    }
    if (ruleType === 'name_override' && !String(value).trim()) {
      showToast('Informe o novo nome para a distribuidora.', 'error');
      return;
    }

    const rule = {
      id: ruleId || newId(),
      name: ruleName.trim() || (ruleType === 'amount_adjustment' ? 'Ajuste de valor' : 'Renomear'),
      type: ruleType,
      value,
      enabled: true,
    };

    const others = selected.rules.filter((item) => item.id !== rule.id);
    const next = distributors.map((item) =>
      item.id === selected.id ? { ...item, rules: [...others, rule] } : item
    );

    await persist(next, selected.id);
    resetRuleEditor();
  };

  const deleteRule = async (ruleIdToDelete: string) => {
    if (!selected) return;
    const next = distributors.map((item) =>
      item.id === selected.id ? { ...item, rules: item.rules.filter((rule) => rule.id !== ruleIdToDelete) } : item
    );
    await persist(next, selected.id);
  };

  if (loading) {
    return <Panel style={MASONRY_CARD_STYLE}><p style={{ margin: 0 }}>Carregando distribuidoras…</p></Panel>;
  }

  return (
    <Panel style={MASONRY_CARD_STYLE}>
      <PanelHeader title="Distribuidoras da importação XML" chip={<Button type="button" size="sm" leftIcon={<AddIcon />} onClick={startNew} style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Nova</Button>} />
      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--muted)' }}>
        Cadastro usado na importação de notas. Cada distribuidora pode ter múltiplas regras.
      </p>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
        Distribuidora
        <select
          value={selected?.id ?? ''}
          onChange={(event) => {
            const item = distributors.find((entry) => entry.id === event.target.value);
            if (item) selectDistributor(item);
          }}
          disabled={saving || distributors.length === 0}
          style={{ padding: '6px', width: '100%' }}
        >
          {distributors.length === 0 ? <option value="">Sem distribuidoras</option> : <option value="">Selecionar distribuidora…</option>}
          {distributors.map((item) => (
            <option key={item.id} value={item.id}>{item.name} ({item.rules.length} regra{item.rules.length === 1 ? '' : 's'})</option>
          ))}
        </select>
      </label>

      <div className={styles.details}>
          {selected || isEditing ? (
            <>
              {isEditing ? (
                <>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Nome da distribuidora *
                    <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Ex.: Cimed" autoComplete="off" style={{ padding: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    Identificadores do XML (separados por vírgula)
                    <input value={draftAliases} onChange={(e) => setDraftAliases(e.target.value)} placeholder="cimed, cimed ltda, cimed comercio..." autoComplete="off" style={{ padding: '6px' }} />
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button type="button" size="sm" onClick={saveDistributor} disabled={saving}>Salvar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>Cancelar</Button>
                  </div>
                </>
              ) : selected ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <EditIcon fontSize="small" />
                    <strong>{selected.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Identificadores: {selected.aliases.length ? selected.aliases.join(', ') : 'não informados'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button type="button" size="sm" variant="outline" leftIcon={<EditIcon />} onClick={() => setIsEditing(true)}>Editar</Button>
                    <Button type="button" size="sm" variant="danger" leftIcon={<DeleteIcon />} onClick={deleteDistributor} disabled={saving}>Excluir</Button>
                  </div>
                </>
              ) : null}

              {selected && (
                <>
                  <hr />
                  <strong style={{ fontSize: '0.85rem' }}>Regras</strong>
                  <Button type="button" size="sm" variant="outline" onClick={startNewRule}>Nova regra</Button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Nome da regra
                      <input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="Ex.: Frete Cimed" autoComplete="off" style={{ padding: '6px' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Tipo
                      <select value={ruleType} onChange={(e) => setRuleType(e.target.value as 'amount_adjustment' | 'name_override')} style={{ padding: '6px' }}>
                        <option value="amount_adjustment">Ajuste de valor (+/–)</option>
                        <option value="name_override">Renomear distribuidora</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      Valor {ruleType === 'amount_adjustment' ? '(R$)' : 'alvo'}
                      <input type={ruleType === 'amount_adjustment' ? 'number' : 'text'} step="0.01" value={ruleValue} onChange={(e) => setRuleValue(e.target.value)} style={{ padding: '6px' }} />
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button type="button" size="sm" onClick={saveRule} disabled={saving}>{ruleId ? 'Modificar regra' : 'Criar nova regra'}</Button>
                      {ruleId && <Button type="button" size="sm" variant="outline" onClick={resetRuleEditor}>Cancelar</Button>}
                    </div>
                  </div>

                  {selected.rules.length > 0 && (
                    <ul className={styles.ruleList}>
                      {selected.rules.map((rule) => (
                        <li key={rule.id} className={styles.ruleRow}>
                          <strong>{rule.name}</strong> — {rule.type === 'amount_adjustment' ? `${Number(rule.value) >= 0 ? '+' : ''}R$ ${Number(rule.value).toFixed(2)}` : `nome: ${String(rule.value)}`}
                          <div className={styles.ruleActions}>
                            <Button type="button" size="sm" variant="outline" onClick={() => startEditRule(rule.id)}>Editar</Button>
                            <Button type="button" size="sm" variant="ghost" iconOnly leftIcon={<DeleteIcon fontSize="small" />} onClick={() => deleteRule(rule.id)} aria-label="Excluir regra" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Selecione uma distribuidora para editar as regras.</p>
          )}
        </div>
    </Panel>
  );
}
