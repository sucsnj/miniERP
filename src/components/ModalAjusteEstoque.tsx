import { useRef } from 'react';
import styles from '../styles/produtos.module.css';
import type { MovimentacaoEstoqueData } from '../services/produtosService';
import { useFocusTrap } from '../utils/focus';

interface ModalAjusteEstoqueProps {
  open: boolean;
  itemName: string;
  itemEstoque: number;
  quantidade: string;
  descricao: string;
  setQuantidade: React.Dispatch<React.SetStateAction<string>>;
  setDescricao: React.Dispatch<React.SetStateAction<string>>;
  movimentacoes: MovimentacaoEstoqueData[];
  movimentacoesLoading: boolean;
  onSave: () => void;
  onClose: () => void;
}

const ModalAjusteEstoque: React.FC<ModalAjusteEstoqueProps> = ({
  open,
  itemName,
  itemEstoque,
  quantidade,
  descricao,
  setQuantidade,
  setDescricao,
  movimentacoes,
  movimentacoesLoading,
  onSave,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="presentation">
      <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-ajuste-title" tabIndex={-1}>
        <h3 id="modal-ajuste-title" className={styles.modalTitle}>Ajuste de Estoque</h3>
        <p style={{ margin: 0, color: 'var(--foreground)', fontSize: '0.95rem' }}>
          Produto: <strong>{itemName}</strong>
        </p>
        <p style={{ margin: '0 0 1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Estoque atual: <strong>{itemEstoque}</strong>
        </p>



        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="ajuste-quantidade">
            Quantidade:
          </label>
          <input
            id="ajuste-quantidade"
            type="text"
            inputMode="decimal"
            className={styles.inputField}
            placeholder="Use valor positivo ou negativo"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="ajuste-descricao">
            Descrição:
          </label>
          <textarea
            id="ajuste-descricao"
            className={styles.textareaField}
            placeholder="Motivo do ajuste"
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

                <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <span>Últimas 10 movimentações</span>
            {movimentacoesLoading && <span className={styles.historyLoading}>Carregando...</span>}
          </div>
          {movimentacoes.length === 0 ? (
            <div className={styles.emptyState}>
              {movimentacoesLoading ? 'Carregando histórico...' : 'Nenhuma movimentação encontrada para este item.'}
            </div>
          ) : (
            <div className={styles.historyTableWrapper}>
              <table className={styles.historyTable}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Qtd.</th>
                    <th>Estoque</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((mov) => (
                    <tr key={mov.id}>
                      <td>{mov.data_movimentacao}</td>
                      <td>{mov.tipo}</td>
                      <td>{mov.quantidade}</td>
                      <td>{mov.estoque_final}</td>
                      <td>{mov.descricao || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.primaryButton} onClick={onSave} id="save-ajuste-btn">
            Registrar Ajuste
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onClose} id="cancel-ajuste-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAjusteEstoque;
