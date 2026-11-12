import { useEffect, useState } from 'react';
import DailySaleForm from '../components/sales/DailySaleForm';
import DailySalesTotal from '../components/sales/DailySalesTotal';
import EditSaleForm from '../components/sales/EditSaleForm';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../contexts/SettingsContext';
import { useSales } from '../hooks/useSales';
import { getDateArray, now, toTimestamp } from '../utils/date';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import { SkeletonCards, SkeletonText } from '@/components/common/Skeleton';


// Data de today (fuso do app) usada como seleção inicial do formulário
const today = now().format('YYYY-MM-DD');

// Componente React da página inicial: Dashboard de Vendas.
// Orquestra os subcomponentes da tela usando os hooks useToast e useSales,
// mantendo apenas o estado de filtro (mês/year) e da date selecionada.
const Home: React.FC = () => {
  // Período de today (mês/year no fuso do app), calculado uma única vez
  const [, currentMonth, currentYear] = getDateArray();
  // Período atual (mês e ano) usado para carregar as vendas
  const month = currentMonth;
  const year = currentYear;
  // Data selecionada no formulário de venda diária
  const [selectedDate, setSelectedDate] = useState(today);

  // Notificações (toast) exibidas na página
  const { showToast } = useToast();
  const { recentSalesCount } = useSettings();
  // Estado e ações de vendas (carregar, editar, excluir, consolidar, backup)
  const {
    sales,
    loading,
    editingSale,
    loadSales,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  } = useSales(month, year, showToast);

  // Recarrega as vendas sempre que o período (month/year) mudar
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Últimas vendas recentes conforme configuração (0 a 8, em pares)
  const recentSales = [...sales]
    .sort((a, b) => {
      const dateA = toTimestamp(`${a.date}T00:00:00`);
      const dateB = toTimestamp(`${b.date}T00:00:00`);
      if (dateA !== dateB) return dateB - dateA;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    })
    .slice(0, recentSalesCount);

  return (
    <>
      <PageShell>
        <PageHeader title="Dashboard de Vendas" description={loading ? 'Carregando...' : undefined} />
        {loading && (
          <>
            <SkeletonCards cards={3} minHeight="110px" />
            <SkeletonText lines={5} />
          </>
        )}
        {/* Resumo do período + formulário de registro de venda */}
        <DailySalesTotal
          sales={sales}
          selectedDay={selectedDate}
          recentSales={recentSales}
          recentSalesCount={recentSalesCount}
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
        {/* <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} /> */}
      </PageShell>
    </>
  );
};

export default Home;
