# `src/components/products/ProductUnitsSection.tsx`

> Seção de unidades de medida do formulário de produto.

## O que faz

- Renderiza a lista de unidades de medida vinculadas ao item.
- Permite definir a unidade principal, alterar unidade e fator, adicionar e remover unidades.
- Delega as regras de mutação para `src/utils/productUnits.ts`.

## Relações

- **Usa:** `src/utils/productUnits.ts`.
- **Usado por:** [ProductForm](./ProductForm.md).

## Notas

- Apresentacional: apenas renderiza e chama `setForm`.
