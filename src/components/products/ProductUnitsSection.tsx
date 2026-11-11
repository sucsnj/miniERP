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
        <div className={styles.formGroup} style={{ width: '100%', marginBottom: '1.5rem' }}>
            <label className={styles.formLabel}>
                Unidades de Medida:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {form.unitsOfMeasure?.map((un, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                        <input
                            type="radio"
                            name="unidadePrincipal"
                            checked={un.isMain}
                            onChange={() => {
                                const { units, unitOfMeasureId, unitMultiplier } = setUnitAsPrincipal(
                                    form.unitsOfMeasure,
                                    index
                                );
                                setForm(prev => ({ ...prev, unitsOfMeasure: units, unitOfMeasureId, unitMultiplier }));
                            }}
                            title="Definir como Principal"
                            style={{ margin: '0 0.5rem' }}
                        />

                        <select
                            className={styles.selectField}
                            style={{ flex: 1 }}
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

                        <input
                            type="text"
                            inputMode="decimal"
                            className={styles.inputField}
                            style={{ width: '100px' }}
                            placeholder="Fator"
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

                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            iconOnly
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
                            title="Remover"
                            aria-label="Remover"
                            leftIcon={<CloseIcon fontSize="small" />}
                        />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
