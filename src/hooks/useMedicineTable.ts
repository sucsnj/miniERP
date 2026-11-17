import { useCallback, useEffect, useState } from 'react';
import {
  clearMedicineTableHistory,
  listMedicineTableHistory,
  loadMedicineTableSnapshot,
  saveMedicineTableHistory,
  saveMedicineTableSnapshot,
  type MedicineTableRow,
  type TableSearchHistoryItem,
} from '../services/medicineTableStore';
import { normalizeRows, normalizeText, searchMedicineTableRows } from '../utils/medicineTableSearch';

export interface TableStatus {
  loaded: boolean;
  rowCount: number;
}

export interface TableSearchResponse {
  source: 'history' | 'table';
  results: MedicineTableRow[];
  query: string;
}

export interface TableUploadResponse {
  message: string;
  rowCount: number;
}

const parseSpreadsheet = async (file: File): Promise<MedicineTableRow[]> => {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  if (rows.length === 0) {
    throw new Error('A planilha não contém dados.');
  }

  const normalizedRows = normalizeRows(rows);
  if (normalizedRows.length === 0) {
    throw new Error('A planilha não possui colunas legíveis para a tabela.');
  }

  return normalizedRows;
};

export const useMedicineTable = () => {
  const [status, setStatus] = useState<TableStatus>({ loaded: false, rowCount: 0 });
  const [history, setHistory] = useState<TableSearchHistoryItem[]>([]);
  const [statusInitialLoading, setStatusInitialLoading] = useState(true);
  const [historyInitialLoading, setHistoryInitialLoading] = useState(true);
  const [searchPending, setSearchPending] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const [clearHistoryPending, setClearHistoryPending] = useState(false);
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof loadMedicineTableSnapshot>> | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const [loadedSnapshot, loadedHistory] = await Promise.all([
          loadMedicineTableSnapshot(),
          listMedicineTableHistory(),
        ]);

        if (!mounted) return;
        setSnapshot(loadedSnapshot);
        setStatus({ loaded: Boolean(loadedSnapshot), rowCount: loadedSnapshot?.rowCount ?? 0 });
        setHistory(loadedHistory);
      } catch (error) {
        console.error('Erro ao carregar cache da tabela de medicamentos:', error);
      } finally {
        if (mounted) {
          setStatusInitialLoading(false);
          setHistoryInitialLoading(false);
        }
      }
    };

    void initialize();
    return () => {
      mounted = false;
    };
  }, []);

  const upload = {
    isPending: uploadPending,
    mutateAsync: useCallback(async (file: File): Promise<TableUploadResponse> => {
      setUploadPending(true);

      try {
        const rows = await parseSpreadsheet(file);
        await saveMedicineTableSnapshot(rows);
        setSnapshot({ key: 'current', loaded: true, rowCount: rows.length, updatedAt: Date.now(), rows });
        setHistory([]);
        setStatus({ loaded: true, rowCount: rows.length });
        return { message: 'Planilha de tabela carregada com sucesso.', rowCount: rows.length };
      } finally {
        setUploadPending(false);
      }
    }, []),
  };

  const search = {
    isPending: searchPending,
    mutateAsync: useCallback(async (term: string): Promise<TableSearchResponse> => {
      const trimmed = term.trim();
      if (!trimmed) {
        throw new Error('Digite um termo para pesquisar.');
      }

      setSearchPending(true);

      try {
        const normalized = normalizeText(trimmed);
        const cached = history.find((item) => normalizeText(item.query) === normalized);

        if (cached) {
          return { source: 'history', results: cached.results, query: cached.query };
        }

        if (!snapshot) {
          throw new Error('Nenhuma planilha de tabela carregada. Faça upload de um arquivo XLSX antes de pesquisar.');
        }

        const results = searchMedicineTableRows(trimmed, snapshot.rows).slice(0, 200);
        const resultCount = results.length;

        void saveMedicineTableHistory({ query: trimmed, result_count: resultCount, results })
          .then(listMedicineTableHistory)
          .then(setHistory)
          .catch((error) => console.error('Erro ao atualizar histórico de pesquisas:', error));

        return { source: 'table', results, query: trimmed };
      } finally {
        setSearchPending(false);
      }
    }, [history, snapshot]),
  };

  const clearHistory = {
    isPending: clearHistoryPending,
    mutateAsync: useCallback(async () => {
      setClearHistoryPending(true);

      try {
        await clearMedicineTableHistory();
        setHistory([]);
      } finally {
        setClearHistoryPending(false);
      }
    }, []),
  };

  return {
    status,
    statusInitialLoading,
    statusError: null,
    history,
    historyInitialLoading,
    historyError: null,
    search,
    upload,
    clearHistory,
  };
};

export type { MedicineTableRow, TableSearchHistoryItem, TableSearchHistoryItem as TableSearchHistoryItemType };
export type { TableStatus as TabelaStatusResponse, TableSearchResponse as TabelaSearchResponse, TableUploadResponse as TableUploadResponseType };
