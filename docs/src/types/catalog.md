# `src/types/catalog.ts`

> Tipos de formulário dos cadastros auxiliares de catálogo.

## O que faz

- `BrandFormData`: formulário de marca (`name`).
- `SupplierFormData`: formulário de fornecedor (`name`).
- `UnitOfMeasureFormData`: formulário de unidade de medida (`abbreviation`, `description`).

## Relações

- **Usa:** apenas TypeScript.
- **Usado por:** `src/hooks/useBrand.ts`, `src/hooks/useSupplier.ts`, `src/hooks/useUnitOfMeasure.ts` e [CatalogEntityModal](../components/catalog/CatalogEntityModal.md) via página de cadastro.

## Notas

- Os tipos saíram dos modais antigos para evitar que hooks importem componentes de UI.
