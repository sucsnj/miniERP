# `src/services/notasService.ts`

## Descrição

Cliente HTTP das **notas fiscais importadas** — envolve os endpoints de `/api/notas`.

## Tipos

```ts
interface NotaDetalhe {
  id: number;
  distribuidora: string;
  chave: string;
  data_emissao: string;
  valor_nota: number;
}
```

## Funções

```ts
buscarNotasPorPeriodo(ano: number, mes?: number): Promise<NotaDetalhe[]>   // GET /api/notas?ano=YYYY&mes=M
buscarNotaPorValor(valor: number): Promise<NotaDetalhe | null>             // GET /api/notas?valor=...
buscarTodasNotas(): Promise<NotaDetalhe[]>                                 // GET /api/notas
excluirNota(id: number): Promise<any>                                      // DELETE /api/notas { id }
```

## Comportamentos

- `buscarNotasPorPeriodo` monta `URLSearchParams` com `ano` e, se `mes` definido, também `mes`; retorna `response.json()` diretamente.
- `buscarNotaPorValor` trata `404` retornando `null`; demais status retornam o JSON do corpo como `NotaDetalhe`.
- `excluirNota` envia `DELETE` com `Content-Type: application/json` e corpo `{ id }`; retorna o JSON (campo `changes`).

## Observações

- As funções **não verificam `response.ok`** (exceto o caso `404` isolado em `buscarNotaPorValor`); em erro 4xx/5xx lançam implicitamente apenas ao parsear JSON, sem mensagem amigável.
- Não há função para inserir nota por aqui — a criação acontece indiretamente via `importarContasXML` em `contasService.ts` (que usa o endpoint `contas/import`).

## Uso

- Único consumidor no frontend: `src/components/NotasDoMes.tsx` (busca por período e exclusão de notas na tela de Contas a Pagar).