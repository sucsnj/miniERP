# `src/database/medicine-tableDb.ts`

> Documento obsoleto; a tabela de medicamentos não usa banco Supabase/tabela `medicine_table_rows`.

## O que faz

Nada persistido em banco. Snapshot e histórico da tabela ficam no IndexedDB do navegador.

## Relações

- Use: [medicineTableStore.md](../src/services/medicineTableStore.md)
- Use: [medicineTableSearch.md](../src/utils/medicineTableSearch.md)

## Notas

- Histórico legado de `db/medicine-table.db` e Supabase não são migrados; cada dispositivo refaz upload da planilha após limpar o site.
