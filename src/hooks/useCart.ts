import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProducts, fetchServices, ItemData, ServiceData } from '../services/productsService';
import { getCartSummary } from '../utils/cart';
import type { CartItem } from '../types/sale';

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
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  // Modal de gerenciamento do carrinho
  const [cartModalOpen, setCartModalOpen] = useState(false);
  // Busca do catálogo
  const [cartSearch, setCartSearch] = useState('');
  const [catalogItems, setCatalogItems] = useState<ItemData[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Busca products e serviços para o catálogo de seleção
  const loadCatalogItems = useCallback(async (query: string) => {
    setLoadingCatalog(true);
    try {
      const [productsData, servicesData] = await Promise.all([
        fetchProducts({ search: query || undefined, active: 'ATIVO', page: 1, pageSize: 50 }),
        fetchServices({ search: query || undefined, page: 1, pageSize: 50 }),
      ]);

      const products = productsData?.items || [];
      const services: ItemData[] = (servicesData?.items || []).map((service: ServiceData) => ({
        id: service.id,
        kind: 'SERVICE',
        name: service.name,
        description: service.description,
        categoryId: service.categoryId,
        unit_measure_id: '21',
        brandId: '',
        supplierId: '',
        purchasePrice: 0,
        profitMargin: 0,
        salePrice: service.salePrice,
        stock: 0,
        unit_multiplier: 1,
        totalStock: 0,
        internalCode: service.internalCode,
        reference: service.reference || '',
        duration_minutes: service.duration_minutes,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        categoryName: service.categoryName,
      }));

      const catalog = [...products, ...services].sort((a, b) => a.name.localeCompare(b.name));
      setCatalogItems(catalog);
    } catch (error) {
      console.error('Erro ao buscar catálogo para o carrinho:', error);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  // Carrega o catálogo (com debounce) enquanto o modal de seleção estiver aberto
  useEffect(() => {
    if (!selectModalOpen) return;
    const timer = setTimeout(() => loadCatalogItems(cartSearch), 250);
    return () => clearTimeout(timer);
  }, [selectModalOpen, cartSearch, loadCatalogItems]);

  // Abre o modal de seleção de itens
  const handleCartClick = useCallback(() => {
    setSelectModalOpen(true);
  }, []);

  const closeSelectModal = useCallback(() => {
    setSelectModalOpen(false);
  }, []);

  const openCartModal = useCallback(() => {
    setCartModalOpen(true);
  }, []);

  const closeCartModal = useCallback(() => {
    setCartModalOpen(false);
  }, []);

  // Fecha a seleção e abre o gerenciamento do carrinho
  const handleManageCart = useCallback(() => {
    setSelectModalOpen(false);
    setCartModalOpen(true);
  }, []);

  // Adiciona +1 do product/serviço ao carrinho
  const handleAddToCart = useCallback(
    (item: ItemData) => {
      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (ci) => ci.id === item.id && ci.kind === item.kind
        );
        if (existingIndex > -1) {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        } else {
          return [
            ...prevItems,
            {
              id: item.id,
              kind: item.kind,
              name: item.name,
              salePrice: item.salePrice,
              quantity: 1,
              internalCode: item.internalCode,
              reference: item.reference,
              stock: item.stock,
            },
          ];
        }
      });
      onToast?.(`+1 "${item.name}" adicionado ao carrinho!`, 'success');
    },
    [onToast]
  );

  // Subtrai 1 unit do item no carrinho
  const handleRemoveFromCart = useCallback(
    (item: ItemData) => {
      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (ci) => ci.id === item.id && ci.kind === item.kind
        );
        if (existingIndex === -1) return prevItems;

        if (prevItems[existingIndex].quantity <= 1) {
          return prevItems.filter((_, idx) => idx !== existingIndex);
        } else {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity - 1,
          };
          return updated;
        }
      });
      onToast?.(`-1 "${item.name}" removido do carrinho.`, 'info');
    },
    [onToast]
  );

  // Atualiza quantity no carrinho
  const handleUpdateQuantity = useCallback(
    (id: string, type: 'PRODUCT' | 'SERVICE', newQty: number) => {
      setCartItems((prevItems) => {
        if (newQty <= 0) {
          return prevItems.filter((ci) => !(ci.id === id && ci.kind === type));
        }
        return prevItems.map((ci) => {
          if (ci.id === id && ci.kind === type) {
            return { ...ci, quantity: newQty };
          }
          return ci;
        });
      });
    },
    []
  );

  // Remove item completo do carrinho
  const handleRemoveItem = useCallback(
    (id: string, type: 'PRODUCT' | 'SERVICE') => {
      setCartItems((prevItems) =>
        prevItems.filter((ci) => !(ci.id === id && ci.kind === type))
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

  const cartSummary = useMemo(() => getCartSummary(cartItems), [cartItems]);

  return {
    cartItems,
    setCartItems,
    cartSearch,
    setCartSearch,
    catalogItems,
    loadingCatalog,
    selectModalOpen,
    cartModalOpen,
    handleCartClick,
    closeSelectModal,
    openCartModal,
    closeCartModal,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount: cartSummary.totalItems,
    totalCartValue: cartSummary.totalValue,
  };
};