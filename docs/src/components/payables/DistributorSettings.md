# `src/components/payables/DistributorSettings.tsx`

> Card de configuração de distribuidoras e regras da importação XML.

## O que faz

- Lista, cria, edita e exclui distribuidoras do tenant (admin-only), com regras tipadas (`amount_adjustment`, `name_override`).
- Cada distribuidora pode ter `taxId` (CNPJ 14 dígitos ou CPF 11 dígitos) e aliases de `emit.xNome`.
- Persiste via `/api/admin/distributors` e atualiza o cache local.

## Relações

- **Usa:** `adminService` (`fetchDistributors`, `replaceDistributors`), `DistributorConfig`, MUI icons, `Panel`, `PanelHeader`, `Button`.
- **Usado por:** `src/pages/settings.tsx`.

## Notas

- `taxId` é opcional, mas recomendado: quando presente, a importação associa por CNPJ/CPF exato antes dos aliases.
- Aliases continuam como fallback para emitentes sem CNPJ/CPF ou variações de nome.
