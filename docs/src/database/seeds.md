# `src/database/seeds.ts`

> Seeds iniciais usados para popular cadastros auxiliares no banco `produtos.db`.

## O que faz

- Exporta `seedUoms`: lista de unidades de medida com `sigla` e `descricao` (inclui `SR` - Serviço, id 21).
- Exporta `seedCategories`: `[ { nome: 'Geral', descricao: 'Categoria padrão' } ]`.
- Exporta `seedBrands`: `[ { nome: 'Outros' } ]`.
- Exporta `seedSuppliers`: `[ { nome: 'Sem fornecedor' } ]`.

## Relações

- **Usa:** —
- **Usado por:** [`src/database/produtosDb.ts`](./produtosDb.md) (insere seeds quando tabelas respectivas estão vazias)

## Notas

- Esses registros são tratados como "padrão" pelo módulo de produtos: não podem ser apagados/atualizados em certos casos (ex.: categoria Geral, marca Outros, fornecedor Sem fornecedor, unidade UN id=1).
