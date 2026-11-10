import { useEffect, useState } from 'react';
import DailySaleForm from '../components/sales/DailySaleForm';
import DailySalesTotal from '../components/sales/DailySalesTotal';
import SalesChart from '../components/sales/SalesChart';
import ExportButtons from '../components/sales/ExportButtons';
import EditSaleForm from '../components/sales/EditSaleForm';
import { useToast } from '../hooks/useToast';
import { useSales } from '../hooks/useSales';
import { capitalize } from '../utils/captalize';
import BackupIcon from '@mui/icons-material/Backup';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getDateArray, now, toTimestamp, formatMonthName } from '../utils/date';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Button from '@/components/common/Button';


// Data de today (fuso do app) usada como seleção inicial do formulário
const today = now().format('YYYY-MM-DD');

// Componente React da página inicial: Dashboard de Vendas.
// Orquestra os subcomponentes da tela usando os hooks useToast e useSales,
// mantendo apenas o estado de filtro (mês/ano) e da data selecionada.
const Home: React.FC = () => {
  // Período de today (mês/ano no fuso do app), calculado uma única vez
  const [, currentMonth, currentYear] = getDateArray();
  // Período selecionado (mês e ano), usado para carregar as vendas
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  // Ano exibido no campo; aceita digitação livre e só comita valores válidos
  const [yearInput, setYearInput] = useState(String(currentYear));
  // Data selecionada no formulário de venda diária
  const [selectedDate, setSelectedDate] = useState(today);

  // Notificações (toast) exibidas na página
  const { showToast } = useToast();
  // Estado e ações de vendas (carregar, editar, excluir, consolidar, backup)
  const {
    sales,
    loading,
    editingSale,
    loadSales,
    handleConsolidate,
    handleBackup,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  } = useSales(month, year, showToast);

  // Recarrega as vendas sempre que o período (month/year) mudar
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Últimas 4 vendas (por data e id, da mais recente para a mais antiga)
  const recentSales = [...sales]
    .sort((a, b) => {
      const dateA = toTimestamp(`${a.data}T00:00:00`);
      const dateB = toTimestamp(`${b.data}T00:00:00`);
      if (dateA !== dateB) return dateB - dateA;
      return b.id - a.id;
    })
    .slice(0, 4);

  return (
    <>
      <PageShell>
        <PageHeader title="Dashboard de Vendas" description={loading ? 'Carregando vendas...' : undefined} />
        {loading && <p className="loading-text">Carregando vendas...</p>}
        {/* Resumo do período + formulário de registro de venda */}
        <DailySalesTotal
          sales={sales}
          selectedDay={selectedDate}
          recentSales={recentSales}
          onEditSale={handleEditSale}
          onDeleteSale={handleDeleteSale}
        >
          <DailySaleForm
            sales={sales}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSaleAdded={loadSales}
            onEditSale={handleEditSale}
            onDeleteSale={handleDeleteSale}
            showHistory={false}
          />
        </DailySalesTotal>

        {/* Formulário de edição (visível apenas quando há uma venda em edição) */}
        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSaved={handleSaved}
            onCancel={handleCancelEdit}
            onToast={showToast}
          />
        )}
        <SalesChart data={sales} />
        {/* <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} /> */}
        <ExportButtons
          sales={sales}
          month={month}
          year={year}
          selectedDate={selectedDate}
          onMessage={showToast}
          onImportCompleted={loadSales}
        />
        {/* Rodapé com filtro de período e ações de consolidação/backup */}
        <Panel>
          <PanelHeader title="Período e ações" />
          <div className="page-actions">
            <label>
              Mês:
              <select className="headerSelect" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {capitalize(formatMonthName(i + 1))}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ano:
              <input
                className="headerInput"
                type="number"
                value={yearInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setYearInput(v);
                  const parsed = parseInt(v, 10);
                  if (!Number.isNaN(parsed)) setYear(parsed);
                }}
                onBlur={() => {
                  const parsed = parseInt(yearInput, 10);
                  if (Number.isNaN(parsed)) setYearInput(String(year));
                }}
              />
            </label>
            <Button variant="primary" onClick={handleConsolidate} leftIcon={<DoneAllIcon />}>
              Consolidar Més
            </Button>
            <Button variant="info" onClick={handleBackup} leftIcon={<BackupIcon />}>
              Fazer Backup
            </Button>
          </div>
        </Panel>
      </PageShell>
    </>
  );
};

export default Home;
