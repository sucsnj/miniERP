# `src/components/ProdutosList.tsx`

## Descrição

Componente de **listagem do catálogo** (produtos + serviços) usado na página `/produtos`. Exibe tabela paginada com ações de edição, exclusão e alternância de status, além de estados de carregamento e vazio.

## Contexto

Renderizado pela página `produtos.tsx`, que já aplicou filtros e paginação localmente; o componente é (majoritariamente) de **apresentação**, delegando ações via callbacks.

## Props

```ts
interface ListagemProps {
    items: ItemData[];                    // itens já filtrados/paginados
    loading: boolean;                     // exibe "Carregando..." no lugar da tabela
    onEdit(item: ItemData): void;         // abrir edição (props.tudo leva a /cadastro?id=X)
    onDelete(item: ItemData): void;       // abrir confirmação de exclusão
    onToggleStatus(item: ItemData): void; // ativar/desativar produto
    total: number;                        // total de registros (após filtros)
    page: number;                         // página atual (1-indexada)
    totalPages: number;                   // nº total de páginas
    onPageChange(page: number): void;     // mudar página (Anterior/Próxima)
}
```

- Default export é a função `Listagem` (componente nomeado como tal no arquivo).

## Comportamento/Responsabilidades

- Colunas: **Tipo** (badge "Produto"/"Serviço"), **Cód. Interno**, **Nome** (+ descrição truncada em 50 caracteres), **Preço Venda** (`formatCurrency`), **Estoque** e **Status**.
- **Estoque:** para `SERVICO` mostra "—"; para `PRODUTO` usa `estoque_total` quando presente, senão `estoque × (multiplicador_unidade ?? 1)`, seguido da sigla da unidade.
- **Status:** só para `PRODUTO` (badge Ativo/Inativo); serviços não têm a coluna.
- **Ações:** botão de ativar/desativar (só produtos, ícone `Block`/`Check`), editar (`Edit`) e excluir (`Delete`). Cada botão tem `id` com sufixo do item (ex.: `toggle-status-7`) e `title` explicativo.
- O código de barras principal do item (coluna não exibida, usada para `title`/chave de estoque) é derivado de `codigos_barras.find(c => c.principal === 1)`.
- Paginação visível apenas quando `totalPages > 1`, com "Página X de Y" e botões Anterior/Próxima (desabilitados nas extremidades).
- Estados: `loading` → "Carregando..."; lista vazia → "Nenhum registro encontrado."

## Dependências

- `src/services/produtosService.ts` (tipo `ItemData`).
- `src/utils/formatter.ts` (`formatCurrency`).
- `src/styles/produtos.module.css` (estilos da tabela/badges).
- `@mui/icons-material` (`Edit`, `Delete`, `Check`, `Block`).

## Observações

- Não possui estado interno; todo o estado (filtros, paginação, loading) vive em `produtos.tsx`.
- A paginação é cliente-side (a API entrega até 10.000 itens por vez).