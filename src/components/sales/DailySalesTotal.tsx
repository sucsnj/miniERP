import { useAuth } from '../../contexts/AuthContext';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { DailySale } from '../../services/salesService';
import { formatCurrency } from '../../utils/formatter';
import { formatDateString, parseDate } from '../../utils/date';
import { canEdit } from '../../utils/edit';
import EditIcon from '@mui/icons-material/Edit';
import { useShortcuts } from '../../utils/shortcuts';
import Button from '@/components/common/Button';
import styles from '../../styles/dailySalesTotal.module.css';

interface DailySalesTotalProps {
  sales: DailySale[];
  selectedDay?: string;
  recentSales?: DailySale[];
  recentSalesCount?: number;
  onEditSale?: (sale: DailySale) => void;
  onDeleteSale?: (id: string) => void;
  children?: ReactNode;
}

const DailySalesTotal: React.FC<DailySalesTotalProps> = ({ sales, selectedDay, recentSales = [], recentSalesCount = 4, onEditSale, onDeleteSale, children }) => {
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const total = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const salesCount = sales.length;
  const averageTicket = salesCount > 0 ? total / salesCount : 0;

  const dailySales = selectedDay ? sales.filter((sale) => sale.date === selectedDay) : [];
  const dailyTotal = dailySales.reduce((sum, sale) => sum + sale.amount, 0);
  const dailyCount = dailySales.length;
  const dailyAverage = dailyCount > 0 ? dailyTotal / dailyCount : 0;
  const [newSaleIds, setNewSaleIds] = useState<string[]>([]);
  const [deletingSaleIds, setDeletingSaleIds] = useState<string[]>([]);
  const previousSaleIdsRef = useRef<string[] | null>(null);
  const highlightTimeoutIdsRef = useRef<number[]>([]);
  const deleteTimeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    const saleIds = recentSales.map((sale) => sale.id);
    const previousIds = previousSaleIdsRef.current;

    if (previousIds === null) {
      previousSaleIdsRef.current = saleIds;
      return;
    }

    const addedIds = saleIds.filter((id) => id.startsWith('optimistic-') && !previousIds.includes(id));
    previousSaleIdsRef.current = saleIds;

    if (addedIds.length === 0) return;

    setNewSaleIds((current) => [...new Set([...current, ...addedIds])]);
    const timeoutId = window.setTimeout(() => {
      setNewSaleIds((current) => current.filter((id) => !addedIds.includes(id)));
    }, 5000);
    highlightTimeoutIdsRef.current.push(timeoutId);
  }, [recentSales]);

  useEffect(() => {
    const highlightTimeouts = highlightTimeoutIdsRef.current;
    const deleteTimeouts = deleteTimeoutIdsRef.current;

    return () => {
      highlightTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      deleteTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const requestDeleteSale = (id: string) => {
    setDeletingSaleIds((current) => current.includes(id) ? current : [...current, id]);

    const timeoutId = window.setTimeout(() => {
      onDeleteSale?.(id);
      setDeletingSaleIds((current) => current.filter((entry) => entry !== id));
      deleteTimeoutIdsRef.current = deleteTimeoutIdsRef.current.filter((entry) => entry !== timeoutId);
    }, 1000);

    deleteTimeoutIdsRef.current.push(timeoutId);
  };

  // Deleta a última venda do histórico de vendas
  useShortcuts(['Delete'], () => {
    if (recentSales.length > 0 && onDeleteSale && isAdmin) {
      const latestSale = [...recentSales]
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];

      if (latestSale) {
        requestDeleteSale(latestSale.id);
      }
    }
  });

  return (
    <div className={`${styles.dailySalesTotal}`}>
      <h2>Resumo do Período</h2>
      <div className={`${styles.summaryGrid}`}>
        <div className={`${styles.summaryLeft}`}>
          <div className={`${styles.summaryRow}`}>
            <div className={`${styles.summaryCard} totals-card`}>
              <span className={`${styles.summaryCardTitle}`}>Total do Período</span>
              <div className={`${styles.summaryMetrics}`}>
                <div>
                  <span className={`${styles.summaryLabel}`}>Total de Vendas</span>
                  <span className={`${styles.summaryValue}`}> R$ {formatCurrency(total, 2)}</span>
                </div>
                <div>
                  <span className={`${styles.summaryLabel}`}>Quantidade de Vendas</span>
                  <span className={`${styles.summaryValue}`}> {salesCount}</span>
                </div>
                <div>
                  <span className={`${styles.summaryLabel}`}>Ticket Médio</span>
                  <span className={`${styles.summaryValue}`}> R$ {formatCurrency(averageTicket, 2)}</span>
                </div>
              </div>
            </div>

            {selectedDay ? (
              <div className={`${styles.summaryCard} daily-card`}>
                <span className={`${styles.summaryCardTitle}`}>
                  Resumo do dia {formatDateString(selectedDay, 'DD-MM-YYYY')}
                </span>

                <div className={`${styles.summaryMetrics}`}>
                  <div>
                    <span className={`${styles.summaryLabel}`}>Total</span>
                    <span className={`${styles.summaryValue}`}> R$ {formatCurrency(dailyTotal, 2)}</span>
                  </div>
                  <div>
                    <span className={`${styles.summaryLabel}`}>Vendas</span>
                    <span className={`${styles.summaryValue}`}> {dailyCount}</span>
                  </div>
                  <div>
                    <span className={`${styles.summaryLabel}`}>Média do dia</span>
                    <span className={`${styles.summaryValue}`}> R$ {formatCurrency(dailyAverage, 2)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {recentSales.length > 0 ? (
            <div className={`${styles.historyCard}`}>
              <span className={`${styles.summaryCardTitle}`}>Últimas {recentSalesCount} vendas</span>

              <div className={`${styles.recentSalesGrid}`}>
                {[...recentSales]
                  .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
                  .map((sale) => (
                    <div
                      key={sale.id}
                      className={`${styles.historyItem}${newSaleIds.includes(sale.id) ? ` ${styles.historyItemNew}` : ''}${deletingSaleIds.includes(sale.id) ? ` ${styles.historyItemDeleting}` : ''}`}
                      aria-hidden={deletingSaleIds.includes(sale.id) ? 'true' : undefined}
                    >
                      <div>
                        <strong>{parseDate(sale.createdAt).format('HH:mm:ss')}</strong>

                        <div className="recent-sale-observacoes">
                          {sale.notes || 'Sem observações'}
                        </div>
                      </div>

                      <div className={`${styles.historyValues}`}>
                        <span>R$ {formatCurrency(sale.amount, 2)}</span>
                      </div>

                      <div className={`${styles.recentSaleActions}`}>
                        {canEdit(sale.date) ? (
                          <>
                            {onEditSale && (
                              <Button
                                type="button"
                                variant="info"
                                size="sm"
                                onClick={() => onEditSale(sale)}
                                leftIcon={<EditIcon />}
                              >
                                Editar
                              </Button>
                            )}

                            {onDeleteSale && isAdmin && (
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => requestDeleteSale(sale.id)}
                              >
                                Excluir
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="color-muted-dark">Bloqueado</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>

        {children ? <div className={`${styles.summaryCard} ${styles.formCard}`}>{children}</div> : null}
      </div>
</div>
  );
};

export default DailySalesTotal;