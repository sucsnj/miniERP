import { useEffect, useState } from 'react';
import DailySaleForm from '../components/DailySaleForm';
import DailySalesTotal from '../components/DailySalesTotal';
import SalesChart from '../components/SalesChart';
import Toast from '../components/Toast';
import ExportButtons from '../components/ExportButtons';
import EditSaleForm from '../components/EditSaleForm';
import { useToast } from '../hooks/useToast';
import { useVendas } from '../hooks/useVendas';
import { capitalize } from '../utils/captalize';
import BackupIcon from '@mui/icons-material/Backup';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getDateArray, now, toTimestamp, formatMonthName } from '../utils/date';

// Data de hoje (fuso do app) usada como seleção inicial do formulário
const hoje = now().format('YYYY-MM-DD');

// Componente React da página inicial: Dashboard de Vendas.
// Orquestra os subcomponentes da tela usando os hooks useToast e useVendas,
// mantendo apenas o estado de filtro (mês/ano) e da data selecionada.
const Home: React.FC = () => {
  // Período de hoje (mês/ano no fuso do app), calculado uma única vez
  const [, mesAtual, anoAtual] = getDateArray();
  // Período selecionado (mês e ano), usado para carregar as vendas
  const [mes, setMes] = useState(mesAtual);
  const [ano, setAno] = useState(anoAtual);
  // Ano exibido no campo; aceita digitação livre e só comita valores válidos
  const [anoInput, setAnoInput] = useState(String(anoAtual));
  // Data selecionada no formulário de venda diária
  const [selectedDate, setSelectedDate] = useState(hoje);

  // Notificações (toast) exibidas na página
  const { toastOpen, toastMessage, toastType, toastDuration, showToast, closeToast } = useToast();
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
  } = useVendas(mes, ano, showToast);

  // Recarrega as vendas sempre que o período (mes/ano) mudar
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
      <div className="container-padding">
        <h1>Dashboard de Vendas</h1>
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
          mes={mes}
          ano={ano}
          selectedDate={selectedDate}
          onMessage={showToast}
          onImportCompleted={loadSales}
        />
        {/* Rodapé com filtro de período e ações de consolidação/backup */}
        <div className="footer-header glass-form">
          <div className="page-actions">
            <label>
              Mês:
              <select className="headerSelect" value={mes} onChange={(e) => setMes(parseInt(e.target.value))}>
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
                value={anoInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnoInput(v);
                  const parsed = parseInt(v, 10);
                  if (!Number.isNaN(parsed)) setAno(parsed);
                }}
                onBlur={() => {
                  const parsed = parseInt(anoInput, 10);
                  if (Number.isNaN(parsed)) setAnoInput(String(ano));
                }}
              />
            </label>
            <button className="headerButton" onClick={handleConsolidate}>
              <DoneAllIcon />
              Consolidar Mês
            </button>
            <button className="headerBackupButton" onClick={handleBackup}>
              <BackupIcon />
              Fazer Backup
            </button>
          </div>
        </div>
        <Toast
          open={toastOpen}
          message={toastMessage}
          type={toastType}
          duration={toastDuration}
          onClose={closeToast}
          position="top-right"
        />
      </div>
    </>
  );
};

export default Home;