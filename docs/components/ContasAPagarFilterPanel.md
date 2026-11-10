# `src/components/ContasAPagarFilterPanel.tsx`

## Descrição

Painel **"Detalhe"** do módulo Contas a Pagar: filtros (distribuidora, intervalo de vencimento, status), tabela de contas do período filtrado com ações (Ver/Excluir/Pagar) e diálogo de confirmação de exclusão.

## Contexto

Renderizado em `contas-a-pagar.tsx`, dentro da coluna de detalhe da grade. Recebe as contas **já filtradas** pelo pai (`filteredContas`) — a filtragem real acontece no `useMemo` da página.

## Props

```ts
interface ContasAPagarFilterPanelProps {
  filtroDistribuidora: string;
  setFiltroDistribuidora: (value: string) => void;
  filtroStatus: 'Todos' | 'Pendente' | 'Pago';
  setFiltroStatus: (value: 'Todos' | 'Pendente' | 'Pago') => void;
  filtroVencimentoDe: string;
  setFiltroVencimentoDe: (value: string) => void;
  filtroVencimentoAte: string;
  setFiltroVencimentoAte: (value: string) => void;
  hoje: string;
  filteredContas: ContaDetalhe[];
  handleView: (conta: ContaDetalhe) => void;
  handleDelete: (id: number) => void;
  handleEditar: (conta: ContaDetalhe) => void;
  handleStartPayment: (conta: ContaDetalhe) => void;
  onClearFilters: () => void;
}
```

## Comportamento/Responsabilidades

- **Filtros:** input de distribuidora, dois `input type="date"` (de/até), select de status e botão **"Limpar filtros"** (`onClearFilters`).
- **Tabela "Contas do mês":** colunas Distribuidora, Valor (`formatCurrency`), Vencimento (`formatDateString` 'DD/MM/YYYY'), Documento, Status (span com ícone ✓/✖ e `data-observacoes` para tooltip hover via CSS) e ações.
- **Ações por linha:** "Ver" (detalhes), "Excluir" (abre `ConfirmDialog`) e "Pagar" (somente quando `status === 'Pendente'`).
- **Confirmação de exclusão:** estado local `confirmOpen`/`selectedId` com `ConfirmDialog` ("Confirmar exclusão").
- Estado vazio: `filteredContas.length === 0` → linha "Nenhuma conta encontrada para o período selecionado.".

> Nota: `handleEditar` está declarado na interface de props mas **não é destruturado nem usado** no componente (dead prop).

## Dependências

- `src/utils/date` (`formatDateString`), `src/utils/formatter` (`formatCurrency`).
- `ConfirmDialog`, `src/styles/contas.module.css`, `@mui/icons-material` (`Visibility`, `Delete`, `MonetizationOn`, `CheckCircle`, `Cancel`, `HighlightOff`, `ClearAll`).

## Observações

- Tooltip de observações via `<style jsx>` (pseudo-elemento `.status:hover::after` lendo `attr(data-observacoes)`).