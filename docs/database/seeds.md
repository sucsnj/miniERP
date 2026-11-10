# `src/database/seeds.ts`

## Descrição

Constantes de **dados iniciais (seeders)** usadas pelo módulo de catálogo `src/database/produtosDb.ts` para popular, na primeira inicialização, tabelas de cadastro auxiliar do banco `db/produtos.db`.

## Constantes exportadas

```ts
seedUoms: { sigla: string; descricao: string }[]          // 21 unidades de medida, de 'UN' a 'SR' (Serviço) id 21
seedCategorias: { nome: string; descricao: string }[]     // [{ nome: 'Geral', descricao: 'Categoria padrão' }]
seedMarcas: { nome: string }[]                             // [{ nome: 'Outros' }]
seedFornecedores: { nome: string }[]                       // [{ nome: 'Sem fornecedor' }]
```

- Lista completa de `seedUoms`: UN, DZ, PR, KG, G, MG, MCG, L, ML, MT, CX, PC, SM, TU, RL, CD, CJ, FG, LT, PK, SR.

## Comportamentos

- O `seed` roda em `produtosDb.ts` dentro de um loop que coexiste com a criação das tabelas, e não cria registros duplicados a cada execução (itens inseridos apenas quando ausentes / contagem zerada).
- `seedUoms` também é usado como **lista protegida**: siglas presentes em `seedUoms` não podem ser atualizadas nem excluídas pela API de unidades de medida (checagem por igualdade da sigla).

## Observações

- Módulo **sem lógica de execução própria** — só exporta constantes; o "quando roda" é decidido por quem importa (`produtosDb.ts`).
- `SR (Serviço)` é o último item e o comentário no código indica que equivale à linha de id 21 na tabela.
- Não há seed idempotente em outros bancos (`vendas.db`, `contas.db`, `notas.db`, `tabela.db` ficam vazios até uso).