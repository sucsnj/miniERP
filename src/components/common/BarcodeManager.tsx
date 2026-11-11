import styles from '../../styles/products.module.css';
import Button from '@/components/common/Button';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import {
  BarcodeData,
} from '../../services/productsService';

export interface BarcodeManagerData {
  barcodes: BarcodeData[];
  newBarcode: string;
}

export interface BarcodeManagerActions {
  add: () => void;
  setAsPrincipal: (barcode: string) => void;
  change: (barcode: string) => void;
  remove: (barcode: string) => void;
}

interface BarcodeManagerProps {
  date: BarcodeManagerData;
  actions: BarcodeManagerActions;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const BarcodeManager: React.FC<BarcodeManagerProps> = ({
  date,
  actions,
  inputRef,
}) => {
  return (
    <div className={styles.barcodeSection}>
      <div className={styles.barcodeTitle}>Códigos de Barras</div>
      <div className={styles.barcodeInputRow}>
        <input
          ref={inputRef}
          type="text"
          className={styles.inputField}
          placeholder="Digitar código de barras..."
          value={date.newBarcode}
          onChange={(e) => actions.change(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              actions.add();
            }
          }}
          id="barcode-input-field"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={actions.add}
          id="add-barcode-action-btn"
        >
          Adicionar
        </Button>
      </div>

      {date.barcodes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: '0.75rem',
            padding: '10px',
          }}
        >
          Nenhum código de barras adicionado.
        </div>
      ) : (
        <div className={styles.barcodeList}>
          {date.barcodes.map((cb) => (
            <div key={cb.barcodesData} className={styles.barcodeItem}>
              <div className={styles.barcodeLeft}>
                <span style={{ fontWeight: 'bold' }}>{cb.barcodesData}</span>
                <span
                  onClick={() => actions.setAsPrincipal(cb.barcodesData)}
                  className={styles.barcodeRadioLabel}
                  title={cb.mainBarcode === 1 ? 'Código Principal' : 'Marcar como Principal'}
                  id={`principal-star-${cb.barcodesData}`}
                >
                  {cb.mainBarcode === 1 ? (
                    <StarIcon style={{ color: '#eab308' }} fontSize="small" />
                  ) : (
                    <StarBorderIcon style={{ color: 'var(--muted)' }} fontSize="small" />
                  )}
                  {cb.mainBarcode === 1 ? 'Principal' : 'Tornar Principal'}
                </span>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                iconOnly
                onClick={() => actions.remove(cb.barcodesData)}
                title="Remover"
                aria-label="Remover"
                id={`remove-barcode-${cb.barcodesData}`}
                leftIcon={<CloseIcon fontSize="small" />}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
};

export default BarcodeManager;