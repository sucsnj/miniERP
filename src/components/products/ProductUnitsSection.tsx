import styles from '../../styles/products.module.css';
import Button from '@/components/common/Button';
import CloseIcon from '@mui/icons-material/Close';
import {
    addUnit,
    removeUnit,
    setUnitAsPrincipal,
    updateUnitId,
    updateUnitMultiplier,
} from '../../utils/productUnits';
import type { ProductFormData, ProductOptions } from './ProductForm';

interface ProductUnitsSectionProps {
    form: ProductFormData;
    setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
    options: ProductOptions;
    onOpenUnitOfMeasureModal: () => void;
}

const ProductUnitsSection: React.FC<ProductUnitsSectionProps> = ({ form, setForm, options, onOpenUnitOfMeasureModal }) => {
    return (
        <div className={`${styles.formGroup} ${styles.unitsSection}`}>
            <div className={styles.unitsHeader}>
                <label className={styles.formLabel}>Unidades de Medida</label>
                <span className={styles.helperText}>Selecione a unidade principal do item</span>
            </div>

            <div className={styles.unitsList}>
                {form.unitsOfMeasure?.map((un, index) => (
                    <div
                        key={index}
                        className={`${styles.unitCard} ${un.isMain ? styles.unitCardMain : ''}`}
                    >
                        {/* Topo do card no mobile / Esquerda no desktop */}
                        <div className={styles.unitCardHeader}>
                            <label className={styles.mainRadioLabel}>
                                <input
                                    type="radio"
                                    name="unidadePrincipal"
                                    checked={un.isMain}
                                    onChange={() => {
                                        const { units, unitOfMeasureId, unitMultiplier } = setUnitAsPrincipal(
                                            form.unitsOfMeasure,
                                            index
                                        );
                                        setForm(prev => ({
                                            ...prev,
                                            unitsOfMeasure: units,
                                            unitOfMeasureId,
                                            unitMultiplier,
                                        }));
                                    }}
                                />
                                <span>Principal</span>
                            </label>

                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            iconOnly
                            disabled={form.unitsOfMeasure.length <= 1}
                            onClick={() => {
                                const { units, unitOfMeasureId, unitMultiplier } = removeUnit(
                                    form.unitsOfMeasure,
                                    index
                                );
                                    setForm(prev => ({
                                        ...prev,
                                        unitsOfMeasure: units,
                                        ...(unitOfMeasureId !== undefined ? { unitOfMeasureId } : {}),
                                        ...(unitMultiplier !== undefined ? { unitMultiplier } : {}),
                                    }));
                                }}
                                title="Remover unidade"
                                aria-label="Remover unidade"
                                leftIcon={<CloseIcon fontSize="small" />}
                            />
                        </div>

                        {/* Campos de entrada */}
                        <div className={styles.unitFields}>
                            <div className={styles.fieldWrapper}>
                                <span className={styles.miniLabel}>Unidade</span>
                                <select
                                    className={styles.selectField}
                                    value={un.unitOfMeasureId}
                                    onChange={(e) => {
                                        const { units, unitOfMeasureId } = updateUnitId(
                                            form.unitsOfMeasure,
                                            index,
                                            e.target.value
                                        );
                                        setForm(prev => ({
                                            ...prev,
                                            unitsOfMeasure: units,
                                            ...(unitOfMeasureId !== undefined ? { unitOfMeasureId } : {}),
                                        }));
                                    }}
                                >
                                    {options.unitsOfMeasure.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.abbreviation} - {u.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldWrapper}>
                                <span className={styles.miniLabel}>Fator</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className={styles.inputField}
                                    placeholder="Ex: 1"
                                    value={un.unitMultiplier}
                                    onChange={(e) => {
                                        const { units, unitMultiplier } = updateUnitMultiplier(
                                            form.unitsOfMeasure,
                                            index,
                                            e.target.value
                                        );
                                        setForm(prev => ({
                                            ...prev,
                                            unitsOfMeasure: units,
                                            ...(unitMultiplier !== undefined ? { unitMultiplier } : {}),
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.unitsActions}>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setForm(p => ({
                            ...p,
                            unitsOfMeasure: addUnit(p.unitsOfMeasure || []),
                        }));
                    }}
                >
                    + Nova Unidade
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenUnitOfMeasureModal}
                    title="Cadastrar Unidade no Sistema"
                >
                    Cadastro de Unidades
                </Button>
            </div>
        </div>
    );
};

export default ProductUnitsSection;
