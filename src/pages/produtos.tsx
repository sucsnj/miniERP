import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/produtos.module.css';
import Toast from '../components/Toast';
import {
  buscarProdutos,
  buscarServicos,
  excluirProduto,
  toggleStatusProduto,
  buscarCategorias,
  buscarMarcas,
  buscarFornecedores,
  buscarUnidadesMedida,
  excluirServico,
  ItemData,
  ServicoData,
} from '../services/produtosService';
import { ProdutoOptions } from '@/components/FormularioProduto';
import ProdutosList from '@/components/ProdutosList';
import Filtros from '@/components/Filtros';
import ModalProdExclusao from '@/components/ModalProdExclusao';
import { FiltrosState } from '@/components/Filtros';

const ProdutosPage: React.FC = () => {

  const router = useRouter();

  // Lista de itens e paginação
  const [items, setItems] = useState<ItemData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros de busca
  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState<FiltrosState>({
    search: '',
    tipo: 'TODOS',
    categoriaId: '',
    marcaId: '',
    fornecedorId: '',
    status: 'TODOS',
  });

  // Listas auxiliares para os dropdowns de filtro
  const [options, setOptions] = useState<ProdutoOptions>({
    categorias: [],
    marcas: [],
    fornecedores: [],
    unidadesMedida: [],
  });

  // Modal de confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<ItemData | null>(null);

  // Toast notifications
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  }, []);

  const closeToast = () => setToastOpen(false);

  // Carrega opções auxiliares para os filtros
  const carregarAuxiliares = useCallback(async () => {
    try {
      const [cats, brands, forns, uoms] = await Promise.all([
        buscarCategorias(),
        buscarMarcas(),
        buscarFornecedores(),
        buscarUnidadesMedida(),
      ]);
      setOptions({
        categorias: cats,
        marcas: brands,
        fornecedores: forns,
        unidadesMedida: uoms,
      });
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar dados auxiliares.', 'error');
    }
  }, [showToast]);

  // Carrega o catálogo a partir das tabelas específicas de cada tipo
  const carregarItens = useCallback(async () => {
    setLoading(true);
    try {
      const [produtosData, servicosData] = await Promise.all([
        state.tipo === 'SERVICO' ? Promise.resolve(null) : buscarProdutos({
          search: searchQuery || undefined,
          categoria_id: state.categoriaId || undefined,
          marca_id: state.marcaId || undefined,
          fornecedor_id: state.fornecedorId || undefined,
          ativo: state.status,
          page: 1,
          pageSize: 10000,
        }),
        state.tipo === 'PRODUTO' || state.status !== 'TODOS' ? Promise.resolve(null) : buscarServicos({
          search: searchQuery || undefined,
          categoria_id: state.categoriaId || undefined,
          page: 1,
          pageSize: 10000,
        }),
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
      const offset = (page - 1) * 10;
      setItems(catalogo.slice(offset, offset + 10));
      setTotal(catalogo.length);
      setTotalPages(Math.max(1, Math.ceil(catalogo.length / 10)));
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar produtos e serviços.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, state.tipo, state.categoriaId, state.marcaId, state.fornecedorId, state.status, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarAuxiliares();
    }, 0);
    return () => clearTimeout(timer);
  }, [carregarAuxiliares]);

  useEffect(() => {
    const timer = setTimeout(() => carregarItens(), 0);
    return () => clearTimeout(timer);
  }, [carregarItens]);

  // Handler de Busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(state.search);
  };

  const handleLimparFiltros = () => {
    setSearchQuery('');
    setState({
      search: '',
      tipo: 'TODOS',
      categoriaId: '',
      marcaId: '',
      fornecedorId: '',
      status: 'TODOS',
    });
    setPage(1);
  };

  // Navega para /cadastro?id=X para editar o item
  const handleEditarClick = (item: ItemData) => {
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
        await toggleStatusProduto(item.id, novoStatus);
      }
      showToast(
        `Item ${novoStatus === 1 ? 'ativado' : 'desativado'} com sucesso.`,
        'success'
      );
      carregarItens();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao alterar status.', 'error');
    }
  };

  // Abre confirmação de exclusão
  const handleExcluirClick = (item: ItemData) => {
    setItemParaExcluir(item);
    setDeleteConfirmOpen(true);
  };

  // Confirma exclusão
  const handleConfirmExcluir = async () => {
    if (!itemParaExcluir) return;
    try {
      if (itemParaExcluir.tipo === 'SERVICO') {
        await excluirServico(itemParaExcluir.id);
      } else {
        await excluirProduto(itemParaExcluir.id);
      }
      showToast('Item excluído com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        carregarItens();
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

      <div className={styles.produtosPage}>

        <div>
          <h1 id="page-title">Listagem</h1>
          <p>Listagem com filtros, paginação e controle de status.</p>
        </div>

        <div className={styles.listagemGrid}>
          {/* Coluna Esquerda: Listagem e Filtros */}
          <div className={styles.produtosGridLeft}>
            {/* Filtros */}
            <Filtros
              state={state}
              data={options}
              setFiltros={setState}
              actions={{
                buscar: handleSearchSubmit,
                limpar: handleLimparFiltros,
                mudarPagina: setPage,
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
              onEdit={handleEditarClick}
              onDelete={handleExcluirClick}
            />
          </div>
        </div>

        {/* Modal: Confirmação de Exclusão */}
        {deleteConfirmOpen && itemParaExcluir && (
          <ModalProdExclusao
            open={deleteConfirmOpen}
            item={itemParaExcluir}
            onConfirm={handleConfirmExcluir}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setItemParaExcluir(null);
            }}
          />
        )}

        {/* Notificações Toast */}
        <Toast
          open={toastOpen}
          message={toastMessage}
          type={toastType}
          onClose={closeToast}
          position="top-right"
        />

        {/* Botão flutuante: Novo Cadastro */}
        <Link href="/cadastro" className={styles.fab} id="fab-novo-cadastro" title="Novo cadastro">
          <span className={styles.fabIcon}>+</span>
        </Link>
      </div >
    </>
  );
};

export default ProdutosPage;
