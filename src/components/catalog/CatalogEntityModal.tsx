import { useRef, useState } from 'react';
import { useFocusTrap } from '../../utils/focus';
import styles from '../../styles/produtos.module.css';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/common/Button';

export interface CatalogEntityField {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    required?: boolean;
    autoFocus?: boolean;
    onChange: (value: string) => void;
}

interface CatalogDeleteAction {
    title: string;
    message: React.ReactNode;
    confirmButtonId: string;
    cancelButtonId: string;
    onConfirm: () => void;
}

interface CatalogEntityModalProps {
    title: string;
    titleId: string;
    fields: CatalogEntityField[];
    submitLabel: string;
    submitButtonId: string;
    cancelButtonId: string;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onClose: () => void;
    deleteAction?: CatalogDeleteAction;
}

const CatalogEntityModal: React.FC<CatalogEntityModalProps> = ({
    title,
    titleId,
    fields,
    submitLabel,
    submitButtonId,
    cancelButtonId,
    onSubmit,
    onClose,
    deleteAction,
}) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    const handleDelete = () => {
        if (!deleteAction) return;
        setDeleteConfirmOpen(false);
        deleteAction.onConfirm();
        onClose();
    };

    return (
        <>
            <div className={styles.modalOverlay} role="presentation">
                <div
                    className={styles.modalContent}
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    tabIndex={-1}
                >
                    <h3 id={titleId} className={styles.modalTitle}>{title}</h3>
                    <form className={styles.modalForm} onSubmit={onSubmit}>
                        {fields.map((field) => (
                            <div key={field.id} className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor={field.id}>
                                    {field.label}
                                </label>
                                <input
                                    id={field.id}
                                    type="text"
                                    className={styles.inputField}
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(event) => field.onChange(event.target.value)}
                                    required={field.required}
                                    autoFocus={field.autoFocus}
                                />
                            </div>
                        ))}
                        <div className={styles.modalActions}>
                            {deleteAction && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    id="confirm-delete-action-btn"
                                >
                                    Excluir
                                </Button>
                            )}
                            <Button type="submit" variant="success" id={submitButtonId}>
                                {submitLabel}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                id={cancelButtonId}
                            >
                                Fechar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {deleteAction && deleteConfirmOpen && (
                <ConfirmDialog
                    open={deleteConfirmOpen}
                    title={deleteAction.title}
                    message={deleteAction.message}
                    confirmText="Excluir"
                    cancelText="Cancelar"
                    danger
                    confirmButtonId={deleteAction.confirmButtonId}
                    cancelButtonId={deleteAction.cancelButtonId}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirmOpen(false)}
                />
            )}
        </>
    );
};

export default CatalogEntityModal;
