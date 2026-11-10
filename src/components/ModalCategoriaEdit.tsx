import { useState, useRef } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import { CategoriaFormData, CategoriaOptions } from '@/types/categoria';
import { ModalCatExclusao } from '@/components/ModalProdExclusao';

interface ModalCategoriaEditProps {
    catForm: CategoriaFormData;
    setCatForm: React.Dispatch<React.SetStateAction<CategoriaFormData>>;
    onDelete: () => void;
    options: CategoriaOptions;
}

const ModalCategoriaEdit: React.FC<ModalCategoriaEditProps> = ({
    catForm,
    setCatForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-cat-edit-title" tabIndex={-1}>
                <h3 id="modal-cat-edit-title" className={styles.modalTitle}>Editar Categoria</h3>
                <form onSubmit={options.salvarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-cat-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da categoria"
                            value={catForm.nome}
                            onChange={(e) => setCatForm({ ...catForm, nome: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-cat-desc">
                            Descrição:
                        </label>
                        <input
                            id="edit-cat-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={catForm.descricao}
                            onChange={(e) => setCatForm({ ...catForm, descricao: e.target.value })}
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
                        <button type="submit" className={styles.primaryButton} id="update-cat-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.abrirModalCategoria();
                                setCatForm({ nome: '', descricao: '' });
                            }}
                            id="cancel-edit-cat-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <ModalCatExclusao
                    open={deleteConfirmOpen}
                    categoria={catForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.abrirModalCategoria(); // fecha modal de edição
                        setCatForm({ nome: '', descricao: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default ModalCategoriaEdit;