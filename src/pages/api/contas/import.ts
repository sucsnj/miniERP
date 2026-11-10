import type { NextApiRequest, NextApiResponse } from 'next';
import { insertAccount, getAllAccounts } from '../../../database/contasDb';
import { getAllInvoices, insertInvoice } from '../../../database/notasDb';
import parseNumber, { parseCurrency } from '../../../utils/number';
import { toDate } from '../../../utils/date';
import { parseStringPromise } from 'xml2js';

// Nomes de distribuidoras válidos
const validNames = [
  'acripel', 'cimed', 'profarma', 'g1', 'nova',
  'unilever', 'aujo', 'f&f', 'nds', 'mbca', 'plena', 'total', 'pro'
];

// Funções auxiliares para formatar e normalizar dados
const formatDistributor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('f&f')) return 'FF';
  const foundName = validNames.find(n => lower.includes(n));
  if (foundName) {
    return foundName.charAt(0).toUpperCase() + foundName.slice(1);
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Funções auxiliares para ajustar valores por distribuidora
const adjustAmountByDistributor = (name: string, amount: number) => {
  if (name.toLowerCase() === 'cimed') return amount + 3.99;
  if (name.toLowerCase() === 'pro') return amount + 1.39;
  if (name.toLowerCase() === 'profarma') return amount + 1.39;
  return amount;
};

// Funções auxiliares para normalizar documentos
const normalizeDocument = (document: string) => {
  return document.replace(/[A-Z]/gi, (letter) => {
    const code = letter.toUpperCase().charCodeAt(0) - 64; // A=1
    return code.toString();
  });
};

// Função principal do endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { xml } = req.body;
    if (!xml) {
      return res.status(400).json({ error: 'Arquivo XML não fornecido' });
    }

    const parsed = await parseStringPromise(xml, { explicitArray: true });

    // Caminho correto dentro do XML
    const infNFe = parsed.nfeProc.NFe[0].infNFe[0];
    const rawDistributorName = infNFe.emit[0].xNome[0];
    const invoiceNumber = infNFe.ide[0].nNF[0];
    const duplicates = infNFe.cobr?.[0]?.dup ?? []; // caso não exista duplicatas, retorna []
    // const duplicateItems = infNFe.cobr[0].dup;

    const issueDate = infNFe.ide[0].dhEmi[0]; // emissão
    // const vPag = infNFe.cobr[0].fat[0].vOrig[0]; // total
    const invoiceTotal = infNFe.total[0].ICMSTot[0].vNF[0]; // total
    const accessKey = parsed.nfeProc.protNFe[0].infProt[0].chNFe[0]; // chave

    let distributor = formatDistributor(rawDistributorName);
    const documentBase = normalizeDocument(invoiceNumber);

    const records: { distribuidora: string; valor: number; vencimento: string; documento: string }[] = [];

    for (let i = 0; i < duplicates.length; i++) {
      let amount = parseNumber(duplicates[i].vDup[0]);
      let dueDate = duplicates[i].dVenc[0];

      // valida e normaliza valores e datas
      const validatedAmount = parseCurrency(String(duplicates[i].vDup[0])) ?? amount;
      const validatedDueDate = toDate(dueDate);

      amount = adjustAmountByDistributor(distributor, validatedAmount);
      dueDate = validatedDueDate ? validatedDueDate.toISOString().split('T')[0] : dueDate;
      const documentNumber = `${documentBase}${i + 1}`;

      // se for distribuidora for igual a 'Distribuidora de medicamentos ltda', muda para 'Mbca'
      if (distributor.toLowerCase() === 'distribuidora de medicamentos ltda') {
        distributor = 'Mbca';
      }

      const allAccounts = getAllAccounts();
      // se já existir uma conta com a mesma distribuidora e documento, pule para a próxima
      const duplicateAccount = allAccounts.find(c => c.distribuidora === distributor && c.documento === documentNumber);
      if (duplicateAccount) {
        continue; // pula pra proxima duplicata
      }

      insertAccount(distributor, amount, dueDate, documentNumber);

      records.push({ distribuidora: distributor, valor: amount, vencimento: dueDate, documento: documentNumber });
    }

    // flag para saber se alguma nota foi inserida
    let invoiceInserted = false;

    // se já existir uma nota com a mesma chave
    const allInvoices = getAllInvoices();
    const existingInvoice = allInvoices.find(n => n.chave === accessKey);

    if (existingInvoice) {
      if (records.length > 0) {
        // houve duplicatas novas
        return res.status(200).json({ sucesso: true, registros: records });
      } else {
        // nenhuma duplicata nova e nota já existe
        return res.status(400).json({ error: 'Nota e duplicata(s) já existentes' });
      }
    } else {
      // adiciona nota
      insertInvoice(distributor, accessKey, issueDate, invoiceTotal);
      invoiceInserted = true;
    }

    // se chegou aqui, ou inseriu nota ou duplicatas
    if (invoiceInserted || records.length > 0) {
      return res.status(200).json({ sucesso: true, registros: records });
    } else {
      return res.status(400).json({ error: 'Nada foi inserido' });
    }

  } catch (error) {
    console.error('Erro ao importar XML:', error);
    return res.status(500).json({ error: 'Erro interno ao processar XML' });
  }
}
