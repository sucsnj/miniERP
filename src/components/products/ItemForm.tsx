import React from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import styles from '../../styles/products.module.css';
import ProductForm from './ProductForm';
import ServiceForm from './ServiceForm';
import type { ProductFormData, ProductOptions, ProductActions } from './ProductForm';

interface ItemFormProps {
    editingProductId: string | null;
    form: ProductFormData;
    setForm: Dispatch<SetStateAction<ProductFormData>>;
    options: ProductOptions;
    actions: ProductActions;
    inputRef: RefObject<HTMLInputElement | null>;
}

const ItemForm: React.FC<ItemFormProps> = ({
    editingProductId,
    form,
    setForm,
    options,
    actions,
    inputRef,
}) => {
    return (
        <>
            <div className={styles.formHeader}>
                <div className={styles.formRow}>
                    <div className={styles.formField}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="form-tipo">
                                Tipo:
                            </label>
                            <select
                                id="form-tipo"
                                className={styles.selectField}
                                value={form.type}
                                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as 'PRODUCT' | 'SERVICE' }))}
                            >
                                <option value="PRODUCT">Produto</option>
                                <option value="SERVICE">Serviço</option>
                            </select>
                        </div>
                    </div>
                    {form.type === 'PRODUCT' && (
                        <div className={styles.formField}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="form-ativo">
                                    Ativo:
                                </label>
                                <select
                                    id="form-ativo"
                                    className={styles.selectField}
                                    value={form.active}
                                    onChange={(e) => setForm(prev => ({ ...prev, active: Number(e.target.value) }))}
                                >
                                    <option value={1}>Sim</option>
                                    <option value={0}>Não</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {form.type === 'PRODUCT' ? (
                <ProductForm
                    editingProductId={editingProductId}
                    form={form}
                    setForm={setForm}
                    options={options}
                    inputRef={inputRef}
                    actions={actions}
                />
            ) : (
                <ServiceForm
                    editingProductId={editingProductId}
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

export default ItemForm;