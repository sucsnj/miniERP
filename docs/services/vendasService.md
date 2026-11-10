# `src/services/vendasService.ts`

## Descrição

Camada de serviço cliente (fetch) para o módulo de vendas: CRUD de vendas, itens, consolidação mensal e backup.

## Responsabilidades

- Registrar venda (e itens) via `POST /api/vendas`.
- Buscar vendas do mês, com filtro de valor.
- Atualizar e excluir vendas.
- Ler itens de uma venda (`GET /api/venda-itens`).
- Consultar/consolidar totais mensais.
- Auto-consolidar o mês anterior.
- Disparar backup.

## Funções Principais

- `registrarVenda(data, valor, observacoes?, itens?)` → `POST /api/vendas`; `.json()`.
- `registrarVendaComCriadoEm(data, valor, observacoes?, criado_em?)` → `POST /api/vendas` (importação via XLSX).
- `buscarVendasDiarias(mes, ano, filtro: 'positivas'|'negativas'|'todas')` → `GET /api/vendas?mes=..&ano=..&filtro=..`; retorna `VendaDiaria[]`.
- `atualizarVenda(id, data, valor, observacoes?, itens?)` → `PUT /api/vendas`.
- `buscarVendaItens(vendaId)` → `GET /api/venda-itens?vendaId=..`; retorna `[]` se a resposta não for `ok`.
- `excluirVenda(id)` → `DELETE /api/vendas`.
- `buscarTotalMensal(mes, ano)` → `GET /api/mensais?mes=..&ano=..`; retorna `VendaMensal | null`.
- `buscarTodosMensais()` → `GET /api/mensais`; `VendaMensal[]`.
- `consolidarMensal(mes, ano)` → `POST /api/mensais`.
- `verificarConsolidado(mes, ano): Promise<boolean>` → GET /api/mensais; `true` se existir `total` definido; trata respostas vazias.
- `autoConsolidar()` → no dia 03 consolida o mês anterior; se o mês anterior ainda não estiver consolidado e `dia > 2`, consolida.
- `excluirMensal(id)` → `DELETE /api/mensais`.
- `fazerBackup()` → `POST /api/backup`.

## Tipos

- `VendaDiaria` — `{ id, data, valor, observacoes?, criado_em }`.
- `VendaItemData` — `{ id, venda_id, item_id?, tipo: 'PRODUTO'|'SERVICO', nome, quantidade, preco_unitario, subtotal, codigo_interno?, referencia?, criado_em }`.
- `VendaMensal` — métricas mensais (`ticketMedio`, `mediaClientes`, `melhorDia`, `maiorVenda`, `qtdVendas`, `total`, `totalEsp` etc.).

## Dependências

- API interna `/api/vendas`, `/api/venda-itens`, `/api/mensais`, `/api/backup`.
- `getDateArray` de `src/utils/date`.

## Observações

- Não há tratamento de erro no lado do serviço: a maioria das funções chama `.json()` direto e propaga o que a API retornar.
- `autoConsolidar` usa a flag local `consolidado` para evitar consolidações repetidas na mesma sessão.