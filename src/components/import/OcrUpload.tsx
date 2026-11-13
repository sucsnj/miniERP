import { useEffect, useRef, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import {
  clearOcrHistory,
  listOcrHistory,
  migrateLegacyOcrHistory,
  saveOcrHistory,
  type OcrHistoryItem,
  type OcrHistoryStatus,
} from '../../services/ocrHistoryRepository';
import styles from '../../styles/ocrUpload.module.css';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

interface OcrUploadResponseItem {
  id: string;
  arquivo: string;
  linhaDigitavel?: string;
  erro?: string;
}

const statusFor = (item: OcrUploadResponseItem): OcrHistoryStatus => {
  if (item.linhaDigitavel) return 'success';
  return item.erro ? 'error' : 'not-found';
};

const toHistoryItem = (item: OcrUploadResponseItem): OcrHistoryItem => ({
  id: item.id,
  arquivo: item.arquivo,
  linhaDigitavel: item.linhaDigitavel,
  erro: item.erro,
  createdAt: Date.now(),
  status: statusFor(item),
});

export default function OcrUpload() {
  const { showToast } = useToast();
  const [items, setItems] = useState<OcrHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        await migrateLegacyOcrHistory();
        const history = await listOcrHistory();
        if (mounted) setItems(history);
      } catch (error) {
        console.error('Erro ao carregar histórico de OCR:', error);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    if (files.length > MAX_FILES || files.some((file) => file.size > MAX_FILE_SIZE)) {
      showToast(`Envie até ${MAX_FILES} arquivos e cada arquivo com no máximo 8 MB.`, 'error');
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    setLoading(true);
    showToast('Processando OCR...', 'info', null);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      const body = await response.json() as unknown;

      if (!response.ok || !Array.isArray(body)) {
        const message = body && typeof body === 'object' && 'error' in body
          ? String((body as { error?: unknown }).error)
          : 'Erro ao processar OCR.';
        showToast(message, 'error');
        return;
      }

      const batch = (body as OcrUploadResponseItem[]).map(toHistoryItem);
      const nextItems = [...batch, ...items].slice(0, 60);
      await saveOcrHistory(batch);
      setItems(nextItems);
      showToast('OCR finalizado!', 'success');
    } catch (error) {
      console.error('Erro no OCR:', error);
      showToast(error instanceof Error ? error.message : 'Erro ao processar OCR.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyLine = async (line: string) => {
    try {
      await navigator.clipboard.writeText(line);
      showToast('Linha digitável copiada!', 'success');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      showToast('Erro ao copiar linha digitável.', 'error');
    }
  };

  const clearHistory = async () => {
    try {
      await clearOcrHistory();
      setItems([]);
      showToast('Histórico do OCR limpo.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Erro ao limpar o histórico do OCR.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className={styles.ocrUpload} aria-disabled={loading}>
          <span>{loading ? 'Processando...' : 'Adicionar arquivos'}</span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple
            disabled={loading}
            onChange={uploadFile}
            hidden
          />
        </label>
        {items.length > 0 && (
          <button type="button" className={styles.clearHistory} onClick={() => void clearHistory()}>
            Limpar histórico
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.ocrResults} aria-live="polite">
          {items.map((item) => item.status === 'success' ? (
            <button
              key={item.id}
              type="button"
              className={styles.ocrUploadWrapper}
              onClick={() => void copyLine(item.linhaDigitavel ?? '')}
              title="Copiar linha digitável"
            >
              <strong>{item.arquivo}</strong>
              {'\n'}
              {item.linhaDigitavel}
            </button>
          ) : (
            <div key={item.id} className={styles.ocrUploadWrapper} aria-label="Falha no OCR">
              <strong>{item.arquivo}</strong>
              {'\n'}
              {item.erro ?? 'Linha digitável não encontrada.'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
