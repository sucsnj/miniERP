# `src/components/sales/ExportButtons.tsx`

> Botões de exportar/importar vendas (XLSX/PDF).

## O que faz

- Exporta XLSX por mês/dia (`xlsx` importado dinamicamente) e PDF da `.table-container` (`html2canvas` + `jsPDF`).
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

- **Usa:** `vendasService` (`src/services/vendasService.ts`), `parseNumber` (`src/utils/number.ts`), `parseDate` (`src/utils/date.ts`).
- **Usado por:** `../../pages/index.md`.

## Notas

- No modo dia a data precisa bater com `selectedDate`; no mês, pertencer a `mes/ano`.
- Erros de importação reportam apenas a primeira linha inválida.
