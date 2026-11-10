import { useCallback, useState } from 'react';
import {
  fetchDailySales,
  consolidateMonthly,
  backupDatabase,
  deleteSale,
  DailySale,
  autoConsolidate
} from '../services/vendasService';
import { canEdit } from '../utils/edit';

// Função que exibe mensagens (injetada pelo hook useToast)
type ToastFn = (message: string, type: 'success' | 'error' | 'info') => void;

// Opções de configuração do hook
export interface UseSalesOptions {
  // Filtro das vendas a carregar ('positivas' é o usado no dashboard)
  filter?: 'todas' | 'positivas' | 'negativas';
  // Se deve disparar autoConsolidate após carregar (desligado no histórico)
  autoConsolidate?: boolean;
}

// Hook que concentra o estado de vendas e todas as ações de vendas:
// carregar, consolidar, fazer backup, editar, salvar e excluir.
export const useSales = (month: number, year: number, showToast: ToastFn, options: UseSalesOptions = {}) => {
  // Lista de vendas diárias do período selecionado
  const [sales, setSales] = useState<DailySale[]>([]);
  // Venda atualmente em edição (null = nenhuma)
  const [editingSale, setEditingSale] = useState<DailySale | null>(null);
  // Indica se há uma carga de dados em andamento
  const [loading, setLoading] = useState(true);

  // Aplica os padrões quando a opção não é informada
  const { filter = 'positivas', autoConsolidate: autoConsolidateEnabled = true } = options;

  // Busca as vendas do mês/ano conforme o filtro e, opcionalmente, dispara a consolidação automática.
  // useCallback mantém a referência estável enquanto mes/ano/filter não mudarem.
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDailySales(month, year, filter);
      setSales(data);

      if (autoConsolidateEnabled) {
        await autoConsolidate();
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, filter, autoConsolidateEnabled]);

  // Consolida o mês selecionado e informa o resultado
  const handleConsolidate = async () => {
    try {
      await consolidateMonthly(month, year);
      showToast('O mês foi consolidado com sucesso.', 'success');
    } catch {
      showToast('Não foi possível consolidar o mês.', 'error');
    }
  };

  // Executa o backup das vendas e mostra a mensagem retornada pelo serviço
  const handleBackup = async () => {
    try {
      const result = await backupDatabase();
      showToast(result.message, 'success');
    } catch {
      showToast('Não foi possível fazer o backup.', 'error');
    }
  };

  // Abre o formulário de edição com a venda selecionada
  const handleEditSale = (sale: DailySale) => {
    setEditingSale(sale);
  };

  // Cancela a edição fechando o formulário
  const handleCancelEdit = () => {
    setEditingSale(null);
  };

  // Após salvar, fecha o formulário e recarrega a lista de vendas
  const handleSaved = () => {
    setEditingSale(null);
    loadSales();
  };

  // Exclui uma venda, respeitando a regra de edição/exclusão
  const handleDeleteSale = async (id: number) => {
    const sale = sales.find((sale) => sale.id === id);
    // Venda inexistente: avisa e interrompe sem chamar canEdit com data vazia
    if (!sale) {
      showToast('Venda não encontrada.', 'error');
      return;
    }
    // Verifica se a venda ainda pode ser editada/excluída (janela de 2 dias)
    const edit = canEdit(sale.data);
    try {
      // mostra outro toast quando a venda tiver mais de 2 dias
      if (edit) {
        await deleteSale(id);
        showToast('Venda excluída com sucesso.', 'success');
        loadSales();
      } else {
        showToast('Não é possível editar ou excluir.', 'info');
      }
    } catch {
      showToast('Erro ao excluir venda.', 'error');
    }
  };

  return {
    sales,
    editingSale,
    loading,
    loadSales,
    handleConsolidate,
    handleBackup,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  };
};