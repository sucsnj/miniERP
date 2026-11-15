import React from 'react';
import { useState } from 'react';
import { AccountDetails } from '../../services/payablesService';
import { formatDateString } from '../../utils/date';
import { formatCurrency } from '../../utils/formatter';
import styles from '../../styles/payables.module.css';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/common/Button';
import DeleteIcon from '@mui/icons-material/Delete';

interface PayablesLastTenProps {
  latestAccounts: AccountDetails[];
  handleView: (account: AccountDetails) => void;
  handleDelete: (id: string) => void;
  canWrite?: boolean;
}

const PayablesLastTen: React.FC<PayablesLastTenProps> = ({
  latestAccounts,
  handleView,
  handleDelete,
  canWrite = true,
}) => {

  // Estado para o diálogo
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openConfirm = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  return (
    <div className={styles.lastTenPanel}>
      <h3>Últimas 10 contas registradas</h3>
      <table className={`${styles.detailTable} ${styles.compactTable}`}>
        <thead>
          <tr>
            <th>Vencimento</th>
            <th>Distribuidora</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {latestAccounts.map((account) => (
            <tr
              key={account.id}
              className={styles.clickableRow}
              tabIndex={0}
              role="button"
              aria-label={`Abrir detalhes de ${account.supplierName}`}
              onClick={() => handleView(account)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleView(account);
                }
              }}
            >
              <td>{formatDateString(account.dueDate, 'DD/MM/YYYY')}</td>
              <td>{account.supplierName}</td>
              <td>R$ {formatCurrency(account.amount, 2)}</td>
              <td className={styles.actionsCell} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                {canWrite && (
                  <Button type="button" variant="danger" size="sm" onClick={() => openConfirm(account.id)} leftIcon={<DeleteIcon />}>
                    Excluir
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {latestAccounts.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.emptyRow}>
                Nenhuma conta registrada ainda.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta conta?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => {
          if (selectedId !== null) {
            handleDelete(selectedId);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default PayablesLastTen;
