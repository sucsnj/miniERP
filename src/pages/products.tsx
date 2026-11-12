import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/products.module.css';
import { useToast } from '../hooks/useToast';
import type { ItemData } from '../services/productsService';
import {
  useProductsCatalog,
  useProductMutations,
  useProductsOptions,
  type ProductCatalogFilters,
} from '../hooks/useProducts';
import ProdutosList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import ProductDeleteModal from '@/components/products/ProductDeleteModal';
import { ProductFiltersState } from '@/components/products/ProductFilters';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';

const PAGE_SIZE = 10;
const emptyFilters: ProductFiltersState = {
  search: '',
  type: 'TODOS',
  categoryId: '',
  brandId: '',
  supplierId: '',
  status: 'TODOS',
};

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState<ProductFiltersState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemData | null>(null);

  const filters: ProductCatalogFilters = {
    search: searchQuery,
    type: state.type,
    categoryId: state.categoryId,
    brandId: state.brandId,
    supplierId: state.supplierId,
    status: state.status,
  };

  const catalog = useProductsCatalog(filters);
  const options = useProductsOptions();
  const { toggleStatus, remove } = useProductMutations();

  const total = catalog.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const catalogItems = catalog.data?.catalog ?? [];
  const offset = (currentPage - 1) * PAGE_SIZE;
  const items = catalogItems.slice(offset, offset + PAGE_SIZE);

  const initialLoading = !catalog.data && catalog.isLoading;
  const auxiliaryLoading = !options.data && options.isLoading;

  usePendingTask('products-initial', initialLoading);
  usePendingTask('product-options', auxiliaryLoading);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchQuery(state.search);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setState(emptyFilters);
    setPage(1);
  };

  const handleEditClick = (item: ItemData) => {
    router.push({ pathname: '/registration', query: { id: item.id } });
  };

  const handleToggleStatus = async (item: ItemData) => {
    try {
      await toggleStatus.mutateAsync(item);
      showToast(`Item ${item.active === 1 ? 'desativado' : 'ativado'} com sucesso.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao alterar status.', 'error');
    }
  };

  const handleDeleteClick = (item: ItemData) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await remove.mutateAsync(itemToDelete);
      showToast('Item excluído com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      if (catalogItems.length === 1 && currentPage > 1) {
        setPage(currentPage - 1);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao excluir item.', 'error');
    }
  };

  const productsOptions = options.data
    ? {
        categories: options.data.categories,
        brands: options.data.brands,
        suppliers: options.data.suppliers,
        unitsOfMeasure: options.data.unitsOfMeasure,
      }
    : { categories: [], brands: [], suppliers: [], unitsOfMeasure: [] };

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
          <div className={styles.produtosGridLeft}>
            <ProductFilters
              state={state}
              date={productsOptions}
              setFilters={setState}
              actions={{
                search: handleSearchSubmit,
                clear: handleClearFilters,
                changePage: setPage,
              }}
            />

            <ProdutosList
              items={items}
              total={total}
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              onToggleStatus={handleToggleStatus}
              canWrite={isAdmin}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>

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

        {isAdmin && (
          <Link href="/registration" className={styles.fab} id="fab-novo-cadastro" title="Novo cadastro" prefetch>
            <span className={styles.fabIcon}>+</span>
          </Link>
        )}
      </PageShell>
    </>
  );
};

export default ProductsPage;
