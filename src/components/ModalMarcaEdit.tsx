import { useState, useRef } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import { ModalMarcaExclusao } from '@/components/ModalProdExclusao';

export interface MarcaFormData {
    nome: string;
}

export interface MarcaOptions {
    abrirModalMarca: () => void;
    salvarMarca: React.FormEventHandler<HTMLFormElement>;
}

interface ModalMarcaEditProps {
    marcaForm: MarcaFormData;
    setMarcaForm: React.Dispatch<React.SetStateAction<MarcaFormData>>;
    onDelete: () => void;
    options: MarcaOptions;
}

const ModalMarcaEdit: React.FC<ModalMarcaEditProps> = ({
    marcaForm,
    setMarcaForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-mar-edit-title" tabIndex={-1}>
                <h3 id="modal-mar-edit-title" className={styles.modalTitle}>Editar Marca</h3>
                <form onSubmit={options.salvarMarca} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-mar-nome">
                            Nome:*
                        </label>
                        <input
                            id="edit-mar-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da marca"
                            value={marcaForm.nome}
                            onChange={(e) => setMarcaForm({ ...marcaForm, nome: e.target.value })}
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
                        <button type="submit" className={styles.primaryButton} id="update-mar-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.abrirModalMarca();
                                setMarcaForm({ nome: '' });
                            }}
                            id="cancel-edit-mar-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <ModalMarcaExclusao
                    open={deleteConfirmOpen}
                    marca={marcaForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.abrirModalMarca(); // fecha modal de edição
                        setMarcaForm({ nome: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default ModalMarcaEdit;