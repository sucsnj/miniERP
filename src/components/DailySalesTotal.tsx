import { ReactNode } from 'react';
import { VendaDiaria } from '../services/vendasService';
import { formatCurrency } from '../utils/formatter';
import { formatDateString } from '../utils/date';
import { canEdit } from '../utils/edit';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useShortcuts } from '../utils/shortcuts';

interface DailySalesTotalProps {
  sales: VendaDiaria[];
  selectedDay?: string;
  recentSales?: VendaDiaria[];
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
  children?: ReactNode;
}

const DailySalesTotal: React.FC<DailySalesTotalProps> = ({ sales, selectedDay, recentSales = [], onEditSale, onDeleteSale, children }) => {
  
  const total = sales.reduce((sum, sale) => sum + sale.valor, 0);
  const quantidadeVendas = sales.length;
  const ticketMedio = quantidadeVendas > 0 ? total / quantidadeVendas : 0;

  const dailySales = selectedDay ? sales.filter((sale) => sale.data === selectedDay) : [];
  const dailyTotal = dailySales.reduce((sum, sale) => sum + sale.valor, 0);
  const dailyCount = dailySales.length;
  const dailyAverage = dailyCount > 0 ? dailyTotal / dailyCount : 0;

  // Deleta a última venda do histórico de vendas
  useShortcuts(['Delete'], () => {
    if (recentSales.length > 0 && onDeleteSale) {
      const ultimaVenda = [...recentSales]
        .sort((a, b) => b.id - a.id)[0];

      if (ultimaVenda) {
        onDeleteSale(ultimaVenda.id);
      }
    }
  });

  return (
    <div className="daily-sales-total">
      <h2>Resumo do Período</h2>
      <div className="summary-grid">
        <div className="summary-left">
          <div className="summary-row">
            <div className="summary-card totals-card">
              <span className="summary-card-title">Total do Período</span>
              <div className="summary-metrics">
                <div>
                  <span className="summary-label">Total de Vendas</span>
                  <span className="summary-value"> R$ {formatCurrency(total, 2)}</span>
                </div>
                <div>
                  <span className="summary-label">Quantidade de Vendas</span>
                  <span className="summary-value"> {quantidadeVendas}</span>
                </div>
                <div>
                  <span className="summary-label">Ticket Médio</span>
                  <span className="summary-value"> R$ {formatCurrency(ticketMedio, 2)}</span>
                </div>
              </div>
            </div>

            {selectedDay ? (
              <div className="summary-card daily-card">
                <span className="summary-card-title">
                  Resumo do dia {formatDateString(selectedDay, 'DD-MM-YYYY')}
                </span>

                <div className="summary-metrics">
                  <div>
                    <span className="summary-label">Total</span>
                    <span className="summary-value"> R$ {formatCurrency(dailyTotal, 2)}</span>
                  </div>
                  <div>
                    <span className="summary-label">Vendas</span>
                    <span className="summary-value"> {dailyCount}</span>
                  </div>
                  <div>
                    <span className="summary-label">Média do dia</span>
                    <span className="summary-value"> R$ {formatCurrency(dailyAverage, 2)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {recentSales.length > 0 ? (
            <div className="history-card">
              <span className="summary-card-title">Últimas 4 vendas</span>

              <div className="recent-sales-grid">
                {[...recentSales]
                  .sort((a, b) => a.id - b.id)
                  .map((sale) => (
                    <div key={sale.id} className="history-item">
                      <div>
                        <strong>{sale.criado_em.slice(10, 19)}</strong>

                        <div className="recent-sale-observacoes">
                          {sale.observacoes || 'Sem observações'}
                        </div>
                      </div>

                      <div className="history-values">
                        <span>R$ {formatCurrency(sale.valor, 2)}</span>
                      </div>

                      <div className="recent-sale-actions">
                        {canEdit(sale.data) ? (
                          <>
                            {onEditSale && (
                              <button
                                type="button"
                                onClick={() => onEditSale(sale)}
                              >
                                <span className="icon-responsive">
                                  <EditIcon />
                                </span>
                                <span className="text-responsive">Editar</span>
                              </button>
                            )}

                            {onDeleteSale && (
                              <button
                                type="button"
                                onClick={() => onDeleteSale(sale.id)}
                              >
                                <span className="icon-responsive">
                                  <DeleteIcon />
                                </span>
                                <span className="text-responsive">Excluir</span>
                              </button>
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

        {children ? <div className="summary-card form-card">{children}</div> : null}
      </div>
      <style jsx>{`
        .daily-sales-total {
          margin: 28px auto 240px;
          transform: scale(0.9); // altera o tamanho do elemento para que ele se adapte ao tamanho da tela
          transform-origin: top;
          padding: 18px;
          width: calc(105% - 16px);
          max-width: 1440px;
          background: linear-gradient(135deg, #5b6ce0 0%, #6f55b0 100%);
          border-radius: 12px;
          color: white;
        }

        .daily-sales-total h2 {
          margin: 0 0 16px 0;
          font-size: 22px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: minmax(520px, 1.7fr) minmax(360px, 1fr);
          gap: 20px;
          align-items: start;
        }

        .summary-left {
          display: grid;
          gap: 14px;
        }

        .summary-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .summary-card,
        .history-card {
          background: rgba(255, 255, 255, 0.14);
          padding: 16px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          transition: transform 0.25s ease, background 0.25s ease;
        }

        .history-card {
          padding-top: 14px;
        }

        .history-card .summary-card-title {
          margin-bottom: 8px;
        }

        .history-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .recent-sales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 6px;
        }

        .history-item {
          display: flex;
          transform: scale(0.95);
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .history-values {
          font-size: 1rem;
          font-weight: 700;
        }

        .recent-sale-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .recent-sale-actions button {
          flex: 1;
          padding: 8px 10px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .recent-sale-actions button:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }

        .recent-sale-actions button:first-child {
          background: #2563eb;
          color: white;
        }

        .recent-sale-actions button:last-child {
          background: #ef4444;
          color: white;
        }

        .history-item strong {
          display: block;
          margin-bottom: 6px;
        }

        .history-item:hover {
          transform: translateY(-5px);
          transform: scale(1.2);
          background: var(--glass-surface);
          border: 1px solid var(--border);
        }

        .summary-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.25);
        }

        .summary-card-title {
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .summary-metrics {
          display: grid;
          gap: 14px;
        }

        .summary-label {
          font-size: 0.9rem;
          font-weight: 500;
          opacity: 0.9;
        }

        .summary-value {
          font-size: 1.75rem;
          font-weight: 700;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          /* Em modo responsivo, o bloco 'Últimas 4 vendas' fica logo abaixo do formulário de registro */
          .summary-left {
            display: contents;
          }

          .form-card {
            order: -2;
          }

          .history-card {
            order: -1;
          }

          .summary-row {
            order: 0;
            grid-template-columns: 1fr;
          }

          /* Em modo responsivo, inverte a ordem das 'Últimas 4 vendas' (mais recente primeiro) */
          .recent-sales-grid {
            display: flex;
            flex-direction: column-reverse;
          }

          .summary-value {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DailySalesTotal;
