import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/products.module.css';
import { useToast } from '../hooks/useToast';
import {
  fetchProducts,
  fetchServices,
  deleteProduct,
  toggleProductStatus,
  fetchCategories,
  fetchBrands,
  fetchSuppliers,
  fetchUnitsOfMeasure,
  deleteService,
  ItemData,
  ServiceData,
} from '../services/productsService';
import { ProductOptions } from '@/components/products/ProductForm';
import ProdutosList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import ProductDeleteModal from '@/components/products/ProductDeleteModal';
import { ProductFiltersState } from '@/components/products/ProductFilters';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const ProductsPage: React.FC = () => {

  const router = useRouter();

  // Lista de itens e paginação
  const [items, setItems] = useState<ItemData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros de busca
  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState<ProductFiltersState>({
    search: '',
    type: 'TODOS',
    categoryId: '',
    brandId: '',
    supplierId: '',
    status: 'TODOS',
  });

  // Listas auxiliares para os dropdowns de filtro
  const [options, setOptions] = useState<ProductOptions>({
        categories: [],
        brands: [],
        suppliers: [],
    unitsOfMeasure: [],
  });

  // Modal de confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemData | null>(null);

  // Notificações (toast) do store global
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Carrega opções auxiliares para os filtros
  const loadAuxiliaryData = useCallback(async () => {
    try {
      const [categories, brands, suppliers, uoms] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchSuppliers(),
        fetchUnitsOfMeasure(),
      ]);
      setOptions({
        categories: categories,
        brands: brands,
        suppliers: suppliers,
        unitsOfMeasure: uoms,
      });
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar dados auxiliares.', 'error');
    }
  }, [showToast]);

  // Carrega o catálogo a partir das tabelas específicas de cada kind
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, servicesData] = await Promise.all([
        state.type === 'SERVICE' ? Promise.resolve(null) : fetchProducts({
          search: searchQuery || undefined,
          categoryId: state.categoryId || undefined,
          brandId: state.brandId || undefined,
          supplierId: state.supplierId || undefined,
          active: state.status,
          page: 1,
          pageSize: 10000,
        }),
        state.type === 'PRODUCT' || state.status !== 'TODOS' ? Promise.resolve(null) : fetchServices({
          search: searchQuery || undefined,
          categoryId: state.categoryId || undefined,
          page: 1,
          pageSize: 10000,
        }),
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
      const offset = (page - 1) * 10;
      setItems(catalog.slice(offset, offset + 10));
      setTotal(catalog.length);
      setTotalPages(Math.max(1, Math.ceil(catalog.length / 10)));
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar products e serviços.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, state.type, state.categoryId, state.brandId, state.supplierId, state.status, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAuxiliaryData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAuxiliaryData]);

  useEffect(() => {
    const timer = setTimeout(() => loadItems(), 0);
    return () => clearTimeout(timer);
  }, [loadItems]);

  // Handler de Busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(state.search);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setState({
      search: '',
      type: 'TODOS',
      categoryId: '',
      brandId: '',
      supplierId: '',
      status: 'TODOS',
    });
    setPage(1);
  };

  // Navega para /registration?id=X para editar o item
  const handleEditClick = (item: ItemData) => {
    router.push({
      pathname: '/registration',
      query: { id: item.id },
    });
  };

  // Alterna o status Ativo/Inativo
  const handleToggleStatus = async (item: ItemData) => {
    const newStatus = item.active === 1 ? 0 : 1;
    try {
      if (item.kind === 'PRODUCT') {
        await toggleProductStatus(item.id, newStatus);
      }
      showToast(
        `Item ${newStatus === 1 ? 'ativado' : 'desativado'} com sucesso.`,
        'success'
      );
      loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao alterar status.', 'error');
    }
  };

  // Abre confirmação de exclusão
  const handleDeleteClick = (item: ItemData) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Confirma exclusão
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.kind === 'SERVICE') {
        await deleteService(itemToDelete.id);
      } else {
        await deleteProduct(itemToDelete.id);
      }
      showToast('Item excluído com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadItems();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao excluir item.', 'error');
    }
  };

  return (
    <>
      <Head>
        <title>Listagem</title>
        <meta
          name="description"
          content="Listagem de produtos e serviços com filtros, paginação e controle de status."
        />
      </Head>

      <PageShell>

        <PageHeader title="Listagem" description="Listagem com filtros, paginação e controle de status." />

        <div className={styles.listagemGrid}>
          {/* Coluna Esquerda: Listagem e Filtros */}
          <div className={styles.produtosGridLeft}>
            {/* Filtros */}
            <ProductFilters
              state={state}
              date={options}
              setFilters={setState}
              actions={{
                search: handleSearchSubmit,
                clear: handleClearFilters,
                changePage: setPage,
              }}
            />

            {/* Listagem */}
            <ProdutosList
              items={items}
              loading={loading}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onToggleStatus={handleToggleStatus}
              canWrite={isAdmin}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>

        {/* Modal: Confirmação de Exclusão */}
        {deleteConfirmOpen && itemToDelete && (
          <ProductDeleteModal
            open={deleteConfirmOpen}
            item={itemToDelete}
            onConfirm={handleConfirmDelete}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setItemToDelete(null);
            }}
          />
        )}

        {/* Botão flutuante: Novo Cadastro */}
        {isAdmin && (
          <Link href="/registration" className={styles.fab} id="fab-novo-cadastro" title="Novo cadastro">
            <span className={styles.fabIcon}>+</span>
          </Link>
        )}
      </PageShell>
    </>
  );
};

export default ProductsPage;
