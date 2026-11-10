import type { NextApiRequest, NextApiResponse } from 'next';
import { insertConta, getAllContas } from '../../../database/contasDb';
import { getAllNotas, insertNota } from '../../../database/notasDb';
import parseNumber, { parseCurrency } from '../../../utils/number';
import { toDate } from '../../../utils/date';
import { parseStringPromise } from 'xml2js';

// Nomes de distribuidoras válidos
const nomesValidos = [
  'acripel', 'cimed', 'profarma', 'g1', 'nova',
  'unilever', 'aujo', 'f&f', 'nds', 'mbca', 'plena', 'total', 'pro'
];

// Funções auxiliares para formatar e normalizar dados
const formatarDistribuidora = (nome: string) => {
  const lower = nome.toLowerCase();
  if (lower.includes('f&f')) return 'FF';
  const encontrado = nomesValidos.find(n => lower.includes(n));
  if (encontrado) {
    return encontrado.charAt(0).toUpperCase() + encontrado.slice(1);
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Funções auxiliares para ajustar valores por distribuidora
const ajustarValorPorDistribuidora = (nome: string, valor: number) => {
  if (nome.toLowerCase() === 'cimed') return valor + 3.99;
  if (nome.toLowerCase() === 'pro') return valor + 1.39;
  if (nome.toLowerCase() === 'profarma') return valor + 1.39;
  return valor;
};

// Funções auxiliares para normalizar documentos
const normalizarDocumento = (doc: string) => {
  return doc.replace(/[A-Z]/gi, (letra) => {
    const code = letra.toUpperCase().charCodeAt(0) - 64; // A=1
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
    const distribuidoraRaw = infNFe.emit[0].xNome[0];
    const nNF = infNFe.ide[0].nNF[0];
    const duplicatas = infNFe.cobr?.[0]?.dup ?? []; // caso não exista duplicatas, retorna []
    // const duplicatas = infNFe.cobr[0].dup;

    const dataEmissao = infNFe.ide[0].dhEmi[0]; // emissão
    // const vPag = infNFe.cobr[0].fat[0].vOrig[0]; // total
    const vNF = infNFe.total[0].ICMSTot[0].vNF[0]; // total
    const chave = parsed.nfeProc.protNFe[0].infProt[0].chNFe[0]; // chave

    let distribuidora = formatarDistribuidora(distribuidoraRaw);
    const documentoBase = normalizarDocumento(nNF);

    const registros: { distribuidora: string; valor: number; vencimento: string; documento: string }[] = [];

    for (let i = 0; i < duplicatas.length; i++) {
      let valor = parseNumber(duplicatas[i].vDup[0]);
      let vencimento = duplicatas[i].dVenc[0];

      // valida e normaliza valores e datas
      const validatedValor = parseCurrency(String(duplicatas[i].vDup[0])) ?? valor;
      const validatedVencimento = toDate(vencimento);

      valor = ajustarValorPorDistribuidora(distribuidora, validatedValor);
      vencimento = validatedVencimento ? validatedVencimento.toISOString().split('T')[0] : vencimento;
      const documento = `${documentoBase}${i + 1}`;

      // se for distribuidora for igual a 'Distribuidora de medicamentos ltda', muda para 'Mbca'
      if (distribuidora.toLowerCase() === 'distribuidora de medicamentos ltda') {
        distribuidora = 'Mbca';
      }

      const todasContas = getAllContas();
      // se já existir uma conta com a mesma distribuidora e documento, pule para a próxima
      const contaExistente = todasContas.find(c => c.distribuidora === distribuidora && c.documento === documento);
      if (contaExistente) {
        continue; // pula pra proxima duplicata
      }

      insertConta(distribuidora, valor, vencimento, documento);

      registros.push({ distribuidora, valor, vencimento, documento });
    }

    // flag para saber se alguma nota foi inserida
    let notaInserida = false;

    // se já existir uma nota com a mesma chave
    const todasNotas = getAllNotas();
    const notaExistente = todasNotas.find(n => n.chave === chave);

    if (notaExistente) {
      if (registros.length > 0) {
        // houve duplicatas novas
        return res.status(200).json({ sucesso: true, registros });
      } else {
        // nenhuma duplicata nova e nota já existe
        return res.status(400).json({ error: 'Nota e duplicata(s) já existentes' });
      }
    } else {
      // adiciona nota
      insertNota(distribuidora, chave, dataEmissao, vNF);
      notaInserida = true;
    }

    // se chegou aqui, ou inseriu nota ou duplicatas
    if (notaInserida || registros.length > 0) {
      return res.status(200).json({ sucesso: true, registros });
    } else {
      return res.status(400).json({ error: 'Nada foi inserido' });
    }

  } catch (error) {
    console.error('Erro ao importar XML:', error);
    return res.status(500).json({ error: 'Erro interno ao processar XML' });
  }
}
