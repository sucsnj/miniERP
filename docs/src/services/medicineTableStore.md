# `src/services/medicineTableStore.ts`

> Persistência local da tabela de medicamentos em IndexedDB.

## O que faz

- `loadMedicineTableSnapshot()`: retorna o snapshot atual (linhas normalizadas).
- `saveMedicineTableSnapshot(rows)`: grava snapshot `current` e limpa histórico antigo.
- `listMedicineTableHistory()`: histórico de buscas (até 60, máx. 30 dias), com resultados.
- `saveMedicineTableHistory(item)`: registra busca limitada pela política.
- `clearMedicineTableHistory()`: limpa histórico.

## Relações

- **Usado por:** [useMedicineTable](../hooks/useMedicineTable.md) e [utils](../utils/medicineTableSearch.md).

## Notas

- Armazena dados da planilha localmente; tolera tabelas grandes que App `localStorage` não sustentaria.
- Não há persistência no Supabase; cada dispositivo mantém seu snapshot.
