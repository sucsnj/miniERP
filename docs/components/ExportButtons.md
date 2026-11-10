# `src/components/ExportButtons.tsx`

## Descrição

Componente de botões para exportar vendas em XLSX/PDF e importar vendas de planilhas.

## Contexto de Uso

Este componente é utilizado em conjunto com os botões de exportação e importação, que estão localizados acima do calendário. Os botões estão agrupados em duas categorias: "Exportação" e "Importação", e estão localizados em um card com título "Ações".

## Responsabilidades

- Exportar vendas do dia ou do mês para XLSX (`exportXLSX('day' | 'month')`).
- Exportar tabela HTML para PDF (`.table-container`) via `html2canvas` + `jsPDF`.
- Importar arquivos XLSX (`.xlsx`, `.xls`) por dia ou por mês e registrar vendas.
- Exibir mensagens via callback `onMessage`.

## Assinatura

```ts
interface ExportButtonsProps {
  sales: VendaDiaria[];
  mes: number;
  ano: number;
  selectedDate?: string;
  onMessage?: (message: string, type: 'success' | 'error' | 'info') => void;
  onImportCompleted?: () => void;
}

const ExportButtons: FC<ExportButtonsProps>;
```

## Props

- `sales` - vendas atuais (`VendaDiaria[]`).
- `mes`, `ano`, `selectedDate` - contexto de exportação.
- `onMessage` - callback de notificação.
- `onImportCompleted` - callback após importação.

## Importação (formato XLSX)

Linhas aceitas (headers normalizados: minúsculas, sem acentos):

- `data` (ou `date`, `dia`) - data `YYYY-MM-DD`. Obrigatória no modo mês; no modo dia usa `selectedDate`.
- `valor` (ou `value`, `amount`) - convertido com `parseNumber`.
- `observacoes` (ou `obs`) - opcional.
- `criado_em` (ou `created_at`) - opcional.

Validações: erro na primeira linha inválida; no modo dia a data deve bater com `selectedDate`; no modo mês a data deve pertencer a `mes/ano`. O registro usa `registrarVendaComCriadoEm`.

## Exemplo de Uso

```tsx
<ExportButtons
  sales={vendas}
  mes={mes}
  ano={ano}
  selectedDate={selectedDate}
  onMessage={handleMessage}
  onImportCompleted={handleImportCompleted}
/>
```

## Observações

- Usa `xlsx` dinamicamente para evitar importação no bundle inicial.
- Faz validação de data para importações por dia/mês.
- O PDF é gerado a partir de `html2canvas` e `jspdf`.
