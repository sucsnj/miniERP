# `src/pages/medicine-table.tsx (legacy docs)`

> Documento desativado/atualizado; a implementação atual é documentada no espelho `docs/src/pages/medicine-table.md`.

## O que faz

- Upload de planilha XLS/XLSX, busca na tabela e histórico totalmente locais no IndexedDB.
- Veja: [docs/src/pages/medicine-table.md](../src/pages/medicine-table.md).

## Relações

- Página atual e [medicineTableStore](../src/services/medicineTableStore.md).

## Notas

- A retenção local é de 60 buscas/30 dias.
- Limpar dados do site exige enviar a planilha novamente.
