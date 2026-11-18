import {
  DEFAULT_MEDICINE_TABLE_UF,
  type MedicineTableRow,
  type MedicineTableUf,
} from '../services/medicineTableStore';

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

interface MedicineTableUfConfig {
  code: MedicineTableUf;
  label: string;
  pfColumn: string;
  pmcColumn: string;
  pfLabel: string;
  pmcLabel: string;
}

export const MEDICINE_TABLE_UF_OPTIONS: MedicineTableUfConfig[] = [
  {
    code: 'PE',
    label: 'Pernambuco',
    pfColumn: 'pf205',
    pmcColumn: 'pmc205',
    pfLabel: 'PF 20,5 %',
    pmcLabel: 'PMC 20,5 %',
  },
];

export const getMedicineTableUfConfig = (uf: MedicineTableUf): MedicineTableUfConfig =>
  MEDICINE_TABLE_UF_OPTIONS.find((option) => option.code === uf) ?? MEDICINE_TABLE_UF_OPTIONS[0];

const readText = (row: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
};

const SUBSTANCE_HEADERS = ['substancia', 'substancia1', 'substance', 'substance1'];
const EAN_HEADERS = ['ean1', 'ean'];
const PRODUCT_HEADERS = ['produto', 'product'];

export const hasMedicineTableHeaders = (headers: string[], uf: MedicineTableUf): boolean => {
  const normalized = new Set(headers.map(normalizeHeader));
  const config = getMedicineTableUfConfig(uf);
  const hasAny = (candidates: string[]) => candidates.some((candidate) => normalized.has(candidate));

  return (
    hasAny(SUBSTANCE_HEADERS) &&
    hasAny(EAN_HEADERS) &&
    hasAny(PRODUCT_HEADERS) &&
    normalized.has(config.pfColumn) &&
    normalized.has(config.pmcColumn)
  );
};

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

export const normalizeRows = (
  rows: Record<string, unknown>[],
  uf: MedicineTableUf = DEFAULT_MEDICINE_TABLE_UF
): MedicineTableRow[] => {
  const config = getMedicineTableUfConfig(uf);

  return rows
    .map((rawRow) => {
      const row: Record<string, unknown> = {};

      Object.entries(rawRow).forEach(([key, value]) => {
        row[normalizeHeader(key)] = value;
      });

      const priceColumns: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        if (!key.startsWith('pf') && !key.startsWith('pmc')) return;
        const parsed = parseNumberValue(value);
        priceColumns[key] = parsed !== null ? String(parsed) : String(value ?? '').trim();
      });

      return {
        substance: readText(row, SUBSTANCE_HEADERS),
        laboratory: readText(row, ['laboratorio', 'laboratory']),
        ean: readText(row, EAN_HEADERS),
        product: readText(row, PRODUCT_HEADERS),
        presentation: readText(row, ['apresentacao', 'presentation']),
        therapeuticClass: readText(row, ['classeterapeutica', 'therapeuticclass']),
        pf205: priceColumns[config.pfColumn] ?? '',
        pmc205: priceColumns[config.pmcColumn] ?? '',
        priceColumns,
      };
    })
    .filter((row) => row.substance || row.product || row.ean);
};

export const applyMedicineTableUf = (
  rows: MedicineTableRow[],
  uf: MedicineTableUf
): MedicineTableRow[] => {
  const config = getMedicineTableUfConfig(uf);

  return rows.map((row) => ({
    ...row,
    pf205: row.priceColumns?.[config.pfColumn] ?? row.pf205,
    pmc205: row.priceColumns?.[config.pmcColumn] ?? row.pmc205,
  }));
};

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
