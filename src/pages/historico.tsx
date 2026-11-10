import { useEffect, useState } from 'react';
import SalesTable from '../components/SalesTable';
import Toast from '../components/Toast';
import ExportButtons from '../components/ExportButtons';
import EditSaleForm from '../components/EditSaleForm';
import { capitalize } from '../utils/captalize';
import { getDateArray, formatMonthName } from '../utils/date';
import { useToast } from '../hooks/useToast';
import { useVendas } from '../hooks/useVendas';
import { useFiltro } from '../hooks/useFiltro';

// Componente React: tela de Histórico de Vendas.
// Lista as vendas do período com filtro (todas/positivas/negativas), permitindo
// editar e excluir. Usa os hooks useToast, useVendas e useFiltro.
const Historico: React.FC = () => {
  // Período selecionado (mês e ano), usado para carregar as vendas
  const [mes, setMes] = useState(getDateArray()[1]);
  const [ano, setAno] = useState(getDateArray()[2]);

  // Notificações (toast) exibidas na tela
  const { toastOpen, toastMessage, toastType, toastDuration, showToast, closeToast } = useToast();
  // Filtro de vendas (persistido no localStorage)
  const { filtro, changeFiltro } = useFiltro();
  // Estado e ações de vendas (carregar, editar, excluir). Aqui o autoConsolidar
  // fica desligado e o filtro é dinâmico, diferente do dashboard.
  const {
    sales,
    editingSale,
    loadSales,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  } = useVendas(mes, ano, showToast, { filtro, autoConsolidar: false });

  // Recarrega as vendas sempre que o período ou o filtro mudar
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return (
    <>
      <div className="container-padding">
        <h1>Histórico de Vendas</h1>
        {/* Filtro de período e botões de valor */}
        <div className="glass-form">
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
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value))}
              />
            </label>
            {/* Botões de filtro por valor da venda */}
            <div className="buttons-filter">
              <button className={filtro === 'todas' ? 'color-muted' : 'button-todas'} onClick={() => changeFiltro('todas')}>
                Todas
              </button>
              <button className={filtro === 'positivas' ? 'color-muted' : 'button-positivas'} onClick={() => changeFiltro('positivas')}>
                Positivas
              </button>
              <button className={filtro === 'negativas' ? 'color-muted' : 'button-negativas'} onClick={() => changeFiltro('negativas')}>
                Negativas
              </button>

            </div>
          </div>
        </div>

        {/* Formulário de edição (visível apenas quando há uma venda em edição) */}
        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSaved={handleSaved}
            onCancel={handleCancelEdit}
            onToast={showToast}
          />
        )}

        {/* Tabela com as vendas do período */}
        <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} />
        {/* Exportação e importação de vendas */}
        <ExportButtons sales={sales} mes={mes} ano={ano} onMessage={showToast} />
        {/* Notificação (toast) da página */}
        <Toast open={toastOpen} message={toastMessage} type={toastType} duration={toastDuration} onClose={closeToast} position="top-right" />
      </div>
    </>
  );
};

export default Historico;