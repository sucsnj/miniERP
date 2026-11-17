import type { MedicineTableRow } from '../services/medicineTableStore';

export const normalizeText = (value: string) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

export const normalizeHeader = (header: string) =>
  header
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

const parseNumberValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value)
    .trim()
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const number = Number(text);

  return Number.isNaN(number) ? null : number;
};

export const normalizeRows = (rows: Record<string, unknown>[]): MedicineTableRow[] =>
  rows
    .map((rawRow) => {
      const row: Record<string, unknown> = {};

      Object.entries(rawRow).forEach(([key, value]) => {
        row[normalizeHeader(key)] = value;
      });

      const pfValue = parseNumberValue(
        row.pf205 ?? row['pf205'] ?? row['pf205%'] ?? row['pf205percent'] ?? row['pf20_5'] ?? row['pf20,5'] ?? ''
      );
      const pmcValue = parseNumberValue(
        row.pmc205 ?? row['pmc205'] ?? row['pmc205%'] ?? row['pmc20,5'] ?? ''
      );

      return {
        substance: String(row.substance || row.substance1 || row['substância'] || '').trim(),
        laboratory: String(row.laboratory || '').trim(),
        ean: String(row.ean1 || row.ean || '').trim(),
        product: String(row.product || '').trim(),
        presentation: String(row.presentation || '').trim(),
        therapeuticClass: String(row.classeterapeutica || row['classe terapeutica'] || '').trim(),
        pf205: pfValue !== null ? String(pfValue).trim() : String(row.pf205 ?? row['pf205'] ?? row['pf205%'] ?? row['pf205percent'] ?? row['pf20_5'] ?? row['pf20,5'] ?? '').trim(),
        pmc205: pmcValue !== null ? String(pmcValue).trim() : String(row.pmc205 ?? row['pmc205'] ?? row['pmc205%'] ?? row['pmc20,5'] ?? '').trim(),
      };
    })
    .filter((row) => row.substance || row.product || row.ean);

export const searchMedicineTableRows = (
  query: string,
  rows: MedicineTableRow[]
): MedicineTableRow[] => {
  const normalizedQuery = normalizeText(query);
  const rawQuery = query.toLowerCase();

  return rows
    .map((row) => {
      const searchText = normalizeText(
        `${row.substance} ${row.laboratory} ${row.ean} ${row.product} ${row.presentation} ${row.therapeuticClass} ${row.pf205} ${row.pmc205}`
      );
      const substanceText = normalizeText(row.substance);
      const exactEan = normalizeText(row.ean) === normalizedQuery;
      const containsMatch = searchText.includes(normalizedQuery);

      if (!containsMatch && !exactEan) {
        return null;
      }

      let score = 0;
      if (substanceText.includes(normalizedQuery)) score += 100;
      if (exactEan) score += 50;
      if (containsMatch) score += 10;
      if (row.product.toLowerCase().includes(rawQuery)) score += 2;

      return { row, score };
    })
    .filter((item): item is { row: MedicineTableRow; score: number } => item !== null)
    .sort((a, b) => b.score - a.score || a.row.substance.localeCompare(b.row.substance, 'pt-BR'))
    .map((item) => item.row);
};
