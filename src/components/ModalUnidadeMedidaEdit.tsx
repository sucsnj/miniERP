import { useState, useRef } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import { ModalUomExclusao } from '@/components/ModalProdExclusao';

export interface UnidadeMedidaFormData {
    sigla: string;
    descricao: string;
}

export interface UnidadeMedidaOptions {
    abrirModalUnidadeMedida: () => void;
    salvarUnidadeMedida: React.FormEventHandler<HTMLFormElement>;
}

interface ModalUnidadeMedidaEditProps {
    uomForm: UnidadeMedidaFormData;
    setUomForm: React.Dispatch<React.SetStateAction<UnidadeMedidaFormData>>;
    onDelete: () => void;
    options: UnidadeMedidaOptions;
}

const ModalUnidadeMedidaEdit: React.FC<ModalUnidadeMedidaEditProps> = ({
    uomForm,
    setUomForm,
    onDelete,
    options,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);
    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-uom-edit-title" tabIndex={-1}>
                <h3 id="modal-uom-edit-title" className={styles.modalTitle}>Editar Unidade de Medida</h3>
                <form onSubmit={options.salvarUnidadeMedida} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-uom-sigla">
                            Sigla:*
                        </label>
                        <input
                            id="edit-uom-sigla"
                            type="text"
                            className={styles.inputField}
                            placeholder="Sigla da Unidade de Medida"
                            value={uomForm.sigla}
                            onChange={(e) => setUomForm({ ...uomForm, sigla: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="edit-uom-desc">
                            Descrição:
                        </label>
                        <input
                            id="edit-uom-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={uomForm.descricao}
                            onChange={(e) => setUomForm({ ...uomForm, descricao: e.target.value })}
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
                        <button type="submit" className={styles.primaryButton} id="update-uom-btn">
                            Atualizar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.abrirModalUnidadeMedida();
                                setUomForm({ sigla: '', descricao: '' });
                            }}
                            id="cancel-edit-uom-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
            {deleteConfirmOpen && (
                <ModalUomExclusao
                    open={deleteConfirmOpen}
                    unidadeMedida={uomForm}
                    onConfirm={() => {
                        onDelete();
                        setDeleteConfirmOpen(false);
                        options.abrirModalUnidadeMedida(); // fecha modal de edição
                        setUomForm({ sigla: '', descricao: '' }); // limpa formulário
                    }}
                    onClose={() => setDeleteConfirmOpen(false)}
                />
            )}
        </div>
    )
};

export default ModalUnidadeMedidaEdit;