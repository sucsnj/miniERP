import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';
import contasStyles from '../styles/payables.module.css';
import {
  TableRow,
  TableSearchHistoryItem,
} from '../services/medicineTableService';
import { useMedicineTable } from '../hooks/useMedicineTable';
import { useShortcuts } from '../utils/shortcuts';
import { parseDate } from '../utils/date';
import styles from '../styles/medicine-table.module.css';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import Button from '@/components/common/Button';

// Componente React.
const Tabela: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TableRow[]>([]);
  const [source, setSource] = useState<'history' | 'table' | ''>('');

  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    status,
    statusInitialLoading,
    statusError,
    history,
    historyInitialLoading,
    historyError,
    search,
    upload,
    clearHistory,
  } = useMedicineTable();
  const tabelaLoaded = status.loaded;
  const rowCount = status.rowCount;
  const loading = search.isPending;
  const uploading = upload.isPending;
  usePendingTask('medicine-table-status', statusInitialLoading);
  usePendingTask('medicine-table-history', historyInitialLoading);

  useEffect(() => {
    if (!statusError) return;
    console.error(statusError);
  }, [statusError]);

  useEffect(() => {
    if (!historyError) return;
    console.error(historyError);
  }, [historyError]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      await upload.mutateAsync(formData);
      setFileName(file.name);
      setResults([]);
      setSource('');
      showToast('Planilha de tabela carregada com sucesso.', 'success');
    } catch (error) {
      console.error(error);
      setFileName('');
      showToast(error instanceof Error ? error.message : 'Erro ao carregar a planilha.', 'error');
    }
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      showToast('Digite um termo para pesquisar.', 'error');
      return;
    }

    try {
      const response = await search.mutateAsync(searchTerm);
      setResults(response.results ?? []);
      setSource(response.source);
      if ((response.results ?? []).length === 0) {
        showToast('Nenhum resultado encontrado para essa pesquisa.', 'info');
      } else {
        showToast(`Busca feita com sucesso (${response.results.length} registros).`, 'success');
      }
    } catch (error) {
      console.error(error);
      setResults([]);
      setSource('');
      showToast(error instanceof Error ? error.message : 'Erro ao buscar na tabela.', 'error');
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await performSearch(query);
  };

  const handleHistoryClick = async (item: TableSearchHistoryItem) => {
    setQuery(item.query);
    await performSearch(item.query);
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory.mutateAsync();
      showToast('Histórico de pesquisas limpo.', 'success');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Erro ao limpar histórico.', 'error');
    }
  };

  const clearSearchInput = useCallback(() => setQuery(''), []);

  useShortcuts(['Escape'], clearSearchInput);

  return (
      <PageShell>
      <PageHeader title="Tabela de Medicamentos" description="Upload, busca e histórico da tabela de medicamentos." />

      <Panel className={styles.uploadPanel}>
        <div className={`${styles.panelRow}`}>
          <div className={`${styles.uploadHelp}`}>
            {isAdmin && (
              <Button type="button" variant="primary" className={`${styles.uploadButton}`} onClick={() => fileInputRef.current?.click()} isLoading={uploading}>
                {uploading ? 'Carregando...' : 'Enviar nova planilha'}
              </Button>
            )}
            {isAdmin && (
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            )}

            <form onSubmit={handleSearch} className={`${styles.searchForm}`}>
              <div className={`${styles.searchField}`}>

                <input className={`${styles.searchInput}`}
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
              <Button type="submit" variant="primary" className={`${styles.searchButton}`} disabled={loading || !tabelaLoaded} isLoading={loading}>
                {loading ? 'Pesquisando...' : 'Buscar'}
              </Button>
            </form>
          </div>
          <div className={`${styles.panelSummary}`}>
            <strong>Planilha atual</strong>
            <span>{fileName || 'Nenhuma planilha carregada'}</span>
            <strong>Linhas registradas</strong>
            <span>{rowCount ?? '—'}</span>
            <strong>Status</strong>
            <span>{tabelaLoaded ? 'Carregada' : 'Aguardando upload'}</span>
          </div>
        </div>
      </Panel>

      <div className={`${styles.resultsGrid}`}>
        <Panel className={styles.resultsPanel}>
          <div className={contasStyles.panelHeader}>
            <div>
              <h2>Resultados</h2>
              <p>{source ? `Fonte: ${source === 'history' ? 'Histórico cacheado' : 'Tabela carregada'}` : 'Realize uma busca para ver resultados.'}</p>
            </div>
            <div className={`${styles.resultCounter}`}>{results.length} registro(s)</div>
          </div>

          {results.length > 0 ? (
            <div className={`${styles.tableWrapper}`}>
              <table className={`${styles.tableContainer}`}>
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
                      <td>{row.substance.replace(/;/g, ";\n")}</td>
                      <td>{row.laboratory}</td>
                      <td>{row.ean}</td>
                      <td>{row.product}</td>
                      <td>{row.presentation}</td>
                      <td>{row.therapeuticClass}</td>
                      <td>{row.pf205}</td>
                      <td>{row.pmc205}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`${styles.emptyState}`}>Use a busca acima para encontrar registros na tabela.</div>
          )}
        </Panel>

        <Panel className={styles.historyPanel}>
          <div className={contasStyles.panelHeader}>
            <div>
              <h2>Histórico de pesquisas</h2>
              <p>Últimas 100 buscas gravadas no cache.</p>
            </div>
            {isAdmin && (
              <Button type="button" variant="outline" onClick={handleClearHistory}>
                Limpar histórico
              </Button>
            )}
          </div>

          {history.length > 0 ? (
            <div className={`${styles.historyList}`}>
              {history.map((item) => (
                <button key={item.id} type="button" className={`${styles.historyItem}`} onClick={() => handleHistoryClick(item)}>
                  <div>
                    <strong>{item.query.replace(/;/g, ";\n")}</strong>
                    <span> {item.result_count} resultados</span>
                  </div>
                  <small>{parseDate(item.updated_at).format('DD/MM/YYYY, HH:mm:ss')}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className={`${styles.emptyState}`}>Nenhuma pesquisa registrada ainda.</div>
          )}
        </Panel>
      </div>
    </PageShell>
  );
};

export default Tabela;