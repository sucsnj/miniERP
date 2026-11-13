const DB_NAME = 'minierp-ocr';
const DB_VERSION = 1;
const STORE_NAME = 'history';
const MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 60;

export type OcrHistoryStatus = 'success' | 'not-found' | 'error';

export interface OcrHistoryItem {
  id: string;
  arquivo: string;
  linhaDigitavel?: string;
  erro?: string;
  createdAt: number;
  status: OcrHistoryStatus;
}

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não está disponível.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o histórico do OCR.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
  });

const requestAsPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível acessar o histórico do OCR.'));
  });

const transactionComplete = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível gravar o histórico do OCR.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível gravar o histórico do OCR.'));
  });

export const listOcrHistory = async (): Promise<OcrHistoryItem[]> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const entries = await requestAsPromise(transaction.objectStore(STORE_NAME).getAll());
    return entries
      .filter((item) => Date.now() - item.createdAt <= MAX_AGE_MS)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_ENTRIES);
  } finally {
    database.close();
  }
};

const readLegacyOcrHistory = (): OcrHistoryItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem('ocrRecente');
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item, index): OcrHistoryItem[] => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      const arquivo = typeof record.arquivo === 'string' ? record.arquivo.slice(0, 500) : null;
      if (!arquivo) return [];

      const linhaDigitavel = typeof record.linhaDigitavel === 'string'
        ? record.linhaDigitavel.replace(/\D/g, '').slice(0, 80)
        : typeof record.linha === 'string'
          ? record.linha.replace(/\D/g, '').slice(0, 80)
          : undefined;
      const erro = typeof record.erro === 'string' ? record.erro.slice(0, 300) : undefined;
      const digitsLength = linhaDigitavel?.length ?? 0;
      const status: OcrHistoryStatus = linhaDigitavel && digitsLength >= 40 ? 'success' : erro ? 'error' : 'not-found';

      return [{
        id: `legacy-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
        arquivo,
        linhaDigitavel,
        erro,
        createdAt: Date.now(),
        status,
      }];
    });
  } catch {
    return [];
  }
};

export const migrateLegacyOcrHistory = async (): Promise<void> => {
  const legacy = readLegacyOcrHistory();
  if (legacy.length === 0) return;

  await saveOcrHistory(legacy);
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('ocrRecente');
  }
};

export const saveOcrHistory = async (items: OcrHistoryItem[]): Promise<void> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    for (const item of items) {
      store.put(item);
    }

    await transactionComplete(transaction);

    const cutoff = Date.now() - MAX_AGE_MS;
    const cleanup = database.transaction(STORE_NAME, 'readwrite');
    const cleanupStore = cleanup.objectStore(STORE_NAME);
    const entries = await requestAsPromise(cleanupStore.getAll());
    const recent = entries
      .filter((item) => item.createdAt > cutoff)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_ENTRIES);
    const keep = new Set(recent.map((item) => item.id));

    for (const item of entries) {
      if (!keep.has(item.id)) cleanupStore.delete(item.id);
    }

    await transactionComplete(cleanup);
  } finally {
    database.close();
  }
};

export const clearOcrHistory = async (): Promise<void> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
};
