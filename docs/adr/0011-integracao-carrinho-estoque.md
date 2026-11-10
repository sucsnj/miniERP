# ADR 0011 — Integração do carrinho com estoque (venda, devolução e ajustes)

- **Status:** aceito (29/10/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 29/10/2026.

## Contexto

O carrinho de vendas (`useCart`) registra itens em `venda_itens`, mas a venda não altera o estoque de produtos. Vendas podem ter valor negativo (ajustes financeiros), o estoque é inteiro enquanto a quantidade de venda é decimal, e não há regra explícita para estoque insuficiente. Também não existe reconciliação de estoque em edição/exclusão de venda nem rastreabilidade entre venda e movimentação.

## Decisão

1. **Devolução explícita:** estoque só é devolvido (`ENTRADA`) quando a venda for explicitamente marcada como devolução (campo/flag dedicado), nunca apenas por valor negativo.
2. **Quantidade inteira para produtos:** a quantidade de item `PRODUTO` no carrinho deve ser inteira; `SERVICO` pode permanecer decimal por não afetar estoque.
3. **Estoque insuficiente configurável:** por padrão permitir estoque negativo, mas expor a regra em um **menu de configurações do app** (a criar), onde o usuário poderá bloquear ou permitir venda com estoque insuficiente.
4. **Escopo inicial backend-first:** implementar primeiro APIs/banco e reconciliação; UI e guards depois.
5. **Movimentações rastreáveis:** venda gera `SAIDA` e devolução gera `ENTRADA`, com `descricao` incluindo o id da venda e o tipo de operação.
6. **Reconciliação em edição/exclusão:** calcular diferença entre itens antigos e novos; restaurar/ajustar estoque antes de substituir ou excluir itens.
7. **Configurações do app:** criar um local único e descobrível para parâmetros operacionais (inicialmente “permitir estoque negativo”).

## Consequências

**Positivas:**

- Evita devolução acidental de estoque em ajustes financeiros negativos.
- Mantém o estoque coerente com operações reais de venda/devolução.
- Permite adaptação da regra de estoque insuficiente sem alterar código.

**Negativas / aceitas:**

- Exige campo adicional em `vendas_diarias` (flag/tipo de devolução) e migração de banco.
- A reconciliação em edição aumenta a complexidade da API de vendas.
- O menu de configurações é uma funcionalidade nova fora do fluxo de vendas.

## Alternativas consideradas

- Devolver estoque automaticamente em toda venda negativa: risco de corromper estoque em ajustes financeiros.
- Permitir quantidade fracionada no estoque: exigiria migração de `estoque` para REAL e maior complexidade.
- Bloquear venda com estoque insuficiente sempre: incompatível com a rotina desejada pelo usuário.

## Referências

- `src/hooks/useCart.ts`
- `src/pages/api/vendas.ts`
- `src/database/db.ts`
- `src/database/produtosDb.ts`
- `src/pages/api/produtos/movimentacoes.ts`
- `docs/src/components/cart/CartModal.md`
- `docs/src/hooks/useCart.md`
