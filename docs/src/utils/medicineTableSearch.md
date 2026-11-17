# `src/utils/medicineTableSearch.ts`

> Normalização e busca local na tabela de medicamentos.

## O que faz

- `normalizeRows(rows)`: normaliza cabeçalhos/valores (`substance`, `laboratory`, `ean`, `product`, `presentation`, `therapeuticClass`, `pf205`, `pmc205`).
- `normalizeText(value)` / `normalizeHeader(header)`: mesmas regras da rota anterior (remover acentos, preservar `a-z0-9`).
- `searchMedicineTableRows(query, rows)`: scoring compatível (`substance +100`, `ean exact +50`, `contains +10`, `product +2`); retorna até 200 linhas ordenadas por score/substância.

```ts
interface MedicineTableRow {
  substance: string; laboratory: string; ean: string; product: string; presentation: string; therapeuticClass: string; pf205: string; pmc205: string;
}
```

## Relações

- **Usado por:** [useMedicineTable](../hooks/useMedicineTable.md).

## Notas

- Busca roda no cliente; não há chamada a `/api/medicine-table`.
