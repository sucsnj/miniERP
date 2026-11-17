# `src/hooks/useMedicineTable.ts`

> Hook da tabela de medicamentos: upload, status e histórico totalmente locais em IndexedDB.

## O que faz

- Carrega snapshot/status e histórico do IndexedDB no mount, sem serviço HTTP/Supabase.
- `upload`: recebe `File` XLSX/XLS, faz parse (`xlsx`) e salva snapshot; limpa histórico antigo ao substituir a planilha.
- `search`: busca com `searchMedicineTableRows`; se o termo já está no histórico, retorna resultados cacheados (`source: 'history'`).
- `clearHistory`: apaga histórico local.

## Relações

- **Usa:** `src/services/medicineTableStore.ts`, `src/utils/medicineTableSearch.ts`.
- **Usado por:** [medicine-table](../pages/medicine-table.md).

## Notas

- Snapshot/histórico são por navegador/usuário local, não sincronizados entre dispositivos. Limpar o site apaga tudo.
- `status` reporta `loaded`/`rowCount` a partir do snapshot local.
