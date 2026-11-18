# `src/utils/medicineTableSearch.ts`

> Normalização, seleção de aba e busca local da tabela de medicamentos (planilha CMED).

## O que faz

- `normalizeHeader` remove acentos/não alfanuméricos; `hasMedicineTableHeaders` identifica a aba com substância/EAN/produto e as colunas PF/PMC da UF.
- `normalizeRows(rows, uf)` aceita os cabeçalhos legados em pt-BR da planilha CMED (`SUBSTÂNCIA`, `LABORATÓRIO`, `EAN 1`, `PRODUTO`, `APRESENTAÇÃO`, `CLASSE TERAPÊUTICA`) e guarda todas as colunas `pf*`/`pmc*` em `priceColumns`.
- `applyMedicineTableUf(rows, uf)` recalcula `pf205`/`pmc205` a partir de `priceColumns`, sem reenvio da planilha.
- `searchMedicineTableRows` mantém o scoring original (substância +100, EAN exato +50, contém +10, produto +2), até 200 linhas.

## Relações

- **Usa:** `src/services/medicineTableStore.ts` (`MedicineTableRow`, `MedicineTableUf`).
- **Usado por:** [useMedicineTable](../hooks/useMedicineTable.md).

## Notas

- Exceção intencional à ADR 0004: os aliases pt-BR permanecem porque a planilha oficial da CMED usa esses cabeçalhos; identificadores do código seguem em inglês.
- PE é a única UF configurada (`PF 20,5 %` / `PMC 20,5 %`); colunas `... ALC` não são confundidas com as de referência.
