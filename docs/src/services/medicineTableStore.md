# `src/services/medicineTableStore.ts`

> Persistência local da tabela de medicamentos e da UF de referência em IndexedDB.

## O que faz

- `loadMedicineTableSnapshot()` / `saveMedicineTableSnapshot(rows)`: snapshot com `rowCount`, `updatedAt` e linhas; cada linha pode incluir `priceColumns` (todas as colunas `pf*`/`pmc*` normalizadas).
- `loadMedicineTableUf()` / `saveMedicineTableUf(uf)`: guardam a UF escolhida na store do snapshot (chave `settings:uf`); padrão `PE`.
- Histórico de buscas: até 60 itens/30 dias; `clearMedicineTableHistory()` limpa.

## Relações

- **Usado por:** [useMedicineTable](../hooks/useMedicineTable.md) e [medicineTableSearch](../utils/medicineTableSearch.md).

## Notas

- `saveMedicineTableSnapshot` limpa o histórico: resultados ficam inválidos quando a planilha ou a UF muda.
- Sem Supabase: cada navegador/dispositivo mantém seu próprio snapshot e UF.
