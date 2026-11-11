import styles from '../../styles/products.module.css';
import Button from '@/components/common/Button';
import { parseNumber } from '../../utils/number';
import { calculateMargin, calculateSalePrice } from '../../utils/productPrice';
import type { ProductFormData, ProductActions } from './ProductForm';

interface ProductPriceSectionProps {
    editingProductId: string | null;
    form: ProductFormData;
    setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
    actions: ProductActions;
}

const ProductPriceSection: React.FC<ProductPriceSectionProps> = ({
    editingProductId,
    form,
    setForm,
    actions,
}) => {
    return (
        <>
            <label className={styles.formLabel}>Preço, margem e estoque</label>
            <div className={styles.valoresGroup}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-preco-compra">
                        Compra:
                    </label>
                    <input
                        id="form-preco-compra"
                        type="text"
                        inputMode="decimal"
                        className={styles.inputField}
                        placeholder="0,00"
                        value={form.purchasePrice}
                        onChange={(e) => {
                            const purchasePrice = e.target.value;
                            const purchaseValue = parseNumber(purchasePrice);
                            const saleValue = parseNumber(form.salePrice);
                            const marginValue = parseNumber(form.profitMargin);

                            if (!Number.isNaN(purchaseValue) && purchaseValue >= 0 && !Number.isNaN(marginValue)) {
                                const newSalePrice = calculateSalePrice(purchaseValue, marginValue);
                                setForm(prev => ({ ...prev, purchasePrice, salePrice: String(newSalePrice) }));
                                return;
                            }

                            if (!Number.isNaN(purchaseValue) && purchaseValue > 0 && !Number.isNaN(saleValue)) {
                                const newMargin = calculateMargin(purchaseValue, saleValue);
                                setForm(prev => ({ ...prev, purchasePrice, profitMargin: String(newMargin) }));
                                return;
                            }

                            setForm(prev => ({ ...prev, purchasePrice }));
                        }}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-margem-lucro">
                        Margem (%):
                    </label>
                    <input
                        id="form-margem-lucro"
                        type="text"
                        inputMode="decimal"
                        className={styles.inputField}
                        placeholder="0"
                        value={form.profitMargin}
                        onChange={(e) => {
                            const profitMargin = e.target.value;
                            const purchaseValue = parseNumber(form.purchasePrice);
                            const marginValue = parseNumber(profitMargin);

                            if (!Number.isNaN(purchaseValue) && purchaseValue >= 0 && !Number.isNaN(marginValue)) {
                                const newSalePrice = calculateSalePrice(purchaseValue, marginValue);
                                setForm(prev => ({ ...prev, profitMargin, salePrice: String(newSalePrice) }));
                                return;
                            }

                            setForm(prev => ({ ...prev, profitMargin }));
                        }}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-preco-venda">
                        Venda:
                    </label>
                    <input
                        id="form-preco-venda"
                        type="text"
                        inputMode="decimal"
                        className={styles.inputField}
                        placeholder="0,00"
                        value={form.salePrice}
                        onChange={(e) => {
                            const salePrice = e.target.value;
                            const purchaseValue = parseNumber(form.purchasePrice);
                            const saleValue = parseNumber(salePrice);

                            if (!Number.isNaN(purchaseValue) && purchaseValue > 0 && !Number.isNaN(saleValue)) {
                                const newMargin = calculateMargin(purchaseValue, saleValue);
                                setForm(prev => ({ ...prev, salePrice, profitMargin: String(newMargin) }));
                                return;
                            }

                            setForm(prev => ({ ...prev, salePrice }));
                        }}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-estoque">
                        Estoque:
                    </label>
                    {editingProductId ? (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={actions.openStockAdjustModal}
                            id="open-ajuste-estoque-btn"
                        >
                            Ajustar
                        </Button>
                    ) : (
                        <input
                            id="form-estoque"
                            type="text"
                            inputMode="numeric"
                            className={styles.inputField}
                            placeholder="0"
                            value={form.stock}
                            onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductPriceSection;
