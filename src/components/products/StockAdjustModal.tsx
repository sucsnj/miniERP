import { useRef } from 'react';
import styles from '../../styles/produtos.module.css';
import type { StockMovementData } from '../../services/produtosService';
import { useFocusTrap } from '../../utils/focus';
import Button from '@/components/common/Button';

interface StockAdjustModalProps {
  open: boolean;
  itemName: string;
  itemStock: number;
  quantity: string;
  description: string;
  setQuantity: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  movements: StockMovementData[];
  movementsLoading: boolean;
  onSave: () => void;
  onClose: () => void;
}

const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  open,
  itemName,
  itemStock,
  quantity,
  description,
  setQuantity,
  setDescription,
  movements,
  movementsLoading,
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
          Estoque atual: <strong>{itemStock}</strong>
        </p>



        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="ajuste-quantity">
            Quantidade:
          </label>
          <input
            id="ajuste-quantity"
            type="text"
            inputMode="decimal"
            className={styles.inputField}
            placeholder="Use valor positivo ou negativo"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="ajuste-description">
            Descrição:
          </label>
          <textarea
            id="ajuste-description"
            className={styles.textareaField}
            placeholder="Motivo do ajuste"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

                <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <span>Últimas 10 movimentações</span>
            {movementsLoading && <span className={styles.historyLoading}>Carregando...</span>}
          </div>
          {movements.length === 0 ? (
            <div className={styles.emptyState}>
              {movementsLoading ? 'Carregando histórico...' : 'Nenhuma movimentação encontrada para este item.'}
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
                  {movements.map((mov) => (
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
          <Button type="button" variant="success" onClick={onSave} id="save-ajuste-btn">
            Registrar Ajuste
          </Button>
          <Button type="button" variant="outline" onClick={onClose} id="cancel-ajuste-btn">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustModal;
