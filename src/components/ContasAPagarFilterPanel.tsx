import React from 'react';
import { useState } from 'react';
import { ContaDetalhe } from '../services/contasService';
import { formatDateString } from '../utils/date';
import { formatCurrency } from '../utils/formatter';
import styles from '../styles/contas.module.css';
import ConfirmDialog from '@/components/ConfirmDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ClearAllIcon from '@mui/icons-material/ClearAll';

interface ContasAPagarFilterPanelProps {
  filtroDistribuidora: string;
  setFiltroDistribuidora: (value: string) => void;
  filtroStatus: 'Todos' | 'Pendente' | 'Pago';
  setFiltroStatus: (value: 'Todos' | 'Pendente' | 'Pago') => void;
  filtroVencimentoDe: string;
  setFiltroVencimentoDe: (value: string) => void;
  filtroVencimentoAte: string;
  setFiltroVencimentoAte: (value: string) => void;
  hoje: string;
  filteredContas: ContaDetalhe[];
  handleView: (conta: ContaDetalhe) => void;
  handleDelete: (id: number) => void;
  handleEditar: (conta: ContaDetalhe) => void;
  handleStartPayment: (conta: ContaDetalhe) => void;
  onClearFilters: () => void;
}

const ContasAPagarFilterPanel: React.FC<ContasAPagarFilterPanelProps> = ({
  filtroDistribuidora,
  setFiltroDistribuidora,
  filtroStatus,
  setFiltroStatus,
  filtroVencimentoDe,
  setFiltroVencimentoDe,
  filtroVencimentoAte,
  setFiltroVencimentoAte,
  filteredContas,
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
                value={filtroDistribuidora}
                onChange={(e) => setFiltroDistribuidora(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Vencimento de
              <input
                type="date"
                value={filtroVencimentoDe}
                onChange={(e) => setFiltroVencimentoDe(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              até
              <input
                type="date"
                value={filtroVencimentoAte}
                onChange={(e) => setFiltroVencimentoAte(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Status
              <select className={styles.statusSelect} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as 'Todos' | 'Pendente' | 'Pago')}>
                <option value="Todos">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </label>
          </div>
          <div className={styles.filterActions}>
            <button type="button" onClick={onClearFilters}>
              <ClearAllIcon className="material-icon"/>
              Limpar filtros
            </button>
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
            {filteredContas.map((conta) => (
              <tr key={conta.id}>
                <td>{conta.distribuidora}</td>
                <td>R$ {formatCurrency(conta.valor, 2)}</td>
                <td>{formatDateString(conta.vencimento, 'DD/MM/YYYY')}</td>
                <td>{conta.documento}</td>
                <td>
                  <span className={`${styles.status} ${styles[conta.status.toLowerCase()]} status`}
                    data-observacoes={conta.banco_observacoes || 'Sem observações'}>
                    <span className="text-responsive">
                      {conta.status}
                    </span>
                    <span className="icon-responsive">
                      {conta.status === 'Pago' ? (
                        <CheckCircleIcon />
                      ) : conta.status === 'Pendente' ? (
                        <HighlightOffIcon />
                      ) : (
                        <CancelIcon />
                      )}
                    </span>
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button type="button" className={styles.viewButton} onClick={() => handleView(conta)}>
                    <span className="icon-responsive">
                      <VisibilityIcon />
                    </span>
                    <span className="text-responsive">Ver</span>
                  </button>
                  <button type="button" className={styles.deleteButton} onClick={() => openConfirm(conta.id)}>
                    <span className="icon-responsive">
                      <DeleteIcon />
                    </span>
                    <span className="text-responsive">Excluir</span>
                  </button>
                  {conta.status === 'Pendente' ? (
                    <button
                      type="button"
                      className={styles.payButton}
                      onClick={() => handleStartPayment(conta)}
                    >
                      <span className="icon-responsive">
                        <MonetizationOnIcon />
                      </span>
                      <span className="text-responsive">Pagar</span>
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {filteredContas.length === 0 ? (
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

      <style jsx>{`
    .status:hover::after {
      content: attr(data-observacoes);
      position: absolute;
      background: #333;
      color: #fff;
      padding: 6px 10px;
      border-radius: 4px;
      white-space: nowrap;
      transform: translateY(-120%);
    }
    `}</style>
    </div>
  );
};

export default ContasAPagarFilterPanel;

