# `src/pages/api/contas/import.ts`

## Descrição

Endpoint de **importação de contas a pagar a partir do XML de NF-e** (`nfeProc`). Faz parsing com `xml2js`, normaliza distribuidora/documento/valores, insere duplicatas não existentes e registra a nota em `notas.db`.

## Método

### `POST /api/contas/import`

Body: `{ xml: string }`. Sem `xml` → 400 `{ error: 'Arquivo XML não fornecido' }`.

### Fluxo

1. Parse XML (`parseStringPromise`, `explicitArray: true`): caminho `nfeProc.NFe[0].infNFe[0]`.
2. Extrai: `distribuidoraRaw` (`emit.xNome`), `nNF` (`ide.nNF`), duplicatas (`cobr.dup`, opcional), `dataEmissao` (`ide.dhEmi`), `vNF` (`total.ICMSTot`), `chave` (`protNFe.infProt.chNFe`).
3. Normalizações:
   - `formatarDistribuidora(nome)` — lista de distribuidoras válidas (`acripel, cimed, profarma, g1, nova, unilever, aujo, f&f, nds, mbca, plena, total, pro`); `f&f` → `FF`; senão capitaliza a correspondência; `'distribuidora de medicamentos ltda'` → `'Mbca'`.
   - `ajustarValorPorDistribuidora(nome, valor)` — **acréscimos**: `cimed` +3,99; `pro` e `profarma` +1,39.
   - `normalizarDocumento(nNF)` — converte letras em números (A=1, B=2, ...); documento final = base + índice da duplicata (`${base}${i+1}`).
   - `validateCurrency` (valor) e `validateDate` (vencimento, normalizado para `YYYY-MM-DD`).
4. Por duplicata: se já existir conta com mesma `distribuidora`+`documento`, **pula**; senão `insertConta`.
5. Nota: se a chave já existe em `notas.db`, retorna 400 `'Nota e duplicata(s) já existentes'` quando nenhum registro novo; senão registra `insertNota(distribuidora, chave, dataEmissao, vNF)`.

### Respostas

- `200 { sucesso: true, registros }` — registros inseridos (registros são `{ distribuidora, valor, vencimento, documento }`).
- `400 { error: 'Nota e duplicata(s) já existentes' }` | `{ error: 'Nada foi inserido' }` | `{ error: 'Arquivo XML não fornecido' }`.
- `405` para métodos não-`POST`; `500 { error: 'Erro interno ao processar XML' }` em exceção.

## Observações

- Apenas `POST`.
- O parsing é **sensível ao layout da NF-e** (caminho fixo de `nfeProc`); mudanças no schema exigem revisão.
- O import interage com `notasDb` (insere/consulta notas) — mesma chave usada no módulo de Notas.
- Dependências: `xml2js`, `src/database/contasDb`, `src/database/notasDb`, `src/utils/number`, `src/utils/validation`.