# `src/services/tabelaService.ts`

## Descrição

Cliente HTTP da **tabela de medicamentos** — upload de planilha, busca, histórico e status via `/api/tabela`.

## Tipos

```ts
interface TabelaRow {
  substancia: string;
  laboratorio: string;
  ean: string;
  produto: string;
  apresentacao: string;
  classeTerapeutica: string;
  pf205: string;
  pmc205: string;
}

interface TabelaSearchHistoryItem {
  id: number;
  query: string;
  result_count: number;
  updated_at: string;
}

interface TabelaSearchResponse {
  source: 'history' | 'table';
  results: TabelaRow[];
  query: string;
}

interface TabelaStatusResponse {
  loaded: boolean;
  rowCount: number;
}
```

## Funções

```ts
uploadTabela(formData: FormData): Promise<any>                  // POST /api/tabela (multipart, campo 'file')
searchTabela(query: string): Promise<TabelaSearchResponse>     // GET /api/tabela?query=...
fetchTabelaHistory(): Promise<TabelaSearchHistoryItem[]>       // GET /api/tabela?history=1
clearTabelaHistory(): Promise<any>                             // DELETE /api/tabela
fetchTabelaStatus(): Promise<TabelaStatusResponse>             // GET /api/tabela?status=1
```

## Comportamentos

- `searchTabela` faz `encodeURIComponent(query.trim())`.
- Todas as funções passam pela helper local `handleJsonResponse(response)`:
  - Faz `response.json()`;
  - Se `!response.ok`, lança `new Error(json.error || 'Erro desconhecido ao comunicar com o servidor.')`;
  - Senão retorna o JSON.
- É o único serviço do projeto com tratamento uniforme de `response.ok` (padrão não seguido pelos demais services).

## Observações

- `source: 'history'` indica resultado vindo do cache SQLite; `'table'`, da busca na planilha carregada.
- `fetchTabelaStatus` indica se há planilha carregada no servidor (`loaded`) e quantas linhas (`rowCount`).

## Uso

- `src/pages/tabela.tsx` (upload, busca, histórico, limpeza e status).