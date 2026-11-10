import { useRef } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';

interface ModalFornecedorProps {
    setModalFornecedorOpen: (value: boolean) => void;
    novoFornecedorNome: string;
    setNovoFornecedorNome: (value: string) => void;
    handleSalvarFornecedor: (e: React.FormEvent) => void;
}

const ModalFornecedor: React.FC<ModalFornecedorProps> = ({
    setModalFornecedorOpen,
    novoFornecedorNome,
    setNovoFornecedorNome,
    handleSalvarFornecedor,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-fornecedor-title" tabIndex={-1}>
                <h3 id="modal-fornecedor-title" className={styles.modalTitle}>Adicionar Fornecedor</h3>
                <form onSubmit={handleSalvarFornecedor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-fornecedor-nome">
                            Nome:*
                        </label>
                        <input
                            id="new-fornecedor-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome do fornecedor"
                            value={novoFornecedorNome}
                            onChange={(e) => setNovoFornecedorNome(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.primaryButton} id="save-new-fornecedor-btn">
                            Salvar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                setModalFornecedorOpen(false);
                                setNovoFornecedorNome('');
                            }}
                            id="cancel-new-fornecedor-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default ModalFornecedor;