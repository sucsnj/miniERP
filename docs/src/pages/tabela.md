# `src/pages/tabela.tsx`

> Tabela de Medicamentos (`/tabela`): upload de planilha, busca com cache de histórico e status da tabela.

## O que faz

- Carrega status (`fetchTableStatus`) e histórico (`fetchTableHistory`) ao montar.
- Faz upload XLS/XLSX via `uploadTable` (FormData campo `file`) e busca por termo via `searchTable` (fonte `history` ou `table`).
- Limpa o histórico (`clearTableHistory`) e repete buscas clicando em um item do histórico.
- Escape limpa o input de busca via `document.querySelector('.search-input')`.

## Relações

- **Usa:** `tabelaService`; utils `shortcuts`, `date`; `src/styles/contas.module.css`.
- **Usado por:** consome `./api/tabela.md`.

## Notas

- A UI diz "Últimas 100 buscas", mas o banco retém no máximo 25.
- Aceita apenas `.xlsx`/`.xls` (validação no input e no servidor).
