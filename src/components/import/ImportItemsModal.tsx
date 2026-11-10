/**
 * src/components/import/ImportItemsModal.tsx
 *
 * Modal de importação de produtos via nota fiscal (XML). Apresentacional —
 * lógica no `useImportItems` e seletor de vínculo no `ItemNameDropdown`.
 * Ver docs/components/ImportItemsModal.md.
 */

import { useMemo, useRef } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import importStyles from '../../styles/modalImport.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useImportItems, type ItemStatus } from '../../hooks/useImportItems';
import ItemNameDropdown from './ItemNameDropdown';
import Button from '@/components/common/Button';

interface ImportItemsModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
  initialFile?: File | null;
}

const rowClassByStatus: Record<ItemStatus, string | undefined> = {
  idle: undefined,
  ok: importStyles.row_ok,
  duplicado: importStyles.row_duplicado,
  estoque_atualizado: importStyles.row_estoque_atualizado,
  erro: importStyles.row_erro,
};

const ImportItemsModal: React.FC<ImportItemsModalProps> = ({ onClose, onImportSuccess, initialFile }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  const {
    fileInputRef,
    isDragOver,
    fileName,
    loading,
    importing,
    products,
    error,
    completed,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleImport,
    handleItemDescriptionChange,
    handleSelectSuggestion,
    handleEditItem,
    handleQuickRegister,
    resetFile,
  } = useImportItems({ onImportSuccess, initialFile });

  const counts = useMemo(() => {
    let okCount = 0;
    let updatedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    for (const p of products) {
      if (p.status === 'ok') okCount++;
      else if (p.status === 'estoque_atualizado') updatedCount++;
      else if (p.status === 'duplicado') duplicateCount++;
      else if (p.status === 'erro') errorCount++;
    }
    return { okCount, updatedCount, duplicateCount, errorCount };
  }, [products]);

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modalContent} ${importStyles.modalLarge}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-import-title"
        tabIndex={-1}
      >
        {/* Cabeçalho */}
        <div className={importStyles.modalHeader}>
          <h3 id="modal-import-title" className={styles.modalTitle}>
            Importar Produtos via Nota Fiscal (XML)
          </h3>
          <Button className={importStyles.closeBtn} variant="ghost" size="sm" iconOnly onClick={onClose} aria-label="Fechar" leftIcon={<CloseIcon fontSize="small" />} />
        </div>

        {/* Área de upload */}
        {!products.length && !loading && (
          <div
            className={`${importStyles.dropZone} ${isDragOver ? importStyles.dropZoneActive : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Área para soltar arquivo XML"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <UploadFileIcon className={importStyles.dropIcon} />
            <p className={importStyles.dropText}>
              Arraste um arquivo <strong>.xml</strong> de NF-e aqui ou clique para selecionar
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              id="xml-file-input"
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className={importStyles.loadingArea}>
            <div className={importStyles.spinner} />
            <p>Lendo nota fiscal…</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className={importStyles.errorBanner}>
            <WarningAmberIcon fontSize="small" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabela de produtos */}
        {products.length > 0 && (
          <>
            <div className={importStyles.fileInfo}>
              <span className={importStyles.fileName}>{fileName}</span>
              <span className={importStyles.prodCount}>
                {products.length} produto(s) encontrado(s)
              </span>
              {!completed && (
                <Button type="button" variant="outline" size="sm" className={importStyles.trocarBtn} onClick={resetFile}>
                  Trocar arquivo
                </Button>
              )}
            </div>

            {completed && (
              <div className={importStyles.resumoBanner}>
                <FileDownloadDoneIcon />
                <span>
                  Importação concluída: <strong>{counts.okCount}</strong> inserido(s)
                  {counts.updatedCount > 0 && (
                    <>
                      , <strong>{counts.updatedCount}</strong> estoque atualizado
                    </>
                  )}
                  {counts.duplicateCount > 0 && (
                    <>
                      , <strong>{counts.duplicateCount}</strong> duplicado(s)
                    </>
                  )}
                  {counts.errorCount > 0 && (
                    <>
                      , <strong>{counts.errorCount}</strong> erro(s)
                    </>
                  )}
                </span>
              </div>
            )}

            <div className={importStyles.tableWrapper}>
              <table className={importStyles.importTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ minWidth: '220px' }}>Produto na NF-e</th>
                    <th style={{ minWidth: '250px' }}>Item no Sistema (Vínculo)</th>
                    <th>Un.</th>
                    <th>Qtd.</th>
                    <th>Vlr. Unit. (R$)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i} className={rowClassByStatus[p.status]}>
                      <td>{i + 1}</td>
                      <td className={importStyles.colNfProduto}>
                        <div
                          className={importStyles.nomeNfTexto}
                          title={p.descricaoOriginal || p.descricao}
                        >
                          {p.descricaoOriginal || p.descricao}
                        </div>
                        {(p.ean || p.cProd) && (
                          <div className={importStyles.subCode}>
                            {p.ean && <span>EAN: {p.ean}</span>}
                            {p.ean && p.cProd && p.cProd !== p.ean && <span> · </span>}
                            {p.cProd && p.cProd !== p.ean && <span>Cód: {p.cProd}</span>}
                          </div>
                        )}
                      </td>
                      <td>
                        <ItemNameDropdown
                          item={p}
                          onSelectSuggestion={(suggestion) => handleSelectSuggestion(i, suggestion)}
                          onTextChange={(newText) => handleItemDescriptionChange(i, newText)}
                          disabled={completed || importing}
                        />
                        {!completed && (
                          <div className={importStyles.cadastroRapidoContainer}>
                            {p.existe && p.itemIdExistente ? (
                              <Button
                                type="button"
                                variant="info"
                                size="sm"
                                className={importStyles.btnEditarItem}
                                onClick={() => handleEditItem(p)}
                                title="Abrir edição deste item em nova aba"
                                leftIcon={<EditIcon fontSize="inherit" />}
                                rightIcon={<OpenInNewIcon fontSize="inherit" className={importStyles.iconExternal} />}
                              >
                                Editar item
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="success"
                                size="sm"
                                className={importStyles.btnCadastroRapido}
                                onClick={() => handleQuickRegister(p)}
                                title="Abrir formulário de cadastro em nova aba"
                                leftIcon={<AddIcon fontSize="inherit" />}
                                rightIcon={<OpenInNewIcon fontSize="inherit" className={importStyles.iconExternal} />}
                              >
                                Cadastro rápido
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                      <td>{p.unidadeMedida}</td>
                      <td>{p.quantidade}</td>
                      <td>
                        {p.valorUnitario.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </td>
                      <td>
                        {p.status === 'idle' &&
                          (p.existe ? (
                            <span
                              className={importStyles.badgeExistente}
                              title="Produto já cadastrado no sistema"
                            >
                              <CheckCircleOutlineIcon fontSize="inherit" /> No Sistema
                            </span>
                          ) : (
                            <span className={importStyles.badgeNaoCadastrado} title="Produto novo">
                              Não Cadastrado
                            </span>
                          ))}
                        {p.status === 'ok' && (
                          <span className={importStyles.badgeOk}>
                            <CheckCircleOutlineIcon fontSize="inherit" /> Importado
                          </span>
                        )}
                        {p.status === 'estoque_atualizado' && (
                          <span
                            className={importStyles.badgeEstoqueAtualizado}
                            title={p.mensagem}
                          >
                            <CheckCircleOutlineIcon fontSize="inherit" /> Est. Atualizado
                          </span>
                        )}
                        {p.status === 'duplicado' && (
                          <span className={importStyles.badgeDup} title={p.mensagem}>
                            <WarningAmberIcon fontSize="inherit" /> Duplicado
                          </span>
                        )}
                        {p.status === 'erro' && (
                          <span className={importStyles.badgeErro} title={p.mensagem}>
                            <WarningAmberIcon fontSize="inherit" /> Erro
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Rodapé */}
        <div className={styles.modalActions}>
          {products.length > 0 && !completed && (
            <Button
              type="button"
              variant="success"
              onClick={handleImport}
              disabled={importing}
              id="btn-confirmar-importacao"
              isLoading={importing}
            >
              {importing ? 'Importando...' : `Importar ${products.length} produto(s)`}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            id="btn-fechar-import"
          >
            {completed ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportItemsModal;
