import React from 'react';
import { useState } from 'react';
import { AccountDetails } from '../../services/contasService';
import { formatDateString } from '../../utils/date';
import { formatCurrency } from '../../utils/formatter';
import styles from '../../styles/contas.module.css';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/common/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface PayablesLastTenProps {
  latestAccounts: AccountDetails[];
  handleView: (account: AccountDetails) => void;
  handleDelete: (id: number) => void;
  handleEdit: (account: AccountDetails) => void;
}

const PayablesLastTen: React.FC<PayablesLastTenProps> = ({
  latestAccounts,
  handleView,
  handleDelete,
  handleEdit,
}) => {

  // Estado para o diálogo
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const openConfirm = (id: number) => {
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
            <tr key={account.id}>
              <td>{formatDateString(account.vencimento, 'DD/MM/YYYY')}</td>
              <td>{account.distribuidora}</td>
              <td>R$ {formatCurrency(account.valor, 2)}</td>
              <td className={styles.actionsCell}>
                <Button type="button" variant="info" size="sm" onClick={() => handleView(account)} leftIcon={<VisibilityIcon />}>
                  Ver
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={() => openConfirm(account.id)} leftIcon={<DeleteIcon />}>
                  Excluir
                </Button>
                <Button type="button" variant="info" size="sm" onClick={() => handleEdit(account)} leftIcon={<EditIcon />}>
                  Editar
                </Button>
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
