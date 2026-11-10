# `src/components/Filtros.tsx`

## Descrição

Componente responsável por aplicar filtros na lista de produtos/seviços.

## Contexto

Utilizado para facilitar a busca de produtos/serviços cadastrados.

## Responsabilidades

- Aplicar filtros na lista de produtos/serviços.
- Limpar filtros.

## Props

- `state` - estado do componente.
    - `search` - texto de busca.
    - `tipo` - tipo de produto/serviço.
    - `categoriaId` - id da categoria.
    - `marcaId` - id da marca.
    - `fornecedorId` - id do fornecedor.
    - `status` - status do produto/serviço.
- `data` - dados do componente.
    - `categorias` - lista de categorias.
    - `marcas` - lista de marcas.
    - `fornecedores` - lista de fornecedores.
- `actions` - ações do componente.
    - `buscar` - buscar produtos/serviços.
    - `limpar` - limpar filtros.
    - `mudarPagina` - mudar página da lista.

## Dependências

- `src/services/produtosService.ts` (tipos e dados).

## Exemplo de uso

```tsx
<Filtros
  state={state}
  data={data}
  setFiltros={setFiltros}
  actions={actions}
/>
```

## Observações

- Alguns estilos estão aplicados inline.
- A lista é atualizada quando um filtro é alterado.