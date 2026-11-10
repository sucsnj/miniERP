import { useRef } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import {
    ItemData,
} from '../services/produtosService';

interface ModalProdExclusaoProps {
    open: boolean;
    item: ItemData | null;
    onConfirm: () => void;
    onClose: () => void;
}

interface ModalCatExclusaoProps {
    open: boolean;
    categoria: { nome: string; descricao?: string };
    onConfirm: () => void;
    onClose: () => void;
}

interface ModalMarcaExclusaoProps {
    open: boolean;
    marca: { nome: string };
    onConfirm: () => void;
    onClose: () => void;
}

interface ModalFornecedorExclusaoProps {
    open: boolean;
    fornecedor: { nome: string };
    onConfirm: () => void;
    onClose: () => void;
}

interface ModalUomExclusaoProps {
    open: boolean;
    unidadeMedida: { sigla: string; descricao?: string };
    onConfirm: () => void;
    onClose: () => void;
}

const ModalProdExclusao: React.FC<ModalProdExclusaoProps> = ({
    open,
    item,
    onConfirm,
    onClose,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open || !item) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-delete-title" tabIndex={-1}>
                <h3 id="modal-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>
                    Tem certeza de que deseja excluir o item{' '}
                    <strong>{item.nome}</strong>?
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                    Esta ação é irreversível e excluirá todos os códigos de barras associados a ele.
                </p>
                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={onConfirm}
                        style={{ backgroundColor: 'var(--danger)' }}
                        id="confirm-delete-action-btn"
                    >
                        Excluir
                    </button>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onClose}
                        id="cancel-delete-action-btn"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
};

export const ModalCatExclusao: React.FC<ModalCatExclusaoProps> = ({ open, categoria, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-cat-delete-title" tabIndex={-1}>
                <h3 id="modal-cat-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a categoria <strong>{categoria.nome}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-cat-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-cat-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ModalMarcaExclusao: React.FC<ModalMarcaExclusaoProps> = ({ open, marca, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-mar-delete-title" tabIndex={-1}>
                <h3 id="modal-mar-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a marca <strong>{marca.nome}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-mar-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-mar-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ModalFornecedorExclusao: React.FC<ModalFornecedorExclusaoProps> = ({ open, fornecedor, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-fornecedor-delete-title" tabIndex={-1}>
                <h3 id="modal-fornecedor-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir o fornecedor <strong>{fornecedor.nome}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-fornecedor-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-fornecedor-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ModalUomExclusao: React.FC<ModalUomExclusaoProps> = ({ open, unidadeMedida, onConfirm, onClose }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-uom-delete-title" tabIndex={-1}>
                <h3 id="modal-uom-delete-title" className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a unidade de medida <strong>{unidadeMedida.sigla}</strong>?</p>
                <div className={styles.modalActions}>
                    <button className={styles.deleteButton} onClick={onConfirm} id="confirm-delete-uom-btn">
                        Excluir
                    </button>
                    <button className={styles.secondaryButton} onClick={onClose} id="cancel-delete-uom-btn">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalProdExclusao;