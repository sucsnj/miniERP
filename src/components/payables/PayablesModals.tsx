import React, { useState } from 'react';
import styles from '../../styles/payables.module.css';
import type { AccountDetails } from '../../services/payablesService';
import { formatCurrency } from '../../utils/formatter';
import { formatDateString } from '../../utils/date';
import AppModalShell from '@/components/common/AppModalShell';
import Button from '@/components/common/Button';
import InlineAccountField from './InlineAccountField';
import VisibilityIcon from '@mui/icons-material/Visibility';

export type EditableAccountField = 'supplierName' | 'amount' | 'dueDate' | 'document' | 'bankNotes';

interface PayablesModalsProps {
  selectedAccount: AccountDetails | null;
  onCloseSelectedAccount: () => void;
  onUpdateField: (account: AccountDetails, field: EditableAccountField, value: string) => Promise<boolean>;
  onStatusChange: (account: AccountDetails, status: AccountDetails['status']) => Promise<boolean>;
  canWrite?: boolean;
}

const PayablesModals: React.FC<PayablesModalsProps> = ({
  selectedAccount,
  onCloseSelectedAccount,
  onUpdateField,
  onStatusChange,
  canWrite = true,
}) => {
  const [statusBusy, setStatusBusy] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const closeDetails = () => {
    setStatusBusy(false);
    setActiveFieldId(null);
    onCloseSelectedAccount();
  };

  const updateField = (field: EditableAccountField) => (value: string) =>
    selectedAccount ? onUpdateField(selectedAccount, field, value) : Promise.resolve(false);

  const changeStatus = async (status: AccountDetails['status']) => {
    if (!selectedAccount || status === selectedAccount.status || !canWrite) return;

    setStatusBusy(true);
    await onStatusChange(selectedAccount, status);
    setStatusBusy(false);
  };

  const canEdit = canWrite && Boolean(selectedAccount);

  return (
    <AppModalShell
      isOpen={Boolean(selectedAccount)}
      onClose={closeDetails}
      title="Detalhes da conta"
      titleId="payables-detail-modal-title"
      icon={<VisibilityIcon />}
      closeAriaLabel="Fechar detalhes da conta"
      footerRight={(
        <Button type="button" variant="outline" size="sm" onClick={closeDetails}>
          Fechar
        </Button>
      )}
    >
      {selectedAccount ? (
        <div className={styles.accountDetails}>
          <InlineAccountField fieldId="supplierName" label="Distribuidora" value={selectedAccount.supplierName} canWrite={canEdit} activeFieldId={activeFieldId} onActiveFieldChange={setActiveFieldId} onSave={updateField('supplierName')} required />
          <InlineAccountField fieldId="amount" label="Valor" value={selectedAccount.amount.toFixed(2)} displayValue={`R$ ${formatCurrency(selectedAccount.amount, 2)}`} inputType="number" canWrite={canEdit} activeFieldId={activeFieldId} onActiveFieldChange={setActiveFieldId} onSave={updateField('amount')} required />
          <InlineAccountField fieldId="dueDate" label="Vencimento" value={selectedAccount.dueDate} displayValue={formatDateString(selectedAccount.dueDate, 'DD/MM/YYYY')} inputType="date" canWrite={canEdit} activeFieldId={activeFieldId} onActiveFieldChange={setActiveFieldId} onSave={updateField('dueDate')} required />
          <InlineAccountField fieldId="document" label="Documento" value={selectedAccount.document} canWrite={canEdit} activeFieldId={activeFieldId} onActiveFieldChange={setActiveFieldId} onSave={updateField('document')} required />
          <div className={styles.accountField}>
            <span className={styles.accountFieldLabel}>Status</span>
            <select
              className={`${styles.accountStatusSelect} ${selectedAccount.status === 'Pago' ? styles.statusPago : styles.statusPendente}`}
              value={selectedAccount.status}
              disabled={!canEdit || statusBusy}
              onMouseDown={() => setActiveFieldId(null)}
              onFocusCapture={() => setActiveFieldId(null)}
              onChange={(event) => void changeStatus(event.target.value as AccountDetails['status'])}
              aria-label="Status da conta"
            >
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
            </select>
          </div>
          <InlineAccountField fieldId="bankNotes" label="Banco / Observações" value={selectedAccount.bankNotes ?? ''} displayValue={selectedAccount.bankNotes || 'Sem observações'} inputType="textarea" rows={4} canWrite={canEdit} activeFieldId={activeFieldId} onActiveFieldChange={setActiveFieldId} onSave={updateField('bankNotes')} />
        </div>
      ) : null}
    </AppModalShell>
  );
};

export default PayablesModals;
