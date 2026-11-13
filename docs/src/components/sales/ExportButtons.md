# `src/components/sales/ExportButtons.tsx`

> Botões de exportar/importar vendas (XLSX).

## O que faz

- Exporta XLSX por mês ou dia (`xlsx` importado dinamicamente), com slug da loja atual no nome do arquivo.
- Importa `.xlsx`/`.xls` normalizando headers (`data`/`valor`/`observacoes`/`criado_em`), suporta datas Excel/ISO/BR (`DD/MM/AAAA`) e datas de qualquer mês/ano, não dependendo da seleção de `/history`.
- Notifica por `onMessage`; invalida tenant-scoped queries e chama `onImportCompleted` ao concluir.

```ts
interface ExportButtonsProps {
  sales: DailySale[]; month: number; year: number; selectedDate?: string;
  onMessage?: (message: string, type: 'success' | 'error' | 'info') => void;
  onImportCompleted?: () => void;
}
```

## Relações

- **Usa:** `salesService` (`src/services/salesService.ts`), `parseNumber` (`src/utils/number.ts`), `dayjs`, `queryClient` + `tenantQueryRoot`.
- **Usado por:** [history](../../pages/history.md).

## Notas

- A importação não exige o mês/ano selecionado em `/history`; aceita datas em qualquer período válido.
- No modo dia, a data deve bater com `selectedDate`.
