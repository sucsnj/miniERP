import { useState } from 'react';
import SalesTable from '../components/sales/SalesTable';
import SalesChart from '../components/sales/SalesChart';
import ExportButtons from '../components/sales/ExportButtons';
import EditSaleForm from '../components/sales/EditSaleForm';
import { getDateArray, parseDate } from '../utils/date';
import { useToast } from '../hooks/useToast';
import { useSales } from '../hooks/useSales';
import { useFilter } from '../hooks/useFilter';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import Panel from '@/components/common/Panel';
import Button from '@/components/common/Button';

// Componente React: tela de Histórico de Vendas.
// Lista as vendas do período com filtro (todas/positivas/negativas), permitindo
// editar e excluir. Usa os hooks useToast, useSales e useFilter.
const History: React.FC = () => {
  const createTodayDate = () => {
    const [todayDay, todayMonth, todayYear] = getDateArray();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${todayYear}-${pad(todayMonth)}-${pad(todayDay)}`;
  };

  const [selectedDate, setSelectedDate] = useState(createTodayDate);
  const parsedDate = parseDate(selectedDate);
  const month = parsedDate.month() + 1;
  const year = parsedDate.year();

  // Notificações (toast) exibidas na tela
  const { showToast } = useToast();
  const { user } = useAuth();
  // Filtro de vendas (persistido no localStorage)
  const { filter, changeFilter } = useFilter();
  // Estado e ações de vendas (carregar, editar, excluir). Aqui o autoConsolidate
  // fica desligado e o filtro é dinâmico, diferente do dashboard.
  const {
    sales,
    editingSale,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  } = useSales(month, year, showToast, { filter, autoConsolidate: false });

  const changeSelectedDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    const parsed = parseDate(value);
    if (!parsed.isValid() || parsed.format('YYYY-MM-DD') !== value) return;
    setSelectedDate(value);
  };

  return (
    <>
      <PageShell>
        <PageHeader title="Histórico de Vendas" description={user ? `Loja: ${user.storeName}` : undefined} />
        {/* Filtro de período e botões de amount */}
        <Panel>
          <div className="page-actions">
            <label>
              Data:
              <input
                className="headerInput"
                type="date"
                value={selectedDate}
                onChange={(e) => changeSelectedDate(e.target.value)}
              />
            </label>
            {/* Botões de filtro por amount da venda */}
            <div className="buttons-filter">
              <Button variant={filter === 'todas' ? 'primary' : 'ghost'} size="sm" aria-pressed={filter === 'todas'} onClick={() => changeFilter('todas')}>
                Todas
              </Button>
              <Button variant={filter === 'positivas' ? 'success' : 'ghost'} size="sm" aria-pressed={filter === 'positivas'} onClick={() => changeFilter('positivas')}>
                Positivas
              </Button>
              <Button variant={filter === 'negativas' ? 'danger' : 'ghost'} size="sm" aria-pressed={filter === 'negativas'} onClick={() => changeFilter('negativas')}>
                Negativas
              </Button>

            </div>
          </div>
        </Panel>

        {/* Formulário de edição (visível apenas quando há uma venda em edição) */}
        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSaved={handleSaved}
            onCancel={handleCancelEdit}
            onToast={showToast}
          />
        )}

        <SalesChart date={sales} />

        <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} />
        {/* Exportação e importação de vendas */}
        <ExportButtons sales={sales} month={month} year={year} selectedDate={selectedDate} onMessage={showToast} />
      </PageShell>
    </>
  );
};

export default History;
