/**
 * src/utils/productUnits.ts
 *
 * Regras puras das unidades de medida do formulário de product
 * (seleção de isMain, atualização e remoção com sincronização dos
 * campos "resumo" unitOfMeasureId/unitMultiplier).
 * Extraídas dos handlers inline de `ProductForm` (ver docs).
 */

export interface UnitOfMeasureRow {
  unitOfMeasureId: string;
  unitMultiplier: string;
  isMain: boolean;
}

/** Resultado de uma operação sobre a lista de unidades de medida. */
export interface UnitChangeResult {
  units: UnitOfMeasureRow[];
  /** Sync de `unitOfMeasureId` quando a unit alterada é a isMain. */
  unitOfMeasureId?: string;
  /** Sync de `unitMultiplier` quando a unit alterada é a isMain. */
  unitMultiplier?: string;
}

/** Resultado da seleção de unit isMain (sempre sincroniza os campos de resumo). */
export interface PrincipalUnitChangeResult {
  units: UnitOfMeasureRow[];
  unitOfMeasureId: string;
  unitMultiplier: string;
}

/** Marca a unit `index` como isMain (as demais deixam de ser). */
export function setUnitAsPrincipal(
  units: UnitOfMeasureRow[],
  index: number
): PrincipalUnitChangeResult {
  const next = units.map((unit) => ({ ...unit, isMain: false }));
  next[index] = { ...next[index], isMain: true };
  return {
    units: next,
    unitOfMeasureId: next[index].unitOfMeasureId,
    unitMultiplier: next[index].unitMultiplier,
  };
}

/** Atualiza o id da unit `index` (sincroniza se for a isMain). */
export function updateUnitId(
  units: UnitOfMeasureRow[],
  index: number,
  unitOfMeasureId: string
): UnitChangeResult {
  const next = [...units];
  next[index] = { ...next[index], unitOfMeasureId: unitOfMeasureId };
  const result: UnitChangeResult = { units: next };
  if (units[index].isMain) {
    result.unitOfMeasureId = unitOfMeasureId;
  }
  return result;
}

/** Atualiza o multiplicador da unit `index` (sincroniza se for a isMain). */
export function updateUnitMultiplier(
  units: UnitOfMeasureRow[],
  index: number,
  unitMultiplier: string
): UnitChangeResult {
  const next = [...units];
  next[index] = { ...next[index], unitMultiplier: unitMultiplier };
  const result: UnitChangeResult = { units: next };
  if (units[index].isMain) {
    result.unitMultiplier = unitMultiplier;
  }
  return result;
}

/** Remove a unit `index`; se era a isMain, a primeira restante assume. */
export function removeUnit(
  units: UnitOfMeasureRow[],
  index: number
): UnitChangeResult {
  const next = units.filter((_, i) => i !== index);
  const result: UnitChangeResult = { units: next };
  if (units[index]?.isMain && next.length > 0) {
    next[0] = { ...next[0], isMain: true };
    result.unitOfMeasureId = next[0].unitOfMeasureId;
    result.unitMultiplier = next[0].unitMultiplier;
  }
  return result;
}

/** Adiciona uma nova unit (default `unitOfMeasureId: 1`, fator `1`). */
export function addUnit(units: UnitOfMeasureRow[]): UnitOfMeasureRow[] {
  return [
    ...units,
    { unitOfMeasureId: '', unitMultiplier: '1', isMain: units.length === 0 },
  ];
}