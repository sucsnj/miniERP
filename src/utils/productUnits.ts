/**
 * src/utils/productUnits.ts
 *
 * Regras puras das unidades de medida do formulário de produto
 * (seleção de isPrincipal, atualização e remoção com sincronização dos
 * campos "resumo" unitOfMeasureId/unitMultiplier).
 * Extraídas dos handlers inline de `ProductForm` (ver docs).
 */

export interface UnitOfMeasureRow {
  unitOfMeasureId: number;
  unitMultiplier: string;
  isPrincipal: boolean;
}

/** Resultado de uma operação sobre a lista de unidades de medida. */
export interface UnitChangeResult {
  units: UnitOfMeasureRow[];
  /** Sync de `unitOfMeasureId` quando a unidade alterada é a isPrincipal. */
  unitOfMeasureId?: number;
  /** Sync de `unitMultiplier` quando a unidade alterada é a isPrincipal. */
  unitMultiplier?: string;
}

/** Resultado da seleção de unidade isPrincipal (sempre sincroniza os campos de resumo). */
export interface PrincipalUnitChangeResult {
  units: UnitOfMeasureRow[];
  unitOfMeasureId: number;
  unitMultiplier: string;
}

/** Marca a unidade `index` como isPrincipal (as demais deixam de ser). */
export function setUnitAsPrincipal(
  units: UnitOfMeasureRow[],
  index: number
): PrincipalUnitChangeResult {
  const next = units.map((unit) => ({ ...unit, isPrincipal: false }));
  next[index] = { ...next[index], isPrincipal: true };
  return {
    units: next,
    unitOfMeasureId: next[index].unitOfMeasureId,
    unitMultiplier: next[index].unitMultiplier,
  };
}

/** Atualiza o id da unidade `index` (sincroniza se for a isPrincipal). */
export function updateUnitId(
  units: UnitOfMeasureRow[],
  index: number,
  unitOfMeasureId: number
): UnitChangeResult {
  const next = [...units];
  next[index] = { ...next[index], unitOfMeasureId: unitOfMeasureId };
  const result: UnitChangeResult = { units: next };
  if (units[index].isPrincipal) {
    result.unitOfMeasureId = unitOfMeasureId;
  }
  return result;
}

/** Atualiza o multiplicador da unidade `index` (sincroniza se for a isPrincipal). */
export function updateUnitMultiplier(
  units: UnitOfMeasureRow[],
  index: number,
  unitMultiplier: string
): UnitChangeResult {
  const next = [...units];
  next[index] = { ...next[index], unitMultiplier: unitMultiplier };
  const result: UnitChangeResult = { units: next };
  if (units[index].isPrincipal) {
    result.unitMultiplier = unitMultiplier;
  }
  return result;
}

/** Remove a unidade `index`; se era a isPrincipal, a primeira restante assume. */
export function removeUnit(
  units: UnitOfMeasureRow[],
  index: number
): UnitChangeResult {
  const next = units.filter((_, i) => i !== index);
  const result: UnitChangeResult = { units: next };
  if (units[index]?.isPrincipal && next.length > 0) {
    next[0] = { ...next[0], isPrincipal: true };
    result.unitOfMeasureId = next[0].unitOfMeasureId;
    result.unitMultiplier = next[0].unitMultiplier;
  }
  return result;
}

/** Adiciona uma nova unidade (default `unitOfMeasureId: 1`, fator `1`). */
export function addUnit(units: UnitOfMeasureRow[]): UnitOfMeasureRow[] {
  return [
    ...units,
    { unitOfMeasureId: 1, unitMultiplier: '1', isPrincipal: units.length === 0 },
  ];
}