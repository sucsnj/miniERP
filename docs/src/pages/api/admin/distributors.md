# `src/pages/api/admin/distributors.ts`

> Configuração administrativa das distribuidoras da empresa.

## O que faz

- `GET`: retorna `{ distributors: DistributorConfig[] }` de `company_settings.distributor_config`.
- `PUT`: valida e substitui a configuração inteira de distribuidoras do tenant; retorna a versão atualizada.

```ts
type DistributorConfig = {
  id: string;
  name: string;
  aliases: string[];
  enabled: boolean;
  rules: Array<{
    id: string;
    name: string;
    type: 'amount_adjustment' | 'name_override';
    value: number | string;
    enabled: boolean;
  }>;
};
```

## Relações

- **Usa:** `getCompanySettings`/`updateDistributorConfig` (`src/database/settingsRepository.ts`), `normalizeDistributorConfig` (`src/utils/distributors.ts`).
- **Usado por:** [adminService](../../../services/adminService.md); [DistributorSettings](../../../components/payables/DistributorSettings.md).

## Notas

- Admin-only.
- A normalização valida `aliases` (sem acentos/pontuação e sem duplicatas); cada regra valida o tipo e valor específico (`amount_adjustment` número finito; `name_override` string não vazia).
