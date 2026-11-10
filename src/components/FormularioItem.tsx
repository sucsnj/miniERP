import React, { useRef, useState } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import styles from '../styles/produtos.module.css';
import importStyles from '../styles/modalImport.module.css';
import FormularioProduto from './FormularioProduto';
import FormularioServico from './FormularioServico';
import type { ProdutoFormData, ProdutoOptions, ProdutoActions } from './FormularioProduto';
import ImportExportIcon from '@mui/icons-material/ImportExport';

interface FormularioItemProps {
    onImportXML: (file?: File) => void;
    editarProdutoId: number | null;
    form: ProdutoFormData;
    setForm: Dispatch<SetStateAction<ProdutoFormData>>;
    options: ProdutoOptions;
    actions: ProdutoActions;
    inputRef: RefObject<HTMLInputElement | null>;
}

const FormularioItem: React.FC<FormularioItemProps> = ({
    onImportXML,
    editarProdutoId,
    form,
    setForm,
    options,
    actions,
    inputRef,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onImportXML(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onImportXML(file);
    };

    return (
        <>
            <div className={styles.formHeader}>
                <div className={styles.formGroupHeader}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="form-tipo">
                            Tipo:
                        </label>
                        <select
                            id="form-tipo"
                            className={styles.selectField}
                            value={form.tipo}
                            onChange={(e) => setForm(prev => ({ ...prev, tipo: e.target.value as 'PRODUTO' | 'SERVICO' }))}
                        >
                            <option value="PRODUTO">Produto</option>
                            <option value="SERVICO">Serviço</option>
                        </select>

                    </div>
                    <div
                        className={`${importStyles.dropZone} ${isDragOver ? importStyles.dropZoneActive : ''}`}
                        style={{ padding: '8px 16px', minHeight: 'auto', gap: '8px', flexDirection: 'row', cursor: 'pointer' }}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Área para soltar arquivo XML"
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                        <ImportExportIcon className="material-icon" fontSize="small" style={{ margin: 0, color: 'inherit' }} />
                        <span style={{ fontSize: '0.85rem', color: 'inherit' }}>Arraste XML NF-e ou Clique</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xml"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            id="xml-file-input-inline"
                        />
                    </div>
                </div>
            </div>

            {form.tipo === 'PRODUTO' ? (
                <FormularioProduto
                    editarProdutoId={editarProdutoId}
                    form={form}
                    setForm={setForm}
                    options={options}
                    inputRef={inputRef}
                    actions={actions}
                />
            ) : (
                <FormularioServico
                    editarProdutoId={editarProdutoId}
                    form={form}
                    setForm={setForm}
                    options={options}
                    inputRef={inputRef}
                    actions={actions}
                />
            )}
        </>
    );
};

export default FormularioItem;