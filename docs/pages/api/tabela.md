# `src/pages/api/medicine-table.ts`

## Descrição

Endpoint REST da **tabela de medicamentos**: upload de planilha (XLS/XLSX), busca com scoring, cache de histórico (`db/medicine-table.db`) e limpeza. Usa `multer` (upload) e `xlsx` (parse).

## Configuração

- `config.api.bodyParser = false`; `multer({ dest: 'uploads/' })`, campo `upload.single('file')`.

## Métodos

### `POST /api/medicine-table`

Multipart (`file` — XLSX ou XLS).

- **400** sem arquivo (`{ error: 'Arquivo XLSX não enviado.' }`), extensão inválida (`{ error: 'Apenas arquivos XLSX ou XLS são aceitos.' }`), planilha vazia ou sem colunas legíveis.
- Normaliza cabeçalhos (`normalizeHeader`: sem acentos, sem não-alfanuméricos, minúsculas) e valores (`parseNumberValue` para PF/PMC) e mapeia sinônimos de coluna:

```
substancia:   substancia | substancia1 | substância
laboratorio, produto, apresentacao
ean:          ean1 | ean
classeTerapeutica: classeterapeutica | classe terapeutica
pf205:        pf205 | pf205% | pf205percent | pf20_5 | pf20,5
pmc205:       pmc205 | pmc205% | pmc20,5
```

- Filtra linhas sem `substancia`, `produto` e `ean`.
- Persiste em `./temp/medicine-table.xlsx` (cópia) e `./temp/medicine-table-table.json` (linhas normalizadas) e popula o cache em memória `cachedTabelaTable`.
- Sucesso → `200 { message: 'Planilha de tabela carregada com sucesso.', rowCount }`.

### `GET /api/medicine-table`

- `?history=1|true` → **200** `getRecentTabelaSearchHistory()` (últimos 25); `500` em erro.
- `?status=1|true` → **200** `{ loaded, rowCount }` baseado em `loadTabelaTable()`.
- `?query=...` (obrigatório não vazio, senão `400 { error: 'Parâmetro de busca obrigatório.' }`):
  - Se a consulta normalizada estiver no cache (`findTabelaSearchHistory`) → `200 { source: 'history', results, query }`.
  - Sem planilha carregada → **404** `{ error: 'Nenhuma planilha de tabela carregada. Faça upload de um arquivo XLSX antes de pesquisar.' }`.
  - Senão busca em `searchTabelaTable(query, table)`, salva no histórico (`saveTabelaSearchHistory`) e responde `200 { source: 'table', results, query }`.
- Scoring da busca (`searchTabelaTable`): normaliza campos e texto completo; penaliza não-match; score soma `100` para substância contida, `50` para EAN exato, `10` para texto completo, `2` para produto no original (case-insensitive). Ordena por score decrescente.

### `DELETE /api/medicine-table`

- Limpa o histórico de consultas (`clearTabelaSearchHistory`) → `200 { message: 'Histórico de tabela limpo com sucesso.' }`; `500` em erro.

### Outros métodos

- **405** com `Allow: GET, POST, DELETE`.

## Observações

- `loadTabelaTable()` é chamado **na carga do módulo** e faz cache: primeiro lê `./temp/medicine-table-table.json`, depois tenta `./temp/medicine-table.xlsx` (parseia e regenera o JSON).
- O texto da UI "Últimas 100 buscas" não bate com o prune do banco (25) — ver `docs/database/medicine-tableDb.md`.
- `runMiddleware` (Promise wrapper do multer) é duplicado na API `ocr.ts`.

## Uso

- `src/pages/medicine-table.tsx` via `src/services/medicineTableService.ts`.