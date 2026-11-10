import { ReactNode } from 'react';
import { DailySale } from '../../services/vendasService';
import { formatCurrency } from '../../utils/formatter';
import { formatDateString } from '../../utils/date';
import { canEdit } from '../../utils/edit';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useShortcuts } from '../../utils/shortcuts';
import Button from '@/components/common/Button';
import styles from '../../styles/dailySalesTotal.module.css';

interface DailySalesTotalProps {
  sales: DailySale[];
  selectedDay?: string;
  recentSales?: DailySale[];
  onEditSale?: (sale: DailySale) => void;
  onDeleteSale?: (id: number) => void;
  children?: ReactNode;
}

const DailySalesTotal: React.FC<DailySalesTotalProps> = ({ sales, selectedDay, recentSales = [], onEditSale, onDeleteSale, children }) => {
  
  const total = sales.reduce((sum, sale) => sum + sale.valor, 0);
  const salesCount = sales.length;
  const averageTicket = salesCount > 0 ? total / salesCount : 0;

  const dailySales = selectedDay ? sales.filter((sale) => sale.data === selectedDay) : [];
  const dailyTotal = dailySales.reduce((sum, sale) => sum + sale.valor, 0);
  const dailyCount = dailySales.length;
  const dailyAverage = dailyCount > 0 ? dailyTotal / dailyCount : 0;

  // Deleta a última venda do histórico de vendas
  useShortcuts(['Delete'], () => {
    if (recentSales.length > 0 && onDeleteSale) {
      const latestSale = [...recentSales]
        .sort((a, b) => b.id - a.id)[0];

      if (latestSale) {
        onDeleteSale(latestSale.id);
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
              <span className={`${styles.summaryCardTitle}`}>Últimas 4 vendas</span>

              <div className={`${styles.recentSalesGrid}`}>
                {[...recentSales]
                  .sort((a, b) => a.id - b.id)
                  .map((sale) => (
                    <div key={sale.id} className={`${styles.historyItem}`}>
                      <div>
                        <strong>{sale.criado_em.slice(10, 19)}</strong>

                        <div className="recent-sale-observacoes">
                          {sale.observacoes || 'Sem observações'}
                        </div>
                      </div>

                      <div className={`${styles.historyValues}`}>
                        <span>R$ {formatCurrency(sale.valor, 2)}</span>
                      </div>

                      <div className={`${styles.recentSaleActions}`}>
                        {canEdit(sale.data) ? (
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

                            {onDeleteSale && (
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => onDeleteSale(sale.id)}
                                leftIcon={<DeleteIcon />}
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