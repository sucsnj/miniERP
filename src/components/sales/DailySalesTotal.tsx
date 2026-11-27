import { useAuth } from '../../contexts/AuthContext';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { DailySale } from '../../services/salesService';
import { formatCurrency } from '../../utils/formatter';
import { formatDateString, parseDate } from '../../utils/date';
import { canEdit } from '../../utils/edit';
import EditIcon from '@mui/icons-material/Edit';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { useShortcuts } from '../../utils/shortcuts';
import Button from '@/components/common/Button';
import styles from '../../styles/dailySalesTotal.module.css';

type SaleTypeFilter = '' | 'credito' | 'debito' | 'cartao' | 'pix' | 'outros' | 'todos';

const SALE_TYPE_ORDER: SaleTypeFilter[] = ['', 'credito', 'debito', 'cartao', 'pix', 'outros', 'todos'];

const SALE_TYPE_LABELS: Record<SaleTypeFilter, string> = {
  '': 'Dinheiro',
  credito: 'Crédito',
  debito: 'Débito',
  cartao: 'Cartão',
  pix: 'PIX',
  outros: 'Outros',
  todos: 'Todos',
};

const normalizeSaleType = (value?: string | null) => (value ?? '').trim().toLowerCase();

const matchesType = (sale: DailySale, type: SaleTypeFilter) => {
  const normalized = normalizeSaleType(sale.saleType);
  switch (type) {
    case '':
      return normalized === '';
    case 'cartao':
      return normalized === 'credito' || normalized === 'debito';
    case 'todos':
      return true;
    default:
      return normalized === type;
  }
};

