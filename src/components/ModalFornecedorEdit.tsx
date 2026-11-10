import { useState, useRef } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import { ModalFornecedorExclusao } from '@/components/ModalProdExclusao';

export interface FornecedorFormData {
    nome: string;
}

export interface FornecedorOptions {
    abrirModalFornecedor: () => void;
    salvarFornecedor: React.FormEventHandler<HTMLFormElement>;
}

interface ModalFornecedorEditProps {
    fornecedorForm: FornecedorFormData;
    setFornecedorForm: React.Dispatch<React.SetStateAction<FornecedorFormData>>;
    onDelete: () => void;
    options: FornecedorOptions;
}

const ModalFornecedorEdit: React.FC<ModalFornecedorEditProps> = ({
    fornecedorForm,
    setFornecedorForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-fornecedor-edit-title" tabIndex={-1}>
                <h3 id="modal-fornecedor-edit-title" className={styles.modalTitle}>Editar Fornecedor</h3>
                <form onSubmit={options.salvarFornecedor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-fornecedor-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-fornecedor-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome do fornecedor"
                            value={fornecedorForm.nome}
                            onChange={(e) => setFornecedorForm({ ...fornecedorForm, nome: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => {
                                setDeleteConfirmOpen(true)
                            }}
                            id="confirm-delete-action-btn"
                        >
                            Excluir
                        </button>
                        <button type="submit" className={styles.primaryButton} id="update-fornecedor-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.abrirModalFornecedor();
                                setFornecedorForm({ nome: '' });
                            }}
                            id="cancel-edit-fornecedor-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <ModalFornecedorExclusao
                    open={deleteConfirmOpen}
                    fornecedor={fornecedorForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.abrirModalFornecedor(); // fecha modal de edição
                        setFornecedorForm({ nome: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default ModalFornecedorEdit;