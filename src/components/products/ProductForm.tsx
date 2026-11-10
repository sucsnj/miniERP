import styles from '../../styles/produtos.module.css';
import AddIcon from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@/components/common/Button';
import { parseNumber } from '../../utils/number';
import { calculateMargin, calculateSalePrice } from '../../utils/productPrice';
import {
    addUnit,
    removeUnit,
    setUnitAsPrincipal,
    updateUnitId,
    updateUnitMultiplier,
} from '../../utils/productUnits';
import {
    CategoryData,
    BrandData,
    UnitOfMeasureData,
    SupplierData
} from '../../services/produtosService';

export interface ProductFormData {
    type: 'PRODUTO' | 'SERVICO';
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
    supplierId: number;
    purchasePrice: string;
    profitMargin: string;
    salePrice: string;
    stock: string;
    unitMultiplier: string;
    unitOfMeasureId: number;
    internalCode: string;
    reference: string;
    durationMinutes: string;
    active: number;
    unitsOfMeasure: { unitOfMeasureId: number; unitMultiplier: string; isPrincipal: boolean }[];
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
    editingProductId: number | null;
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
                            setForm(prev => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                    >
                        {options.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
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
                            setForm(prev => ({ ...prev, brandId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                    >
                        {options.brands.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nome}
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
                            setForm(prev => ({ ...prev, supplierId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                    >
                        {options.suppliers.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.nome}
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
                                checked={un.isPrincipal}
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
                                        Number(e.target.value)
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
                                        {u.sigla} - {u.descricao}
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
                        onClick={actions.openUnitOfMeasureModal}
                        title="Cadastrar Unidade no Sistema"
                    >
                        Cadastro de Unidades
                    </Button>
                </div>
            </div>

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
