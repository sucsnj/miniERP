# `src/pages/api/tabela.ts`

> REST da tabela de medicamentos: upload de XLS/XLSX, busca com scoring, cache de histórico e limpeza.

## O que faz

- `POST` multipart `file`: normaliza cabeçalhos/valores e persiste `./temp/tabela.xlsx` + `tabela-table.json`; responde `200 { rowCount }`.
- `GET ?history=1`: últimos 25 do histórico; `?status=1`: `{ loaded, rowCount }`; `?query=`: busca (cache → `source: 'history'`, senão `source: 'table'`).
- `DELETE`: limpa o histórico; demais métodos → `405` (`Allow: GET, POST, DELETE`).
- Busca (`searchTableData`): score +100 substância, +50 EAN exato, +10 texto; ordena por score.

## Relações

- **Usa:** `src/database/tabelaDb.ts`; `multer`, `xlsx`.
- **Usado por:** `tabelaService`; `../tabela.md`.

## Notas

- `loadTableData()` cacheia em memória e roda na carga do módulo.
- A UI diz "Últimas 100 buscas", mas o banco retém 25.
