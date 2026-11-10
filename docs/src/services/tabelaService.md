# `src/services/tabelaService.ts`

> Cliente HTTP via `fetch` para o domínio da Tabela de Medicamentos (endpoint interno `/api/tabela`).

## O que faz

- Expõe interfaces: `TableRow`, `TableSearchHistoryItem`, `TabelaSearchResponse`, `TabelaStatusResponse`.
- Centraliza tratamento de resposta com `handleJsonResponse(response)` (lança `Error` com `json.error` se `!response.ok`).
- Realiza upload de arquivo (`uploadTable` via `FormData` POST), busca (`searchTable` com `query` codificada), histórico (`fetchTableHistory`), limpa histórico (`clearTableHistory` DELETE) e consulta status (`fetchTableStatus`).

## Relações

- **Usa:** [`/api/tabela`](../pages/api/tabela.md)
- **Usado por:** página [`/tabela`](../pages/tabela.md) e componentes relacionados

## Notas

- `searchTable` aplica `encodeURIComponent(query.trim())` na URL.
- `fetchTableHistory` chama `?history=1`; `fetchTableStatus` chama `?status=1`.