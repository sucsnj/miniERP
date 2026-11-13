import { useState } from 'react';
import SalesTable from '../components/sales/SalesTable';
import SalesChart from '../components/sales/SalesChart';
import ExportButtons from '../components/sales/ExportButtons';
import EditSaleForm from '../components/sales/EditSaleForm';
import { capitalize } from '../utils/captalize';
import { getDateArray, getLastDayOfMonth, formatMonthName } from '../utils/date';
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
  // Período selecionado (mês e year), usado para carregar as vendas
  const [month, setMonth] = useState(getDateArray()[1]);
  const [year, setYear] = useState(getDateArray()[2]);
  const [day, setDay] = useState(getDateArray()[0]);

  const daysInMonth = getLastDayOfMonth(year, month);
  const dayClamped = Math.min(day, daysInMonth);
  const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(dayClamped).padStart(2, '0')}`;

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

  const changeMonth = (value: string) => {
    const nextMonth = Number(value);
    if (!Number.isFinite(nextMonth)) return;
    setMonth(nextMonth);
    const nextLastDay = getLastDayOfMonth(year, nextMonth);
    if (day > nextLastDay) setDay(nextLastDay);
  };

  const changeYear = (value: string) => {
    const nextYear = value ? Number(value) : new Date().getFullYear();
    if (!Number.isFinite(nextYear)) return;
    setYear(nextYear);
    const nextLastDay = getLastDayOfMonth(nextYear, month);
    if (day > nextLastDay) setDay(nextLastDay);
  };

  const changeDay = (value: string) => {
    const nextDay = Number(value);
    if (!Number.isFinite(nextDay)) return;
    setDay(Math.min(Math.max(1, nextDay), daysInMonth));
  };

  return (
    <>
      <PageShell>
        <PageHeader title="Histórico de Vendas" description={user ? `Loja: ${user.storeName}` : undefined} />
        {/* Filtro de período e botões de amount */}
        <Panel>
          <div className="page-actions">
            <label>
              Mês:
              <select className="headerSelect" value={month} onChange={(e) => changeMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {capitalize(formatMonthName(i + 1))}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dia:
              <input
                className="headerInput"
                type="number"
                min={1}
                max={daysInMonth}
                value={dayClamped}
                onChange={(e) => changeDay(e.target.value)}
              />
            </label>
            <label>
              Ano:
              <input
                className="headerInput"
                type="number"
                value={year}
                onChange={(e) => changeYear(e.target.value)}
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
