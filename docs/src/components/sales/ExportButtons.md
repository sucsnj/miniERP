# `src/components/sales/ExportButtons.tsx`

> Botões de exportar/importar vendas (XLSX).

## O que faz

- Exporta XLSX por mês/dia (`xlsx` importado dinamicamente), com slug da loja atual no nome do arquivo.
- Importa `.xlsx`/`.xls` normalizando headers (`data`/`valor`/`observacoes`/`criado_em`), validando a data por modo e registrando via `registerSaleWithCreatedAt`.
- Notifica por `onMessage`; chama `onImportCompleted` ao concluir.

```ts
interface ExportButtonsProps {
  sales: DailySale[]; month: number; year: number; selectedDate?: string;
  onMessage?: (message: string, type: 'success' | 'error' | 'info') => void;
  onImportCompleted?: () => void;
}
```

## Relações

- **Usa:** `salesService` (`src/services/salesService.ts`), `parseNumber` (`src/utils/number.ts`), `parseDate` (`src/utils/date.ts`).
- **Usado por:** [history](../../pages/history.md).

## Notas

- No modo dia a data precisa bater com `selectedDate`; no mês, pertencer a `mes/ano`.
- Exportação/importação permanece em XLSX.
