import { useRef } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import { CategoriaFormData, CategoriaOptions } from '@/types/categoria';

interface ModalAddCategoriaProps {
    catForm: CategoriaFormData;
    setCatForm: React.Dispatch<React.SetStateAction<CategoriaFormData>>;
    options: CategoriaOptions;
}

const ModalAddCategoria: React.FC<ModalAddCategoriaProps> = ({
    catForm,
    setCatForm,
    options,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    return (
        <div className={styles.modalOverlay} role="presentation">
            <div className={styles.modalContent} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-cat-title" tabIndex={-1}>
                <h3 id="modal-cat-title" className={styles.modalTitle}>Adicionar Categoria</h3>
                <form onSubmit={options.salvarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-cat-nome">
                            Nome:*
                        </label>
                        <input
                            id="new-cat-nome"
                            type="text"
                            className={styles.inputField}
                            placeholder="Nome da categoria"
                            value={catForm.nome}
                            onChange={(e) => setCatForm(prev => ({ ...prev, nome: e.target.value }))}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="new-cat-desc">
                            Descrição:
                        </label>
                        <input
                            id="new-cat-desc"
                            type="text"
                            className={styles.inputField}
                            placeholder="Descrição opcional"
                            value={catForm.descricao}
                            onChange={(e) => setCatForm(prev => ({ ...prev, descricao: e.target.value }))}
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.primaryButton} id="save-new-cat-btn">
                            Salvar
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                options.abrirModalCategoria();
                                setCatForm({ nome: '', descricao: '' });
                            }}
                            id="cancel-new-cat-btn"
                        >
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default ModalAddCategoria;