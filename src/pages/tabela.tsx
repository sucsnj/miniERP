import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from '../components/Toast';
import styles from '../styles/contas.module.css';
import {
  uploadTabela,
  searchTabela,
  fetchTabelaHistory,
  clearTabelaHistory,
  fetchTabelaStatus,
  TabelaRow,
  TabelaSearchHistoryItem,
} from '../services/tabelaService';
import { useShortcuts } from '../utils/shortcuts';
import { parseDate } from '../utils/date';

// Componente React.
const Tabela: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [tabelaLoaded, setTabelaLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TabelaRow[]>([]);
  const [history, setHistory] = useState<TabelaSearchHistoryItem[]>([]);
  const [source, setSource] = useState<'history' | 'table' | ''>('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => setToastOpen(false);

  const loadSearchHistory = useCallback(async () => {
    try {
      const recent = await fetchTabelaHistory();
      setHistory(recent);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadTabelaStatus = useCallback(async () => {
    try {
      const status = await fetchTabelaStatus();
      setTabelaLoaded(status.loaded);
      setRowCount(status.rowCount);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSearchHistory();
      loadTabelaStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSearchHistory, loadTabelaStatus]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadTabela(formData);
      setRowCount(result.rowCount ?? null);
      setTabelaLoaded(true);
      setResults([]);
      setSource('');
      showToast('Planilha de tabela carregada com sucesso.', 'success');
      await loadSearchHistory();
    } catch (error) {
      console.error(error);
      setRowCount(null);
      setTabelaLoaded(false);
      showToast(error instanceof Error ? error.message : 'Erro ao carregar a planilha.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      showToast('Digite um termo para pesquisar.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await searchTabela(searchTerm);
      setResults(response.results ?? []);
      setSource(response.source);
      if ((response.results ?? []).length === 0) {
        showToast('Nenhum resultado encontrado para essa pesquisa.', 'info');
      } else {
        showToast(`Busca feita com sucesso (${response.results.length} registros).`, 'success');
      }
      await loadSearchHistory();
    } catch (error) {
      console.error(error);
      setResults([]);
      setSource('');
      showToast(error instanceof Error ? error.message : 'Erro ao buscar na tabela.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await performSearch(query);
  };

  const handleHistoryClick = async (item: TabelaSearchHistoryItem) => {
    setQuery(item.query);
    await performSearch(item.query);
  };

  const handleClearHistory = async () => {
    try {
      await clearTabelaHistory();
      setHistory([]);
      showToast('Histórico de pesquisas limpo.', 'success');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Erro ao limpar histórico.', 'error');
    }
  };

  // apagar o texto do input de classe 'search-input' quando pressionar escape
  useShortcuts(['Escape'], () => {
    const input = document.querySelector<HTMLInputElement>('.search-input');
    if (input) {
      input.value = '';
    }
  });

  return (
    <div className="page-container">
      <div className="container-padding">
        <h1>Tabela de Medicamentos</h1>
      </div>

      <section className="glass-form upload-panel">
        <div className="panel-row">
          <div className="upload-help">
            <button type="button" className="upload-button" onClick={() => fileInputRef.current?.click()}>
              {uploading ? 'Carregando...' : 'Enviar nova planilha'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-field">

                <input className="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    tabelaLoaded
                      ? 'Buscar na Tabela: Digite substância, laboratório, EAN, produto, classe...'
                      : 'Nenhuma planilha de tabela interna foi encontrada. Faça o upload de um arquivo XLSX para habilitar as buscas.'
                  }
                  disabled={!tabelaLoaded}
                />
              </div>
              <button type="submit" className="search-button" disabled={loading || !tabelaLoaded}>
                {loading ? 'Pesquisando...' : 'Buscar'}
              </button>
            </form>
          </div>
          <div className="panel-summary">
            <strong>Planilha atual</strong>
            <span>{fileName || 'Nenhuma planilha carregada'}</span>
            <strong>Linhas registradas</strong>
            <span>{rowCount ?? '—'}</span>
            <strong>Status</strong>
            <span>{tabelaLoaded ? 'Carregada' : 'Aguardando upload'}</span>
          </div>
        </div>
      </section>

      <div className="results-grid">
        <section className="glass-form results-panel">
          <div className={styles.panelHeader}>
            <div>
              <h2>Resultados</h2>
              <p>{source ? `Fonte: ${source === 'history' ? 'Histórico cacheado' : 'Tabela carregada'}` : 'Realize uma busca para ver resultados.'}</p>
            </div>
            <div className="result-counter">{results.length} registro(s)</div>
          </div>

          {results.length > 0 ? (
            <div className="table-wrapper">
              <table className="table-container">
                <thead>
                  <tr>
                    <th>Substância</th>
                    <th>Laboratório</th>
                    <th>EAN</th>
                    <th>Produto</th>
                    <th>Apresentação</th>
                    <th>Classe terapêutica</th>
                    <th>PF 20,5%</th>
                    <th>PMC 20,5%</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={`${row.ean}-${index}`}>
                      <td>{row.substancia.replace(/;/g, ";\n")}</td>
                      <td>{row.laboratorio}</td>
                      <td>{row.ean}</td>
                      <td>{row.produto}</td>
                      <td>{row.apresentacao}</td>
                      <td>{row.classeTerapeutica}</td>
                      <td>{row.pf205}</td>
                      <td>{row.pmc205}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">Use a busca acima para encontrar registros na tabela.</div>
          )}
        </section>

        <aside className="glass-form history-panel">
          <div className={styles.panelHeader}>
            <div>
              <h2>Histórico de pesquisas</h2>
              <p>Últimas 100 buscas gravadas no cache.</p>
            </div>
            <button type="button" onClick={handleClearHistory} className="secondary">
              Limpar histórico
            </button>
          </div>

          {history.length > 0 ? (
            <div className="history-list">
              {history.map((item) => (
                <button key={item.id} type="button" className="history-item" onClick={() => handleHistoryClick(item)}>
                  <div>
                    <strong>{item.query.replace(/;/g, ";\n")}</strong>
                    <span> {item.result_count} resultados</span>
                  </div>
                  <small>{parseDate(item.updated_at).format('DD/MM/YYYY, HH:mm:ss')}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">Nenhuma pesquisa registrada ainda.</div>
          )}
        </aside>
      </div>

      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />

      <style jsx>{`
        .results-grid {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(280px, 1fr);
          gap: 8px;
        }

        .upload-help {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1;
        }

        .upload-button {
          align-self: flex-start;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .search-field {
          flex: unset;
          padding-left: 4px;
          width: 70%;
        }

        .search-field label {
          display: block;
          width: 100%;
        }

        .search-input {
          flex: 1;
          max-width: 100%;
          padding: 8px 14px;
        }

        .search-button {
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
          margin-bottom: 8px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
          margin-bottom: 12px;
        }

        .result-counter {
          color: var(--muted);
          font-size: 0.95rem;
        }

        .upload-panel,
        .search-panel,
        .results-panel,
        .history-panel {
          padding: 18px;
          border-radius: 18px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }

        .panel-row {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          justify-content: space-between;
          align-items: center;
        }

        .panel-summary {
          min-width: 220px;
          display: grid;
          gap: 2px;
          font-size: 0.92rem;
        }

        .panel-summary strong {
          display: block;
          color: var(--muted);
        }

        .panel-summary span {
          font-weight: 600;
        }

        .search-form {
          display: flex;
          align-items: flex-end;
          gap: 14px;
          width: 100%;
        }

        .search-form label {
          flex: 1;
          min-width: 220px;
        }

        .search-form input {
          width: 100%;
        }

        .search-form button {
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .search-hint {
          margin-top: 14px;
          color: var(--muted);
          font-size: 0.92rem;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .table-container {
          width: 95%;
          min-width: 700px;
          font-size: 0.8rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .history-item {
          text-align: left;
          border: 1px solid var(--border);
          background: var(--surface-strong);
          border-radius: 12px;
          padding: 12px 14px;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .history-item:hover {
          transform: translateY(-1px);
          border-color: var(--accent);
        }

        .history-item small {
          color: var(--muted);
        }

        .empty-state {
          color: var(--muted);
          padding: 22px;
          text-align: center;
          border: 1px dashed var(--border);
          border-radius: 16px;
          background: var(--surface-soft);
        }

        .secondary {
          background: var(--surface-soft);
          border-color: var(--border);
        }

      @media (max-width: 630px) {
        .results-grid {
          grid-template-columns: 1fr;
          gap: 14px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .upload-help {
          flex-direction: column;
          gap: 14px;
        }

        .upload-button {
          align-self: stretch;
          width: 100%;
          text-align: center;
        }

        .search-field {
          width: 100%;
          padding-left: 0;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 0.95rem;
        }

        .search-button {
          width: 100%;
          margin-bottom: 10px;
          padding: 10px;
          font-size: 0.95rem;
        }

        .panel-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .result-counter {
          font-size: 0.85rem;
        }

        .upload-panel,
        .search-panel,
        .results-panel,
        .history-panel {
          padding: 14px;
          border-radius: 14px;
        }

        .panel-row {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }

        .panel-summary {
          min-width: auto;
          font-size: 0.85rem;
        }

        .search-form {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .search-form label {
          min-width: auto;
          width: 100%;
        }

        .search-form button {
          width: 100%;
          padding: 10px;
          font-size: 0.95rem;
        }

        .search-hint {
          font-size: 0.85rem;
          margin-top: 10px;
        }

        .table-container {
          width: 100%;
          min-width: auto;
          font-size: 0.65rem;
        }

        .history-list {
          gap: 8px;
        }

        .history-item {
          padding: 10px 12px;
          font-size: 0.9rem;
        }

        .history-item small {
          font-size: 0.8rem;
        }

        .empty-state {
          font-size: 0.9rem;
          padding: 16px;
        }
      }

      `}</style>
    </div>
  );
};

export default Tabela;
