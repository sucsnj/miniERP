# `src/pages/medicine-table.tsx`

> Tabela de Medicamentos (`/medicine-table`): upload de planilha, busca com cache de histórico e status da tabela.

## O que faz

- Carrega status e histórico via `useMedicineTable` (TanStack Query: `status`/`history`).
- Faz upload XLS/XLSX via mutation (`upload`) e busca por termo via mutation (`search`).
- Limpa o histórico com `clearHistory` (optimistic update + rollback).
- Repete buscas clicando em um item do histórico.
- Escape limpa o input de busca (controle via estado `query`).

## Relações

- **Usa:** `useMedicineTable`; `medicineTableService` (tipos); utils `shortcuts`, `date`; `src/styles/payables.module.css`.
- **Usado por:** consome `./api/medicine-table.md`.

## Notas

- A UI diz "Últimas 100 buscas", mas o banco retém no máximo 25.
- Aceita apenas `.xlsx`/`.xls` (validação no input e no servidor).
- Erros de status/histórico são logados no console; erros de ações mostram toast.
