export type DistributorRuleType = 'amount_adjustment' | 'name_override';

export interface DistributorRule {
  id: string;
  name: string;
  type: DistributorRuleType;
  value: number | string;
  enabled: boolean;
}

export interface DistributorConfig {
  id: string;
  name: string;
  taxId: string | null;
  aliases: string[];
  enabled: boolean;
  rules: DistributorRule[];
}

const MAX_DISTRIBUTORS = 100;
const MAX_RULES_PER_DISTRIBUTOR = 20;
const MAX_ALIASES = 30;

export const normalizeTaxId = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 11 || digits.length === 14) return digits;
  return null;
};

export const normalizeMatchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .trim();

export const normalizeDistributorConfig = (input: unknown): DistributorConfig[] | null => {
  if (!Array.isArray(input) || input.length > MAX_DISTRIBUTORS) return null;

  const distributorNames = new Set<string>();
  const distributors: DistributorConfig[] = [];

  for (const item of input) {
    if (!item || typeof item !== 'object') return null;

    const source = item as Record<string, unknown>;
    const id = String(source.id ?? '').trim();
    const name = String(source.name ?? '').trim();
    const taxId = normalizeTaxId(String(source.taxId ?? source.cnpj ?? source.cpfCnpj ?? '').trim());
    const aliases = Array.isArray(source.aliases)
      ? source.aliases.map((value) => String(value ?? '').trim()).filter(Boolean)
      : [];
    const enabled = typeof source.enabled === 'boolean' ? source.enabled : true;
    const rulesInput = Array.isArray(source.rules) ? source.rules : null;

    if (!/^[a-z0-9-]{1,100}$/i.test(id) || !name || name.length > 120) return null;
    const nameKey = name.toLocaleLowerCase('pt-BR');
    if (distributorNames.has(nameKey)) return null;
    distributorNames.add(nameKey);

    if (taxId && !/^\d{11}$|^\d{14}$/.test(taxId)) return null;

    const normalizedAliases = aliases.map(normalizeMatchText).filter(Boolean);
    if (new Set(normalizedAliases).size !== normalizedAliases.length) return null;
    if (normalizedAliases.length > MAX_ALIASES) return null;

    if (!rulesInput || rulesInput.length > MAX_RULES_PER_DISTRIBUTOR) return null;

    const rules: DistributorRule[] = [];

    for (const rawRule of rulesInput) {
      if (!rawRule || typeof rawRule !== 'object') return null;

      const ruleSource = rawRule as Record<string, unknown>;
      const ruleId = String(ruleSource.id ?? '').trim();
      const ruleName = String(ruleSource.name ?? '').trim();
      const type = ruleSource.type;
      const ruleEnabled = typeof ruleSource.enabled === 'boolean' ? ruleSource.enabled : true;

      if (!/^[a-z0-9-]{1,100}$/i.test(ruleId) || !ruleName || ruleName.length > 80) return null;
      if (type === 'amount_adjustment') {
        const amount = Number(ruleSource.value);
        if (!Number.isFinite(amount)) return null;
        rules.push({ id: ruleId, name: ruleName, type, value: amount, enabled: ruleEnabled });
        continue;
      }

      if (type === 'name_override') {
        const value = String(ruleSource.value ?? '').trim();
        if (!value || value.length > 120) return null;
        rules.push({ id: ruleId, name: ruleName, type, value, enabled: ruleEnabled });
        continue;
      }

      return null;
    }

    distributors.push({ id, name, taxId, aliases: normalizedAliases, enabled, rules });
  }

  return distributors;
};

export const findDistributor = (
  config: DistributorConfig[],
  emitter: string,
  emitterTaxId?: string | null
): DistributorConfig | null => {
  const normalizedTaxId = normalizeTaxId(emitterTaxId ?? '');

  if (normalizedTaxId) {
    const taxMatch = config.find((distributor) =>
      distributor.enabled && distributor.taxId === normalizedTaxId
    );
    if (taxMatch) return taxMatch;
  }
  const emitterKey = normalizeMatchText(emitter);
  if (!emitterKey) return null;

  const matches = config.filter((distributor) =>
    distributor.enabled
    && distributor.aliases.some((alias) => alias && emitterKey.includes(alias))
  );

  if (matches.length === 0) return null;
  return matches.length === 1
    ? matches[0]
    : matches.reduce((longest, current) => {
        const longestLength = Math.max(0, ...longest.aliases.map((alias) => alias.length));
        const currentLength = Math.max(0, ...current.aliases.map((alias) => alias.length));
        return currentLength > longestLength ? current : longest;
      });
};

export const applyDistributorRules = (
  distributor: DistributorConfig,
  amount: number
): { distributor: string; amount: number } => {
  let resultAmount = amount;
  let resultName = distributor.name;

  for (const rule of distributor.rules) {
    if (!rule.enabled) continue;

    if (rule.type === 'amount_adjustment') {
      resultAmount = Number((resultAmount + Number(rule.value)).toFixed(2));
      continue;
    }

    if (rule.type === 'name_override') {
      resultName = String(rule.value).trim();
    }
  }

  return { distributor: resultName, amount: Number(resultAmount.toFixed(2)) };
};
