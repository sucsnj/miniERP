import { listAllPayables, createPayable, listAllInvoices, createInvoice } from '../database/payablesRepository';
import { parseCurrency, parseNumber } from '../utils/number';
import { toDate } from '../utils/date';
import { parseStringPromise } from 'xml2js';
import { getCompanySettings, updateDistributorConfig } from '../database/settingsRepository';
import { applyDistributorRules, findDistributor, normalizeDistributorConfig, normalizeTaxId, type DistributorConfig, normalizeMatchText } from './../utils/distributors';
import type { AuthContext } from '../utils/serverAuth';

export interface PayablesImportOverride {
  distributorId?: string;
  newDistributorName?: string;
  newDistributorTaxId?: string;
  newDistributorAliases?: string[];
}

export interface PayablesImportResult {
  sucesso: boolean;
  registros: Array<{ supplierName: string; amount: number; dueDate: string; document: string }>;
}

const normalizeDocument = (document: string) =>
  document.replace(/[A-Z]/gi, (letter) => {
    const code = letter.toUpperCase().charCodeAt(0) - 64;
    return code.toString();
  });

export const processPayablesXml = async (
  xml: string,
  ctx: AuthContext,
  timezone: string,
  override: PayablesImportOverride = {},
) => {
  const parsed = await parseStringPromise(xml, { explicitArray: true });
  // Caminho correto dentro do XML
  const infNFe = parsed.nfeProc.NFe[0].infNFe[0];
  const rawDistributorName: string = infNFe.emit[0].xNome[0];
  const rawDistributorTaxId: string | null = infNFe.emit[0].CNPJ?.[0] ?? infNFe.emit[0].CPF?.[0] ?? null;
  const invoiceNumber: string = infNFe.ide[0].nNF[0];
  const duplicates: Array<{ vDup: string[]; dVenc: string[] }> = infNFe.cobr?.[0]?.dup ?? [];
  const issueDate: string = infNFe.ide[0].dhEmi[0];
  const invoiceTotal = infNFe.total[0].ICMSTot[0].vNF[0];
  const accessKey: string = parsed.nfeProc.protNFe[0].infProt[0].chNFe[0];

  const settings = await getCompanySettings(ctx);
  let distributorConfig = settings.distributorConfig;
  let distributor: DistributorConfig | null = null;

  if (override.newDistributorName) {
    const name = override.newDistributorName.trim();
    const aliases = override.newDistributorAliases?.map((alias) => alias.trim()).filter(Boolean) ?? [];
    const normalizedAliases = [name, ...(aliases ?? [])];
    const aliasKeys = new Set(normalizedAliases.map(normalizeMatchText));
    const overrideTaxId = normalizeTaxId(override.newDistributorTaxId ?? '');
    const xmlTaxId = normalizeTaxId(rawDistributorTaxId ?? '');
    const existing = distributorConfig.find((item) =>
      item.name.toLowerCase() === name.toLowerCase()
      || item.aliases.some((alias) => aliasKeys.has(alias))
      || (xmlTaxId !== null && item.taxIds.includes(xmlTaxId))
      || (overrideTaxId !== null && item.taxIds.includes(overrideTaxId))
    );

    if (existing) {
      distributor = existing;
    } else {
      const newDistributorTaxIds = [overrideTaxId, xmlTaxId, ...(override.newDistributorTaxId ? override.newDistributorTaxId.split(/[,;\n]/).map((value) => normalizeTaxId(value.trim())).filter((value): value is string => Boolean(value)) : [])]
        .filter((value): value is string => Boolean(value));
      const newDistributor: DistributorConfig = {
        id: crypto.randomUUID(),
        name,
        taxIds: [...new Set(newDistributorTaxIds)],
        aliases: normalizedAliases,
        enabled: true,
        rules: [],
      };
      const updatedConfig = normalizeDistributorConfig([...distributorConfig, newDistributor]);
      if (!updatedConfig) {
        return { error: 'Configuração de distribuidoras inválida.' as const };
      }
      await updateDistributorConfig(updatedConfig, ctx);
      distributorConfig = updatedConfig;
      distributor = updatedConfig.find((item) => item.id === newDistributor.id) ?? newDistributor;
    }
  } else if (override.distributorId) {
    distributor = distributorConfig.find((item) => item.id === override.distributorId) ?? null;
    if (!distributor) {
      return { error: 'Distribuidora não encontrada.' as const };
    }
  } else {
    distributor = findDistributor(distributorConfig, rawDistributorName, rawDistributorTaxId);
  }

  if (distributor) {
    const xmlTaxId = normalizeTaxId(rawDistributorTaxId ?? '');
    const overrideTaxIds = (override.newDistributorTaxId ?? '')
      .split(/[,;\n]/)
      .map((value) => normalizeTaxId(value.trim()))
      .filter((value): value is string => Boolean(value));
    const taxIds = [...distributor.taxIds];
    for (const taxId of [xmlTaxId, ...overrideTaxIds]) {
      if (taxId && !taxIds.includes(taxId) && !distributorConfig.some((item) => item.id !== distributor!.id && item.taxIds.includes(taxId))) {
        taxIds.push(taxId);
      }
    }

    const aliasKey = normalizeMatchText(rawDistributorName);
    const overrideAliases = (override.newDistributorAliases ?? []).map(normalizeMatchText).filter(Boolean);
    const aliases = [...distributor.aliases];
    for (const key of [aliasKey, ...overrideAliases]) {
      if (key && !aliases.includes(key)) {
        aliases.push(key);
      }
    }

    if (taxIds.length !== distributor.taxIds.length || aliases.length !== distributor.aliases.length) {
      const updatedConfig = normalizeDistributorConfig(
        distributorConfig.map((item) =>
          item.id === distributor!.id ? { ...item, taxIds, aliases } : item
        )
      );
      if (updatedConfig) {
        await updateDistributorConfig(updatedConfig, ctx);
        distributorConfig = updatedConfig;
        distributor = updatedConfig.find((item) => item.id === distributor!.id) ?? distributor;
      }
    }
  }

  if (!distributor) {
    return {
      error: 'Distribuidora não encontrada no XML.' as const,
      code: 'DISTRIBUTOR_NOT_FOUND' as const,
      xmlDistributorName: rawDistributorName,
      xmlDistributorTaxId: rawDistributorTaxId,
      availableDistributors: distributorConfig,
    };
  }

  const documentBase = normalizeDocument(invoiceNumber);
  const allAccounts = await listAllPayables(ctx);
  const existingAccounts = new Set(allAccounts.map((account) => `${account.supplierName}::${account.document}`));

  const records: PayablesImportResult['registros'] = [];

  for (let i = 0; i < duplicates.length; i++) {
    const validatedAmount = parseCurrency(String(duplicates[i].vDup[0])) ?? parseNumber(duplicates[i].vDup[0]);
    const validatedDueDate = toDate(duplicates[i].dVenc[0], timezone);
    const adjusted = applyDistributorRules(distributor, validatedAmount);
    const documentNumber = `${documentBase}${i + 1}`;

    if (existingAccounts.has(`${adjusted.distributor}::${documentNumber}`)) {
      continue;
    }

    const dueDate = validatedDueDate ? validatedDueDate.toISOString().split('T')[0] : duplicates[i].dVenc[0];
    await createPayable({ supplierName: adjusted.distributor, amount: adjusted.amount, dueDate, document: documentNumber }, ctx);
    existingAccounts.add(`${adjusted.distributor}::${documentNumber}`);

    records.push({
      supplierName: adjusted.distributor,
      amount: adjusted.amount,
      dueDate,
      document: documentNumber,
    });
  }

  let invoiceInserted = false;
  const allInvoices = await listAllInvoices(ctx);
  const existingInvoice = allInvoices.find((invoice) => invoice.accessKey === accessKey);

  if (existingInvoice) {
    if (records.length > 0) {
      return { sucesso: true, registros: records } as const;
    }
    return { error: 'Nota e duplicata(s) já existentes' as const };
  }

  try {
    await createInvoice({ supplierName: distributor.name, accessKey, issueDate, amount: parseCurrency(String(invoiceTotal)) ?? parseNumber(String(invoiceTotal)) }, ctx);
    invoiceInserted = true;
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : '';
    if (code !== '23505') throw error;
    // Nota já existia (mesma empresa ou corrida): não é erro fatal.
  }

  if (invoiceInserted || records.length > 0) {
    return { sucesso: true, registros: records } as const;
  }
  return { error: 'Nota e duplicata(s) já existentes' as const };
};
