# `src/services/contasService.ts`

## Descrição

Cliente HTTP **fetch** para o domínio de contas a pagar. Todos os endpoints são internos (`/api/contas*`). As funções retornam `response.json()` sem lançar erro — a **página** verifica `error`/`message` no retorno.

## Tipo

```ts
export interface ContaDetalhe {
  id: number;
  distribuidora: string;
  valor: number;
  vencimento: string;                 // 'YYYY-MM-DD'
  documento: string;
  status: 'Pendente' | 'Pago';
  banco_observacoes?: string;
  criado_em?: string;
}
```

## Funções

```ts
registrarConta(distribuidora, valor, vencimento, documento, bancoObservacoes?)  // POST /api/contas
importarContasXML(xml)                                                          // POST /api/contas/import
buscarContas(ano: number, mes?: number): Promise<ContaDetalhe[]>                // GET /api/contas?ano=&mes=
pagarConta(id)                                                                  // POST /api/contas {action:'pagar', id}
cancelarPagamentoConta(id)                                                      // POST /api/contas {action:'cancelar', id}
atualizarConta(id, distribuidora, valor, vencimento, documento, bancoObservacoes?) // PUT /api/contas
excluirConta(id)                                                                // DELETE /api/contas {id}
fazerBackupContas()                                                             // POST /api/contas/backup
```

## Observações

- `buscarContas` monta a query string; `mes` é omitido quando não informado.
- Pagar/cancelar usam `POST` com `action` no mesmo endpoint (não há rota REST dedicada).
- Não valida `ok`/status HTTP — por isso a página checa `response.error`/`response.message` (ex.: duplicidade de distribuidora+documento retornada pela API).