# `src/components/payables/MissingDistributorModal.tsx`

> Modal aberto quando a importação XML identifica um emitente ainda não cadastrado em `distributor_config`.

## O que faz

- Exibe `emit.xNome` (nome bruto da distribuidora no XML) e pede escolha entre usar uma distribuidora existente ou criar uma nova no mesmo fluxo.
- `existing`: seletor com distribuidoras habilitadas já cadastradas; passa `distributorId` na requisição.
- `new`: campos `Nome` e `Identificadores`; passa `newDistributorName`/`newDistributorAliases` e o item é criado antes de importar.
- Ao concluir a importação, chama `onImported` com a quantidade de registros inseridos.

## Relações

- **Usa:** [AppModalShell](../common/AppModalShell.md), [payablesService](../../services/payablesService.md).
- **Usado por:** [Payables](../../pages/payables.md).

## Notas

- O XML não é relido do zero: o modal recebe o `xml` original em memória; nenhum arquivo adicional é enviado.
- Distribuidora criada manualmente com `rules: []`; administrador pode depois adicionar regras via `DistributorSettings`.
