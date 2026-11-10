import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/produtos.module.css';
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
} from '../services/produtosService';
import { ProductOptions } from '@/components/products/ProductForm';
import ProdutosList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import ProductDeleteModal from '@/components/products/ProductDeleteModal';
import { ProductFiltersState } from '@/components/products/ProductFilters';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';

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

  // Carrega o catálogo a partir das tabelas específicas de cada tipo
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, servicesData] = await Promise.all([
        state.type === 'SERVICO' ? Promise.resolve(null) : fetchProducts({
          search: searchQuery || undefined,
          categoria_id: state.categoryId || undefined,
          marca_id: state.brandId || undefined,
          fornecedor_id: state.supplierId || undefined,
          ativo: state.status,
          page: 1,
          pageSize: 10000,
        }),
        state.type === 'PRODUTO' || state.status !== 'TODOS' ? Promise.resolve(null) : fetchServices({
          search: searchQuery || undefined,
          categoria_id: state.categoryId || undefined,
          page: 1,
          pageSize: 10000,
        }),
      ]);

      const products = productsData?.items || [];
      const services: ItemData[] = (servicesData?.items || []).map((service: ServiceData) => ({
        id: service.id,
        tipo: 'SERVICO',
        nome: service.nome,
        descricao: service.descricao,
        categoria_id: service.categoria_id,
        unidade_medida_id: 21,
        marca_id: 1,
        fornecedor_id: 1,
        preco_compra: 0,
        margem_lucro: 0,
        preco_venda: service.preco_venda,
        estoque: 0,
        multiplicador_unidade: 1,
        estoque_total: 0,
        codigo_interno: service.codigo_interno,
        referencia: service.referencia || '',
        duracao_minutos: service.duracao_minutos,
        data_criacao: service.data_criacao,
        data_atualizacao: service.data_atualizacao,
        categoria_nome: service.categoria_nome,
      }));

      const catalog = [...products, ...services].sort((a, b) => a.nome.localeCompare(b.nome));
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

  // Navega para /cadastro?id=X para editar o item
  const handleEditClick = (item: ItemData) => {
    router.push({
      pathname: '/cadastro',
      query: { id: item.id },
    });
  };

  // Alterna o status Ativo/Inativo
  const handleToggleStatus = async (item: ItemData) => {
    const novoStatus = item.ativo === 1 ? 0 : 1;
    try {
      if (item.tipo === 'PRODUTO') {
        await toggleProductStatus(item.id, novoStatus);
      }
      showToast(
        `Item ${novoStatus === 1 ? 'ativado' : 'desativado'} com sucesso.`,
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
      if (itemToDelete.tipo === 'SERVICO') {
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
              data={options}
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
        <Link href="/cadastro" className={styles.fab} id="fab-novo-cadastro" title="Novo cadastro">
          <span className={styles.fabIcon}>+</span>
        </Link>
      </PageShell>
    </>
  );
};

export default ProductsPage;
