import React from 'react';
import { useState } from 'react';
import { DailySale } from '../../services/vendasService';
import { formatDateString } from '../../utils/date';
import { formatCurrency } from '../../utils/formatter';
import styles from '../../styles/contas.module.css';
import { canEdit } from '../../utils/edit';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/common/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import { toTimestamp } from '../../utils/date';

interface SalesTableProps {
  sales: DailySale[];
  onEditSale?: (sale: DailySale) => void;
  onDeleteSale?: (id: number) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, onEditSale, onDeleteSale }) => {
  const totalSales = sales.reduce((total, sale) => total + sale.valor, 0);

  const [maxSales, setMaxSales] = React.useState(() => {
    if (typeof window === 'undefined') return 5;
    const saved = localStorage.getItem("maxSales");
    const parsed = saved ? parseInt(saved) : NaN;
    return Number.isNaN(parsed) ? 5 : parsed;
  });

  // estado para o diálogo
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const changeMaxSales = (value: number) => {
    setMaxSales(value);
    localStorage.setItem("maxSales", String(value));
  };

  const openConfirm = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  return (
    <div className="table-container">
      <h2>Vendas Diárias
        - <span>Total R$ {formatCurrency(totalSales, 2)}</span>
      </h2>
      <div className="range-buttons">
        <Button
          variant="ghost"
          size="sm"
          className={maxSales === 100 ? 'color-muted' : 'button-100'}
          aria-pressed={maxSales === 100}
          onClick={() => changeMaxSales(100)}
        >
          100 últimas
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={maxSales === 50 ? 'color-muted' : 'button-50'}
          aria-pressed={maxSales === 50}
          onClick={() => changeMaxSales(50)}
        >
          50 últimas
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={maxSales === 25 ? 'color-muted' : 'button-25'}
          aria-pressed={maxSales === 25}
          onClick={() => changeMaxSales(25)}
        >
          25 últimas
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={maxSales === sales.length ? 'color-muted' : 'button-todas'}
          aria-pressed={maxSales === sales.length}
          onClick={() => changeMaxSales(sales.length)}
        >
          Todas
        </Button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Criado em</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {[...sales]
            .sort((a, b) => {
              const diffDate =
                toTimestamp(b.data) - toTimestamp(a.data);

              if (diffDate !== 0) return diffDate;

              return b.id - a.id;
            })
            .slice(0, maxSales)
            .map((sale) => (
              <tr key={sale.id}>
                <td>{formatDateString(sale.criado_em, 'DD-MM-YYYY HH:mm:ss')}</td>
                <td>{sale.data}</td>
                <td>R$ {formatCurrency(sale.valor, 2)}</td>
                <td>
                  <Tooltip
                    title={sale.observacoes || 'Sem observações'}
                    enterTouchDelay={0}
                    leaveTouchDelay={5000}
                    classes={{ tooltip: styles.customTooltip }}
                  >
                    <span className={styles.hoverEllipsis}>
                      {sale.observacoes || 'Sem observações'}
                    </span>
                  </Tooltip>
                </td>
                <td>
                  {canEdit(sale.data) ? (
                    <>
                      {onEditSale ? (
                        <Button type="button" variant="info" size="sm" onClick={() => onEditSale(sale)} leftIcon={<EditIcon />}>
                          Editar
                        </Button>
                      ) : null}
                      {onDeleteSale ? (
                        <Button type="button" variant="danger" size="sm" onClick={() => openConfirm(sale.id)} leftIcon={<DeleteIcon />}>
                          Excluir
                        </Button>
                      ) : null}
                    </>
                  ) : (
                    <span className="color-muted">Bloqueado</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta venda?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => {
          if (selectedId !== null) {
            onDeleteSale?.(selectedId);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default SalesTable;
