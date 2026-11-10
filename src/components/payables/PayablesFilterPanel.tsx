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
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ClearAllIcon from '@mui/icons-material/ClearAll';

interface PayablesFilterPanelProps {
  distributorFilter: string;
  setDistributorFilter: (value: string) => void;
  statusFilter: 'Todos' | 'Pendente' | 'Pago';
  setStatusFilter: (value: 'Todos' | 'Pendente' | 'Pago') => void;
  dueDateFromFilter: string;
  setDueDateFromFilter: (value: string) => void;
  dueDateToFilter: string;
  setDueDateToFilter: (value: string) => void;
  today: string;
  filteredAccounts: AccountDetails[];
  handleView: (account: AccountDetails) => void;
  handleDelete: (id: number) => void;
  handleEdit: (account: AccountDetails) => void;
  handleStartPayment: (account: AccountDetails) => void;
  onClearFilters: () => void;
}

const PayablesFilterPanel: React.FC<PayablesFilterPanelProps> = ({
  distributorFilter,
  setDistributorFilter,
  statusFilter,
  setStatusFilter,
  dueDateFromFilter,
  setDueDateFromFilter,
  dueDateToFilter,
  setDueDateToFilter,
  filteredAccounts,
  handleView,
  handleDelete,
  handleStartPayment,
  onClearFilters,
}) => {

  // Estado para o diálogo
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const openConfirm = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  return (
    <div className={styles.contasFilterPanel}>
      <div className={styles.panelHeader}>
        <h2>Detalhe</h2>
        <span className={styles.statusChip}>Filtro</span>
      </div>

      <div className={styles.detailTableWrapper}>
        <div className={styles.filterBar}>
          <div>
            <label>
              Distribuidora
              <input
                type="text"
                placeholder="Filtrar por distribuidora"
                value={distributorFilter}
                onChange={(e) => setDistributorFilter(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Vencimento de
              <input
                type="date"
                value={dueDateFromFilter}
                onChange={(e) => setDueDateFromFilter(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              até
              <input
                type="date"
                value={dueDateToFilter}
                onChange={(e) => setDueDateToFilter(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Status
              <select className={styles.statusSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'Todos' | 'Pendente' | 'Pago')}>
                <option value="Todos">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </label>
          </div>
          <div className={styles.filterActions}>
            <Button type="button" variant="outline" size="sm" onClick={onClearFilters} leftIcon={<ClearAllIcon />}>
              Limpar filtros
            </Button>
          </div>
        </div>

        <h3>Contas do mês</h3>
        <table className={styles.detailTable}>
          <thead>
            <tr>
              <th>Distribuidora</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Documento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.distribuidora}</td>
                <td>R$ {formatCurrency(account.valor, 2)}</td>
                <td>{formatDateString(account.vencimento, 'DD/MM/YYYY')}</td>
                <td>{account.documento}</td>
                <td>
                  <span className={`${styles.status} ${styles[account.status === 'Pago' ? 'pago' : 'pendente']} status`}
                    data-observacoes={account.banco_observacoes || 'Sem observações'}>
                    <span className="text-responsive">
                      {account.status}
                    </span>
                    <span className="icon-responsive">
                      {account.status === 'Pago' ? (
                        <CheckCircleIcon />
                      ) : account.status === 'Pendente' ? (
                        <HighlightOffIcon />
                      ) : (
                        <CancelIcon />
                      )}
                    </span>
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <Button type="button" variant="info" size="sm" onClick={() => handleView(account)} leftIcon={<VisibilityIcon />}>
                    Ver
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => openConfirm(account.id)} leftIcon={<DeleteIcon />}>
                    Excluir
                  </Button>
                  {account.status === 'Pendente' ? (
                    <Button
                      type="button"
                      variant="success"
                      size="sm"
                      onClick={() => handleStartPayment(account)}
                      leftIcon={<MonetizationOnIcon />}
                    >
                      Pagar
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  Nenhuma conta encontrada para o período selecionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

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

export default PayablesFilterPanel;

