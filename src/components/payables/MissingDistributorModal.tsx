import { useMemo, useState } from 'react';
import AppModalShell from '@/components/common/AppModalShell';
import Button from '@/components/common/Button';
import type { DistributorConfig } from '../../services/payablesService';
import { importPayablesXml } from '../../services/payablesService';
import { useToast } from '../../hooks/useToast';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface MissingDistributorModalProps {
  xml: string;
  emitterName: string;
  emitterTaxId?: string | null;
  availableDistributors: DistributorConfig[];
  onClose: () => void;
  onImported: (recordsCount: number) => void;
}

export default function MissingDistributorModal({
  xml,
  emitterName,
  emitterTaxId,
  availableDistributors,
  onClose,
  onImported,
}: MissingDistributorModalProps) {
  const { showToast } = useToast();
  const enabledDistributors = useMemo(
    () => availableDistributors.filter((item) => item.enabled).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [availableDistributors]
  );
  const [mode, setMode] = useState<'existing' | 'new'>(enabledDistributors.length > 0 ? 'existing' : 'new');
  const [selectedId, setSelectedId] = useState(enabledDistributors[0]?.id ?? '');
  const [newDistributorName, setNewDistributorName] = useState(emitterName.trim());
  const [newTaxIds, setNewTaxIds] = useState(emitterTaxId ? emitterTaxId.replace(/\D/g, '') : '');
  const [newAliases, setNewAliases] = useState(emitterName.trim());
  const [saving, setSaving] = useState(false);

  const handleImport = async () => {
    setSaving(true);

    try {
  const override = mode === 'existing'
    ? { distributorId: selectedId }
    : {
        newDistributorName: newDistributorName.trim(),
        newDistributorTaxId: newTaxIds.trim(),
        newDistributorAliases: newAliases.split(/[,;\n]/).map((value) => value.trim()).filter(Boolean),
      };

      if (mode === 'new' && !override.newDistributorName) {
        showToast('Informe o nome da distribuidora.', 'error');
        setSaving(false);
        return;
      }

      if (mode === 'existing' && !selectedId) {
        showToast('Selecione uma distribuidora cadastrada.', 'error');
        setSaving(false);
        return;
      }

      const result = await importPayablesXml(xml, override);

      if (result.sucesso) {
        showToast(`Importação concluída: ${result.registros?.length ?? 0} registro(s) inserido(s).`, 'success');
        onImported(result.registros?.length ?? 0);
      } else {
        showToast('A distribuidora foi adicionada, mas a importação não encontrou registros novos.', 'error');
        onClose();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao importar XML.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModalShell
      isOpen
      onClose={onClose}
      title="Distribuidora não encontrada"
      titleId="missing-distributor-modal-title"
      icon={<StorefrontIcon />}
      closeAriaLabel="Fechar importação de distribuidora"
      footerLeft={(
        <Button type="button" size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
      )}
      footerRight={(
           <Button type="button" size="sm" variant="success" onClick={handleImport} disabled={saving}>
           {mode === 'existing' ? 'Associar e importar' : 'Adicionar e importar'}
         </Button>
      )}
    >
      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--muted)' }}>
        A XML foi emitida por: <strong style={{ color: 'var(--foreground)' }}>{emitterName}</strong>.<br />
        Escolha uma distribuidora cadastrada ou crie uma nova para esse emitente.
      </p>

      <div role="radiogroup" aria-label="Como adicionar" style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Button type="button" size="sm" variant={mode === 'existing' ? 'primary' : 'outline'} onClick={() => setMode('existing')}>
          Usar cadastrada
        </Button>
        <Button type="button" size="sm" variant={mode === 'new' ? 'primary' : 'outline'} onClick={() => setMode('new')}>
          Criar nova
        </Button>
      </div>

      {mode === 'existing' ? (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
          Distribuidoras cadastradas
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} style={{ padding: '8px' }}>
            {enabledDistributors.length === 0 && <option value="">Nenhuma cadastrada</option>}
            {enabledDistributors.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
            Nome da distribuidora *
            <input value={newDistributorName} onChange={(event) => setNewDistributorName(event.target.value)} autoComplete="off" style={{ padding: '8px' }} />
          </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
            CNPJ/CPF da distribuidora (um ou mais, separados por vírgula)
            <input value={newTaxIds} onChange={(event) => setNewTaxIds(event.target.value)} placeholder="00.000.000/0000-00" autoComplete="off" style={{ padding: '8px' }} />
          </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
            Identificadores do XML (separados por vírgula)
            <input value={newAliases} onChange={(event) => setNewAliases(event.target.value)} autoComplete="off" style={{ padding: '8px' }} />
          </label>
        </div>
      )}
    </AppModalShell>
  );
}
