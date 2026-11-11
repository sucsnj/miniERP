import styles from '../../styles/products.module.css';
import AddIcon from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import Button from '@/components/common/Button';
import ProductPriceSection from './ProductPriceSection';
import ProductUnitsSection from './ProductUnitsSection';
import {
    CategoryData,
    BrandData,
    UnitOfMeasureData,
    SupplierData
} from '../../services/productsService';

export interface ProductFormData {
    type: 'PRODUCT' | 'SERVICE';
    name: string;
    description: string;
    categoryId: string;
    brandId: string;
    supplierId: string;
    purchasePrice: string;
    profitMargin: string;
    salePrice: string;
    stock: string;
    unitMultiplier: string;
    unitOfMeasureId: string;
    internalCode: string;
    reference: string;
    durationMinutes: string;
    active: number;
    unitsOfMeasure: { unitOfMeasureId: string; unitMultiplier: string; isMain: boolean }[];
}

export interface ProductOptions {
    categories: CategoryData[];
    brands: BrandData[];
    suppliers: SupplierData[];
    unitsOfMeasure: UnitOfMeasureData[];
}

export interface ProductActions {
    openCategoryModal: () => void;
    openBrandModal: () => void;
    openSupplierModal: () => void;
    openUnitOfMeasureModal: () => void;
    openStockAdjustModal: () => void;
    editCategory: (category: CategoryData) => void;
    editBrand: (brand: BrandData) => void;
    editSupplier: (supplier: SupplierData) => void;
    editUnitOfMeasure: (unitOfMeasure: UnitOfMeasureData) => void;
}

// Props do Componente
interface ProductFormProps {
    editingProductId: string | null;
    form: ProductFormData;
    setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
    options: ProductOptions;
    actions: ProductActions;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

const ProductForm: React.FC<ProductFormProps> = ({
    editingProductId,
    form,
    setForm,
    options,
    inputRef,
    actions,
}) => {
    return (
        <div>
            <div className={styles.formHeader}>
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

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-nome">
                    Nome:*
                </label>
                <input
                    id="form-nome"
                    ref={inputRef}
                    type="text"
                    className={styles.inputField}
                    placeholder="Nome do item"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-descricao">
                    Descrição:
                </label>
                <textarea
                    id="form-descricao"
                    className={styles.textareaField}
                    placeholder="Detalhes ou especificações"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-categoria">
                    Categoria:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-categoria"
                        className={styles.selectField}
                        value={form.categoryId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, categoryId: e.target.value || '' }))
                        }
                    >
                        {options.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        iconOnly
                        onClick={actions.openCategoryModal}
                        title="Adicionar Categoria"
                        aria-label="Adicionar Categoria"
                        id="add-categoria-btn"
                        leftIcon={<AddIcon fontSize="small" />}
                    />
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de categorias */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        iconOnly
                        onClick={() => {
                            const selectedCategory = options.categories.find(
                                (c) => c.id === form.categoryId
                            );
                            if (selectedCategory) {
                                actions.editCategory(selectedCategory);
                            }
                        }}
                        title="Editar Categoria Selecionada"
                        aria-label="Editar Categoria Selecionada"
                        id="edit-categoria-btn"
                        leftIcon={<MoreVert fontSize="small" />}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-marca">
                    Marca:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-marca"
                        className={styles.selectField}
                        value={form.brandId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, brandId: e.target.value || '' }))
                        }
                    >
                        {options.brands.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        iconOnly
                        onClick={() => actions.openBrandModal()}
                        title="Adicionar Marca"
                        aria-label="Adicionar Marca"
                        id="add-marca-btn"
                        leftIcon={<AddIcon fontSize="small" />}
                    />
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de marcas*/}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        iconOnly
                        onClick={() => {
                            const selectedBrand = options.brands.find(
                                (m) => m.id === form.brandId
                            );
                            if (selectedBrand) {
                                actions.editBrand(selectedBrand);
                            }
                        }}
                        title="Editar Marca Selecionada"
                        aria-label="Editar Marca Selecionada"
                        id="edit-marca-btn"
                        leftIcon={<MoreVert fontSize="small" />}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-fornecedor">
                    Fornecedor:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-fornecedor"
                        className={styles.selectField}
                        value={form.supplierId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, supplierId: e.target.value || '' }))
                        }
                    >
                        {options.suppliers.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        iconOnly
                        onClick={actions.openSupplierModal}
                        title="Adicionar Fornecedor"
                        aria-label="Adicionar Fornecedor"
                        id="add-fornecedor-btn"
                        leftIcon={<AddIcon fontSize="small" />}
                    />
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de fornecedores*/}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        iconOnly
                        onClick={() => {
                            const selectedSupplier = options.suppliers.find(
                                (f) => f.id === form.supplierId
                            );
                            if (selectedSupplier) {
                                actions.editSupplier(selectedSupplier);
                            }
                        }}
                        title="Editar Fornecedor Selecionado"
                        aria-label="Editar Fornecedor Selecionado"
                        id="edit-fornecedor-btn"
                        leftIcon={<MoreVert fontSize="small" />}
                    />
                </div>
            </div>

            <ProductPriceSection
                editingProductId={editingProductId}
                form={form}
                setForm={setForm}
                actions={actions}
            />

            <ProductUnitsSection
                form={form}
                setForm={setForm}
                options={options}
                onOpenUnitOfMeasureModal={actions.openUnitOfMeasureModal}
            />


            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-cod-interno">
                    Código Interno:
                </label>
                <input
                    id="form-cod-interno"
                    type="text"
                    className={styles.inputField}
                    placeholder={editingProductId ? "Código Interno não pode ser alterado" : "Ex: PROD-001 (preenchido automaticamente caso deixado em branco)"}
                    value={form.internalCode}
                    onChange={(e) => setForm(prev => ({ ...prev, internalCode: e.target.value }))}
                    disabled={!!editingProductId}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-referencia">
                    Referência:
                </label>
                <input
                    id="form-referencia"
                    type="text"
                    className={styles.inputField}
                    placeholder="Ex: REF-001"
                    value={form.reference}
                    onChange={(e) => setForm(prev => ({ ...prev, reference: e.target.value }))}
                />
            </div>
        </div>
    )
};

export default ProductForm;
