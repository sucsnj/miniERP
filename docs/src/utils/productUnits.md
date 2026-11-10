# `src/utils/productUnits.ts`

> Regras puras das unidades de medida do formulário de produto.

## O que faz

- Operações imutáveis sobre `UnitOfMeasureRow[]`: `setUnitAsPrincipal`, `updateUnitId`, `updateUnitMultiplier`, `removeUnit`, `addUnit`.
- Sincroniza os campos "resumo" `unitOfMeasureId`/`unitMultiplier` quando a unidade afetada é a principal.
- `removeUnit` promove a primeira restante quando a principal é removida.

## Relações

- **Usado por:** `products/ProductForm`.

## Notas

- Retornos `UnitChangeResult`/`PrincipalUnitChangeResult` evitam sobrescrever campos com `undefined`.