const renderTotalTypeIcon = (type: SaleTypeFilter) => {
  switch (type) {
    case 'credito':
      return <CreditCardIcon fontSize="inherit" />;
    case 'debito':
      return (
        <span className={styles.debitIconWrap}>
          <CreditCardIcon fontSize="inherit" />
          <span className={styles.debitIconCurrency}>$</span>
        </span>
      );
    case 'cartao':
      return (
        <span className={styles.debitIconWrap}>
          <CreditCardIcon fontSize="inherit" />
        </span>
      );
    case 'pix':
      return <QrCode2Icon fontSize="inherit" />;
    case 'outros':
      return <CategoryIcon fontSize="inherit" />;
    case 'todos':
      return <AllInclusiveIcon fontSize="inherit" />;
    default:
      return <AttachMoneyIcon fontSize="inherit" />;
  }
};

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
  const [totalType, setTotalType] = useState<SaleTypeFilter>('');
  const filteredSales = sales.filter((sale) => matchesType(sale, totalType));
  const total = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const salesCount = filteredSales.length;
  const averageTicket = salesCount > 0 ? total / salesCount : 0;

  const handleCycleTotalType = () => {
    setTotalType((current) => {
      const index = SALE_TYPE_ORDER.indexOf(current);
      return SALE_TYPE_ORDER[(index + 1) % SALE_TYPE_ORDER.length];
    });
  };

  const dailySales = selectedDay ? sales.filter((sale) => sale.date === selectedDay) : [];
  const filteredDailySales = dailySales.filter((sale) => matchesType(sale, totalType));
  const dailyTotal = filteredDailySales.reduce((sum, sale) => sum + sale.amount, 0);
  const dailyCount = filteredDailySales.length;
  const dailyAverage = dailyCount > 0 ? dailyTotal / dailyCount : 0;
  const [newSaleIds, setNewSaleIds] = useState<string[]>([]);
  const [deletingSales, setDeletingSales] = useState<DailySale[]>([]);
  const [frozenRecentSales, setFrozenRecentSales] = useState<DailySale[] | null>(null);
  const previousSaleIdsRef = useRef<string[] | null>(null);
  const highlightTimeoutIdsRef = useRef(new Set<number>());
  const deleteTimeoutIdsRef = useRef(new Set<number>());

  const getSaleKey = (sale: DailySale) => sale.operationId ?? sale.id;

  useEffect(() => {
    const saleIds = recentSales.map(getSaleKey);
    const previousIds = previousSaleIdsRef.current;

    if (previousIds === null) {
      previousSaleIdsRef.current = saleIds;
      return;
    }

    const addedIds = recentSales
      .filter((sale) => sale.operationId?.startsWith('optimistic-'))
      .map(getSaleKey)
      .filter((id) => !previousIds.includes(id));
    previousSaleIdsRef.current = saleIds;

    if (addedIds.length === 0) return;

    setNewSaleIds((current) => [...new Set([...current, ...addedIds])]);
    const timeoutId = window.setTimeout(() => {
      setNewSaleIds((current) => current.filter((id) => !addedIds.includes(id)));
      highlightTimeoutIdsRef.current.delete(timeoutId);
    }, 4000);
    highlightTimeoutIdsRef.current.add(timeoutId);
  }, [recentSales]);

  useEffect(() => {
    const highlightTimeouts = highlightTimeoutIdsRef.current;
    const deleteTimeouts = deleteTimeoutIdsRef.current;

    return () => {
      highlightTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      deleteTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      highlightTimeouts.clear();
      deleteTimeouts.clear();
    };
  }, []);

  const requestDeleteSale = (id: string) => {
    const sale = recentSales.find((item) => item.id === id);
    if (!sale) return;

    const deletingSale = { ...sale };
    if (deletingSales.length === 0) setFrozenRecentSales(recentSales);
    setDeletingSales((current) => current.some((item) => getSaleKey(item) === getSaleKey(deletingSale))
      ? current
      : [...current, deletingSale]);
    onDeleteSale?.(id);

    const timeoutId = window.setTimeout(() => {
      setDeletingSales((current) => {
        const remaining = current.filter((item) => getSaleKey(item) !== getSaleKey(deletingSale));
        if (remaining.length === 0) setFrozenRecentSales(null);
        return remaining;
      });
      deleteTimeoutIdsRef.current.delete(timeoutId);
    }, 2000);

    deleteTimeoutIdsRef.current.add(timeoutId);
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

  const deletingKeys = new Set(deletingSales.map(getSaleKey));
  const deletingSalesByKey = new Map(deletingSales.map((sale) => [getSaleKey(sale), sale]));
  const baseRecentSales = frozenRecentSales ?? recentSales;
  const visibleRecentSales = baseRecentSales.map((sale) => deletingSalesByKey.get(getSaleKey(sale)) ?? sale);

  return (
    <div className={`${styles.dailySalesTotal}`}>
      <h2>Resumo do Período</h2>
      <div className={`${styles.summaryGrid}`}>
        <div className={`${styles.summaryLeft}`}>
          <div className={`${styles.summaryRow}`}>
            <button
              type="button"
              className={`${styles.summaryCard} ${styles.totalTypeCard} totals-card`}
              onClick={handleCycleTotalType}
              title="Clique para alternar o tipo de venda"
              aria-label={`Total do Período — ${SALE_TYPE_LABELS[totalType]}. Clique para alternar o tipo de venda.`}
            >
              <div className={`${styles.summaryCardHeader}`}>
                <span className={`${styles.summaryCardTitle}`}>Total do Período</span>
                <span className={`${styles.totalTypeBadge}`}>
                  {renderTotalTypeIcon(totalType)}
                  <span>{SALE_TYPE_LABELS[totalType]}</span>
                </span>
              </div>
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
            </button>

            {selectedDay ? (
              <button
                type="button"
                className={`${styles.summaryCard} ${styles.totalTypeCard} daily-card`}
                onClick={handleCycleTotalType}
                title="Clique para alternar o tipo de venda"
                aria-label={`Resumo do dia ${formatDateString(selectedDay, 'DD-MM-YYYY')} — ${SALE_TYPE_LABELS[totalType]}. Clique para alternar o tipo de venda.`}
              >
                <div className={`${styles.summaryCardHeader}`}>
                  <span className={`${styles.summaryCardTitle}`}>
                    Resumo do dia {formatDateString(selectedDay, 'DD-MM-YYYY')}
                  </span>
                  <span className={`${styles.totalTypeBadge}`}>
                    {renderTotalTypeIcon(totalType)}
                    <span>{SALE_TYPE_LABELS[totalType]}</span>
                  </span>
                </div>

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
              </button>
            ) : null}
          </div>

          {visibleRecentSales.length > 0 ? (
            <div className={`${styles.historyCard}`}>
              <span className={`${styles.summaryCardTitle}`}>Últimas {recentSalesCount} vendas</span>

              <div className={`${styles.recentSalesGrid}`}>
                {[...visibleRecentSales]
                  .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
                  .map((sale) => {
                    const saleKey = getSaleKey(sale);
                    const isNew = newSaleIds.includes(saleKey);
                    const isDeleting = deletingKeys.has(saleKey);

                    return (
                    <div
                      key={saleKey}
                      className={`${styles.historyItem}${isNew ? ` ${styles.historyItemNew}` : ''}${isDeleting ? ` ${styles.historyItemDeleting}` : ''}`}
                    >
                      <div>
                        <div className={styles.recentSaleHeader}>
                          <strong>{parseDate(sale.createdAt).format('HH:mm:ss')}</strong>
                          {sale.saleType ? <span className={styles.recentSaleType}>{sale.saleType}</span> : null}
                        </div>

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
                                disabled={isDeleting}
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
                                disabled={isDeleting}
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
                    );
                  })}
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