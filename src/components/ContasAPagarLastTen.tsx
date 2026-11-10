import React from 'react';
import { useState } from 'react';
import { ContaDetalhe } from '../services/contasService';
import { formatDateString } from '../utils/date';
import { formatCurrency } from '../utils/formatter';
import styles from '../styles/contas.module.css';
import ConfirmDialog from '@/components/ConfirmDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface ContasAPagarLastTenProps {
  ultimasContas: ContaDetalhe[];
  handleView: (conta: ContaDetalhe) => void;
  handleDelete: (id: number) => void;
  handleEditar: (conta: ContaDetalhe) => void;
}

const ContasAPagarLastTen: React.FC<ContasAPagarLastTenProps> = ({
  ultimasContas,
  handleView,
  handleDelete,
  handleEditar,
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
          {ultimasContas.map((conta) => (
            <tr key={conta.id}>
              <td>{formatDateString(conta.vencimento, 'DD/MM/YYYY')}</td>
              <td>{conta.distribuidora}</td>
              <td>R$ {formatCurrency(conta.valor, 2)}</td>
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
                <button type="button" className={styles.editButton} onClick={() => handleEditar(conta)}>
                  <span className="icon-responsive">
                    <EditIcon />
                  </span>
                  <span className="text-responsive">Editar</span>
                </button>
              </td>
            </tr>
          ))}
          {ultimasContas.length === 0 ? (
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

export default ContasAPagarLastTen;
