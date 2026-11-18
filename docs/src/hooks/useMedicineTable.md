# `src/hooks/useMedicineTable.ts`

> Hook da tabela de medicamentos: upload, UF, status, busca e histórico locais em IndexedDB.

## O que faz

- `parseSpreadsheet(file, uf)` lê o XLSX no cliente, escolhe a primeira aba com a estrutura esperada e as colunas da UF, descarta as demais antes do cache e normaliza as linhas.
- `upload` salva o snapshot e limpa o histórico; `uf`/`changeUf` persistem a UF e recalculam PF/PMC sem reenvio (snapshots antigos sem `priceColumns` exigem novo upload).
- `search` usa o histórico quando a query já foi feita (`source: 'history'`), senão busca no snapshot (`source: 'table'`).
- `clearHistory` apaga o histórico local.

## Relações

- **Usa:** `src/services/medicineTableStore.ts`, `src/utils/medicineTableSearch.ts`, `xlsx`.
- **Usado por:** [medicine-table](../pages/medicine-table.md).

## Notas

- O estado começa com `PE` e é hidratado do cache no mount; `changeUf` limpa o histórico ao trocar a referência de preço.
- Abas irrelevantes são removidas do workbook em memória antes de `sheet_to_json`.
