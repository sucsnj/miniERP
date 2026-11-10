# `src/services/produtosService.ts`

## Descrição

Camada cliente (fetch) para os endpoints de produtos/catálogo. Compartilha os tipos `ItemData`, `ServicoData`, `ServicoInput`, `MovimentacaoEstoqueData`, `MovimentacaoEstoqueInput`, `CategoriaData`, `MarcaData`, `FornecedorData`, `UnidadeMedidaData` e `PagedResult<T>`.

## Assinatura (funções exportadas)

```ts
// Produtos
export const buscarProdutos: (options?: {
  search?: string; categoria_id?: number; marca_id?: number; fornecedor_id?: number;
  preco_venda?: number; ativo?: 'ATIVO' | 'INATIVO' | 'TODOS'; page?: number; pageSize?: number;
}) => Promise<PagedResult<ItemData>>;
export const registrarProduto: (dados: Omit<ItemData, 'id' | 'ativo'> & { ativo?: number }) => Promise<any>;
export const atualizarProduto: (id: number, dados: Omit<ItemData, 'id'>) => Promise<any>;
export const excluirProduto: (id: number) => Promise<any>;
export const toggleStatusProduto: (id: number, ativo: number) => Promise<any>;

// Serviços
export const buscarServicos: (options?: {
  search?: string; categoria_id?: number; page?: number; pageSize?: number;
}) => Promise<PagedResult<ServicoData>>;
export const buscarServicoPorId: (id: number) => Promise<ServicoData | null>;
export const registrarServico: (dados: ServicoInput) => Promise<any>;
export const atualizarServico: (id: number, dados: ServicoInput) => Promise<any>;
export const excluirServico: (id: number) => Promise<any>;

// Movimentações
export const buscarMovimentacoesEstoque: (item_id: number) => Promise<MovimentacaoEstoqueData[]>;
export const registrarMovimentacaoEstoque: (dados: MovimentacaoEstoqueInput) => Promise<any>;

// Categorias
export const buscarCategorias: () => Promise<CategoriaData[]>;
export const criarCategoria: (nome: string, descricao?: string) => Promise<{ id: number; message: string }>;
export const deletarCategoria: (id: number) => Promise<{ message: string }>;
export const atualizarCategoria: (id: number, nome: string, descricao?: string) => Promise<{ message: string }>;

// Marcas
export const buscarMarcas: () => Promise<MarcaData[]>;
export const criarMarca: (nome: string) => Promise<{ id: number; message: string }>;
export const deletarMarca: (id: number) => Promise<{ message: string }>;
export const atualizarMarca: (id: number, nome: string) => Promise<{ message: string }>;

// Fornecedores
export const buscarFornecedores: () => Promise<FornecedorData[]>;
export const criarFornecedor: (nome: string) => Promise<{ id: number; message: string }>;
export const deletarFornecedor: (id: number) => Promise<{ message: string }>;
export const atualizarFornecedor: (id: number, nome: string) => Promise<{ message: string }>;

// Unidades de Medida
export const buscarUnidadesMedida: () => Promise<UnidadeMedidaData[]>;
export const criarUnidadeMedida: (sigla: string, descricao?: string) => Promise<{ id: number; message: string }>;
export const deletarUnidadeMedida: (id: number) => Promise<{ message: string }>;
export const atualizarUnidadeMedida: (id: number, sigla: string, descricao?: string) => Promise<{ message: string }>;
```

### Tipos principais

```ts
interface ItemData {
  id: number; tipo: 'PRODUTO' | 'SERVICO'; nome: string; descricao?: string;
  categoria_id: number; unidade_medida_id: number; marca_id: number; fornecedor_id: number;
  preco_compra: number; margem_lucro: number; preco_venda: number; estoque: number;
  multiplicador_unidade: number; estoque_total?: number; codigo_interno?: string;
  referencia: string; ativo?: number; duracao_minutos?: number;
  data_criacao?: string; data_atualizacao?: string; categoria_nome?: string;
  marca_nome?: string; unidade_medida_sigla?: string; unidade_medida_descricao?: string;
  codigos_barras?: BarcodeData[];
  unidades_medida?: { unidade_medida_id: number; multiplicador_unidade: number; principal: number }[];
}

interface PagedResult<T> {
  items: T[]; total: number; page: number; pageSize: number; totalPages: number;
}

interface BarcodeData { codigo_barras: string; principal: number; }
```

## Endpoints consumidos

- `GET/POST/PUT/DELETE /api/produtos` (produtos; `toggle-status` via POST `{ action: 'toggle-status' }`).
- `GET/POST `/api/produtos/servicos`, `PUT/DELETE /api/produtos/servicos?id=`.
- `GET /api/produtos/movimentacoes?item_id=`, `POST /api/produtos/movimentacoes`.
- `GET/POST/PUT/DELETE /api/produtos/categorias`, `.../marcas`, `.../fornecedores`, `.../unidades-medida`.

## Observações

- Tratamento de erro: lança `Error(errorData.error || 'mensagem padrão')` quando `!response.ok`.
- `buscarServicoPorId` retorna o JSON direto (não normaliza para `{ items }` como `buscarServicos`).
- `registrarProduto`/`atualizarProduto` tipam `dados` como `Omit<ItemData,...>`, mas as rotas esperam `ItemInput` (só `PRODUTO`) — ver `produtosDb.ts`.
- A interface `ItemData.tipo` admite `'SERVICO'`, porém a rota `/api/produtos` aceita apenas `PRODUTO`; serviços têm rotas próprias.