# `src/hooks/useCart.ts`

> Hook que centraliza o carrinho de compras e o catálogo de seleção de produtos/serviços.

## O que faz

- Gerencia `cartItems`, modais (`selectModalOpen`, `cartModalOpen`), busca e catálogo (`cartSearch`, `catalogItems`, `loadingCatalog`).
- Busca produtos (ativos) e serviços via `Promise.all` com `pageSize: 50`, mapeia serviços para `ItemData` e ordena por nome.
- Controla adição (+1), remoção (-1), atualização de quantidade e limpeza do carrinho; agrupa por `id+tipo`.
- Expõe totais via `getCartSummary` (`totalCartCount`, `totalCartValue`).
- Carrega catálogo com debounce de 250ms enquanto modal de seleção aberto.

## Relações

- **Usa:** `fetchProducts`, `fetchServices` (`src/services/produtosService.ts`), `getCartSummary` (`src/utils/cart.ts`), `CartItem` (`src/types/sale.ts`).
- **Usado por:** formulários de venda diária e de edição de venda.

## Notas

- Mapear serviço para `ItemData` usa valores padrão (`unidade_medida_id=21`, `marca_id=1`, `fornecedor_id=1`, `estoque=0`, `multiplicador_unidade=1`, `estoque_total=0`).
- Identificadores pt-BR mantidos na API (tipos/retornos).