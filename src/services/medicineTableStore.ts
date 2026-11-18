const DB_NAME = 'minierp-medicine-table';
const DB_VERSION = 1;
const SNAPSHOT_STORE = 'snapshot';
const HISTORY_STORE = 'history';
const SNAPSHOT_KEY = 'current';
const UF_KEY = 'settings:uf';
const MAX_HISTORY_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_HISTORY_ENTRIES = 60;

export type MedicineTableUf = 'PE';
export const DEFAULT_MEDICINE_TABLE_UF: MedicineTableUf = 'PE';

export interface MedicineTableRow {
  substance: string;
  laboratory: string;
  ean: string;
  product: string;
  presentation: string;
  therapeuticClass: string;
  pf205: string;
  pmc205: string;
  priceColumns?: Record<string, string>;
}

export interface MedicineTableSnapshot {
  key: string;
  loaded: true;
  rowCount: number;
  updatedAt: number;
  rows: MedicineTableRow[];
}

export interface TableSearchHistoryItem {
  id: string;
  query: string;
  result_count: number;
  updated_at: string;
  results: MedicineTableRow[];
}

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não está disponível.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o cache da tabela.'));
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(SNAPSHOT_STORE)) {
        database.createObjectStore(SNAPSHOT_STORE, { keyPath: 'key' });
      }

      if (!database.objectStoreNames.contains(HISTORY_STORE)) {
        const store = database.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
  });

const requestAsPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível acessar o cache da tabela.'));
  });

const transactionComplete = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível gravar o cache da tabela.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível gravar o cache da tabela.'));
  });

export const loadMedicineTableSnapshot = async (): Promise<MedicineTableSnapshot | null> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(SNAPSHOT_STORE, 'readonly');
    return await requestAsPromise(transaction.objectStore(SNAPSHOT_STORE).get(SNAPSHOT_KEY)) as MedicineTableSnapshot | null;
  } finally {
    database.close();
  }
};

export const saveMedicineTableSnapshot = async (rows: MedicineTableRow[]): Promise<void> => {
  const snapshot: MedicineTableSnapshot = {
    key: SNAPSHOT_KEY,
    loaded: true,
    rowCount: rows.length,
    updatedAt: Date.now(),
    rows,
  };
  const database = await openDatabase();

  try {
    const transaction = database.transaction([SNAPSHOT_STORE, HISTORY_STORE], 'readwrite');
    transaction.objectStore(SNAPSHOT_STORE).put(snapshot);
    transaction.objectStore(HISTORY_STORE).clear();
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
};

export const listMedicineTableHistory = async (): Promise<TableSearchHistoryItem[]> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(HISTORY_STORE, 'readonly');
    const entries = await requestAsPromise(transaction.objectStore(HISTORY_STORE).getAll()) as Array<TableSearchHistoryItem & { updatedAt?: number }>;

    return entries
      .map((item) => ({ id: item.id, query: item.query, result_count: item.result_count, updated_at: item.updated_at, results: item.results ?? [] }))
      .filter((item) => {
        const timestamp = new Date(item.updated_at).getTime();
        return Number.isFinite(timestamp) && Date.now() - timestamp <= MAX_HISTORY_AGE_MS;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, MAX_HISTORY_ENTRIES);
  } finally {
    database.close();
  }
};

export const saveMedicineTableHistory = async (item: Omit<TableSearchHistoryItem, 'id' | 'updated_at'>): Promise<void> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(HISTORY_STORE, 'readwrite');
    transaction.objectStore(HISTORY_STORE).put({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      updated_at: new Date().toISOString(),
    });
    await transactionComplete(transaction);

    const entries = await listMedicineTableHistory();
    const keep = new Set(entries.slice(0, MAX_HISTORY_ENTRIES).map((entry) => entry.id));
    const allEntries = await requestAsPromise(database.transaction(HISTORY_STORE, 'readonly').objectStore(HISTORY_STORE).getAll()) as TableSearchHistoryItem[];

    for (const entry of allEntries) {
      if (!keep.has(entry.id)) {
        database.transaction(HISTORY_STORE, 'readwrite').objectStore(HISTORY_STORE).delete(entry.id);
      }
    }
  } finally {
    database.close();
  }
};

export const clearMedicineTableHistory = async (): Promise<void> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(HISTORY_STORE, 'readwrite');
    transaction.objectStore(HISTORY_STORE).clear();
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
};

export const loadMedicineTableUf = async (): Promise<MedicineTableUf | null> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(SNAPSHOT_STORE, 'readonly');
    const stored = await requestAsPromise(transaction.objectStore(SNAPSHOT_STORE).get(UF_KEY)) as { key: string; value: string } | null;
    return stored?.value === 'PE' ? stored.value : null;
  } finally {
    database.close();
  }
};

export const saveMedicineTableUf = async (uf: MedicineTableUf): Promise<void> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(SNAPSHOT_STORE, 'readwrite');
    transaction.objectStore(SNAPSHOT_STORE).put({ key: UF_KEY, value: uf });
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
};
