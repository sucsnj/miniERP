# `src/pages/tabela.tsx`

## Descrição

Página da **Tabela de Medicamentos** (`/tabela`): upload de planilha XLS/XLSX, busca com cache de histórico, status da planilha carregada e limpeza de histórico.

## Estado

- `fileInputRef` (input de arquivo oculto), `fileName`, `rowCount`, `tabelaLoaded`, `query`, `results: TabelaRow[]`, `history: TabelaSearchHistoryItem[]`, `source: 'history' | 'table' | ''`, estados de `Toast` e flags `loading`/`uploading`.

## Funções

```ts
loadSearchHistory()                 // fetchTabelaHistory() → setHistory
loadTabelaStatus()                  // fetchTabelaStatus() → tabelaLoaded + rowCount
handleFileUpload(e)                 // FormData 'file' → uploadTabela; reseta results/source; toast + reload histórico
performSearch(searchTerm)           // searchTabela; seta results/source; toasts de vazio/sucesso
handleSearch(e)                     // preventDefault → performSearch(query)
handleHistoryClick(item)            // setQuery(item.query) + performSearch
handleClearHistory()                // clearTabelaHistory() → setHistory([])
showToast(message, type)
```

## Comportamentos

- `useEffect` inicial carrega histórico e status em paralelo.
- O upload reseta `results` e `source` e limpa `rowCount` em erro.
- Busca vazia dispara toast de erro; 0 resultados → toast informativo; sucesso → toast com contagem.
- Escuta `Escape` via `useShortcuts(['Escape'])`: limpa o `.search-input` via `document.querySelector` — **DOM direto**, exceção ao padrão do projeto (uso de refs).
- Histórico exibido no painel lateral: cada item clicável dispara nova busca; `parseDate(updated_at).format('DD/MM/YYYY, HH:mm:ss')` na data.
- Resultados em tabela com 8 colunas (substância, laboratório, EAN, produto, apresentação, classe terapêutica, PF 20,5%, PMC 20,5%); `substancia`/`query` do histórico renderizam `;` como quebra de linha.
- Layout + `panel-summary` (Planilha atual / Linhas registradas / Status) e painéis de Resultados e Histórico em grid `3fr/1fr` com fallback responsivo.

## Dependências

- `src/services/tabelaService` (upload, busca, histórico, status, tipos)
- `src/components/Toast`
- `src/utils/shortcuts` (`useShortcuts`) e `src/utils/date` (`parseDate`)
- `src/styles/contas.module.css` (cabeçalho dos painéis)

## Observações

- O texto do painel de histórico diz "Últimas 100 buscas gravadas no cache", mas o banco mantém no máximo **25** (ver `docs/database/tabelaDb.md`).
- Aceita apenas `.xlsx` e `.xls` (atributo `accept` no input e checagem no servidor).