import { useCallback, useEffect, useMemo, useState } from 'react';
import { buscarProdutos, buscarServicos, ItemData, ServicoData } from '../services/produtosService';
import type { CartItem } from '../components/DailySaleForm';

// Função de notificação opcional (toast) usada pelo formulário de registro e de edição
type CartToast = (message: string, type?: 'success' | 'error' | 'info') => void;

// Hook que centraliza o estado do carrinho e do catálogo de itens, além do
// controle dos modais de seleção e de gerenciamento do carrinho.
// É usado tanto no formulário de registrar venda diária quanto no de edição,
// espelhando o comportamento entre eles sem duplicar as funções.
export const useCart = (onToast?: CartToast) => {
  // Itens adicionados ao carrinho
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Modal de seleção de itens (adicionar ao carrinho)
  const [selecionarOpen, setSelecionarOpen] = useState(false);
  // Modal de gerenciamento do carrinho
  const [cartModalOpen, setCartModalOpen] = useState(false);
  // Busca do catálogo
  const [cartSearch, setCartSearch] = useState('');
  const [catalogItems, setCatalogItems] = useState<ItemData[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Busca produtos e serviços para o catálogo de seleção
  const buscarItensCatalogo = useCallback(async (query: string) => {
    setLoadingCatalog(true);
    try {
      const [produtosData, servicosData] = await Promise.all([
        buscarProdutos({ search: query || undefined, ativo: 'ATIVO', page: 1, pageSize: 50 }),
        buscarServicos({ search: query || undefined, page: 1, pageSize: 50 }),
      ]);

      const produtos = produtosData?.items || [];
      const servicos: ItemData[] = (servicosData?.items || []).map((servico: ServicoData) => ({
        id: servico.id,
        tipo: 'SERVICO',
        nome: servico.nome,
        descricao: servico.descricao,
        categoria_id: servico.categoria_id,
        unidade_medida_id: 21,
        marca_id: 1,
        fornecedor_id: 1,
        preco_compra: 0,
        margem_lucro: 0,
        preco_venda: servico.preco_venda,
        estoque: 0,
        multiplicador_unidade: 1,
        estoque_total: 0,
        codigo_interno: servico.codigo_interno,
        referencia: servico.referencia || '',
        duracao_minutos: servico.duracao_minutos,
        data_criacao: servico.data_criacao,
        data_atualizacao: servico.data_atualizacao,
        categoria_nome: servico.categoria_nome,
      }));

      const catalogo = [...produtos, ...servicos].sort((a, b) => a.nome.localeCompare(b.nome));
      setCatalogItems(catalogo);
    } catch (error) {
      console.error('Erro ao buscar catálogo para o carrinho:', error);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  // Carrega o catálogo (com debounce) enquanto o modal de seleção estiver aberto
  useEffect(() => {
    if (!selecionarOpen) return;
    const timer = setTimeout(() => buscarItensCatalogo(cartSearch), 250);
    return () => clearTimeout(timer);
  }, [selecionarOpen, cartSearch, buscarItensCatalogo]);

  // Abre o modal de seleção de itens
  const handleCartClick = useCallback(() => {
    setSelecionarOpen(true);
  }, []);

  const closeSelecao = useCallback(() => {
    setSelecionarOpen(false);
  }, []);

  const openCarrinho = useCallback(() => {
    setCartModalOpen(true);
  }, []);

  const closeCarrinho = useCallback(() => {
    setCartModalOpen(false);
  }, []);

  // Fecha a seleção e abre o gerenciamento do carrinho
  const handleManageCart = useCallback(() => {
    setSelecionarOpen(false);
    setCartModalOpen(true);
  }, []);

  // Adiciona +1 do produto/serviço ao carrinho
  const handleAddToCart = useCallback(
    (item: ItemData) => {
      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (ci) => ci.id === item.id && ci.tipo === item.tipo
        );
        if (existingIndex > -1) {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantidade: updated[existingIndex].quantidade + 1,
          };
          return updated;
        } else {
          return [
            ...prevItems,
            {
              id: item.id,
              tipo: item.tipo,
              nome: item.nome,
              preco_venda: item.preco_venda,
              quantidade: 1,
              codigo_interno: item.codigo_interno,
              referencia: item.referencia,
              estoque: item.estoque,
            },
          ];
        }
      });
      onToast?.(`+1 "${item.nome}" adicionado ao carrinho!`, 'success');
    },
    [onToast]
  );

  // Subtrai 1 unidade do item no carrinho
  const handleRemoveFromCart = useCallback(
    (item: ItemData) => {
      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (ci) => ci.id === item.id && ci.tipo === item.tipo
        );
        if (existingIndex === -1) return prevItems;

        if (prevItems[existingIndex].quantidade <= 1) {
          return prevItems.filter((_, idx) => idx !== existingIndex);
        } else {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantidade: updated[existingIndex].quantidade - 1,
          };
          return updated;
        }
      });
      onToast?.(`-1 "${item.nome}" removido do carrinho.`, 'info');
    },
    [onToast]
  );

  // Atualiza quantidade no carrinho
  const handleUpdateQuantity = useCallback(
    (id: number, tipo: 'PRODUTO' | 'SERVICO', newQty: number) => {
      setCartItems((prevItems) => {
        if (newQty <= 0) {
          return prevItems.filter((ci) => !(ci.id === id && ci.tipo === tipo));
        }
        return prevItems.map((ci) => {
          if (ci.id === id && ci.tipo === tipo) {
            return { ...ci, quantidade: newQty };
          }
          return ci;
        });
      });
    },
    []
  );

  // Remove item completo do carrinho
  const handleRemoveItem = useCallback(
    (id: number, tipo: 'PRODUTO' | 'SERVICO') => {
      setCartItems((prevItems) =>
        prevItems.filter((ci) => !(ci.id === id && ci.tipo === tipo))
      );
      onToast?.('Item removido do carrinho.', 'info');
    },
    [onToast]
  );

  // Limpa todos os itens do carrinho
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    onToast?.('Carrinho limpo.', 'info');
  }, [onToast]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.quantidade, 0),
    [cartItems]
  );

  const totalCartValue = useMemo(
    () => cartItems.reduce((acc, curr) => acc + (curr.preco_venda ?? 0) * curr.quantidade, 0),
    [cartItems]
  );

  return {
    cartItems,
    setCartItems,
    cartSearch,
    setCartSearch,
    catalogItems,
    loadingCatalog,
    selecionarOpen,
    cartModalOpen,
    handleCartClick,
    closeSelecao,
    openCarrinho,
    closeCarrinho,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount,
    totalCartValue,
  };
};