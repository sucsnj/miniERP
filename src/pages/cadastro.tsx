import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/produtos.module.css';
import Button from '@/components/common/Button';
import { useToast } from '../hooks/useToast';
import {
    fetchProducts,
    fetchServices,
    registerProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    fetchBrands,
    fetchSuppliers,
    fetchUnitsOfMeasure,
    fetchStockMovements,
    registerService,
    updateService,
    deleteService,
    ItemData,
    ServiceData,
    BarcodeData,
    StockMovementData,
} from '../services/produtosService';
import { parseNumber } from '../utils/number';
import { validateNumber, validateRequired } from '../utils/validation';
import BarcodeManager from '@/components/common/BarcodeManager';
import ItemForm from '@/components/products/ItemForm';
import CatalogEntityModal from '@/components/catalog/CatalogEntityModal';
import ProductDeleteModal from '@/components/products/ProductDeleteModal';
import StockAdjustModal from '@/components/products/StockAdjustModal';
import ImportItemsModal from '@/components/import/ImportItemsModal';
import { ProductFormData, ProductOptions } from '@/components/products/ProductForm';
import { useCategory } from '@/hooks/useCategory';
import { useBrand } from '@/hooks/useBrand';
import { useSupplier } from '@/hooks/useSupplier';
import { useUnitOfMeasure } from '@/hooks/useUnitOfMeasure';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';

const RegistrationPage: React.FC = () => {

    const router = useRouter();

    // Listas auxiliares para dropdowns
    const [options, setOptions] = useState<ProductOptions>({
        categories: [],
        brands: [],
        suppliers: [],
        unitsOfMeasure: [],
    });

    // Estado do formulário de Cadastro/Edição
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ProductFormData>({
        type: 'PRODUTO',
        name: '',
        description: '',
        categoryId: 1,
        brandId: 1,
        supplierId: 1,
        purchasePrice: '',
        profitMargin: '',
        salePrice: '',
        stock: '',
        unitMultiplier: '1',
        unitOfMeasureId: 1,
        internalCode: '',
        reference: '',
        durationMinutes: '',
        active: 1,
        unitsOfMeasure: [{ unitOfMeasureId: 1, unitMultiplier: '1', isPrincipal: true }],
    });
    const [stockAdjustModalOpen, setStockAdjustModalOpen] = useState(false);
    const [adjustQuantity, setAdjustQuantity] = useState('');
    const [adjustDescription, setAdjustDescription] = useState('');
    const [stockMovements, setStockMovements] = useState<StockMovementData[]>([]);
    const [movementsLoading, setMovementsLoading] = useState(false);
    const [formBarcodes, setFormBarcodes] = useState<BarcodeData[]>([]);
    const [newBarcode, setNewBarcode] = useState('');

    // Modal de confirmação de exclusão
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ItemData | null>(null);

    // Modal de Importação XML
    const [modalImportOpen, setModalImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    // Notificações (toast) do store global
    const { showToast } = useToast();

    // Controle de alterações não salvas
    const [isDirty, setIsDirty] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const pendingNavUrl = useRef<string | null>(null);
    // Flag para ignorar o guard durante redirecionamento pós-salvo
    const skipDirtyGuard = useRef(false);

    // Deriva o estado "dirty": marca o formulário como editado quando o nome sai de vazio
    const [wasNameEmpty, setWasNameEmpty] = useState(true);
    const isNameFilled = form.name.trim() !== '';
    if (isNameFilled !== wasNameEmpty) {
        setWasNameEmpty(isNameFilled);
        if (isNameFilled) {
            setIsDirty(true);
        }
    }

    // Refs para focar campos
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const barcodeInputRef = useRef<HTMLInputElement | null>(null);

    // Carrega opções auxiliares
    const loadAuxiliaryData = useCallback(async () => {
        try {
            const [categories, brands, suppliers, uoms] = await Promise.all([
                fetchCategories(),
                fetchBrands(),
                fetchSuppliers(),
                fetchUnitsOfMeasure(),
            ]);
            setOptions({
        categories: categories,
        brands: brands,
        suppliers: suppliers,
                unitsOfMeasure: uoms,
            });
        } catch (error) {
            console.error(error);
            showToast('Erro ao carregar dados auxiliares (categorias, marcas, fornecedores, unidades de medida).', 'error');
        }
    }, [showToast]);

    // Preenche o formulário com os dados de um item existente
    const fillFormWithItem = useCallback((item: ItemData) => {
        setEditingId(item.id);
        setForm({
        type: item.tipo,
        name: item.nome,
        description: item.descricao || '',
            categoryId: item.categoria_id,
            brandId: item.marca_id,
            supplierId: item.fornecedor_id,
            purchasePrice: String(item.preco_compra),
            profitMargin: String(item.margem_lucro),
            salePrice: String(item.preco_venda),
        stock: String(item.estoque),
            unitMultiplier: String(item.multiplicador_unidade ?? 1),
            unitOfMeasureId: item.unidade_medida_id,
            internalCode: item.codigo_interno || '',
        reference: item.referencia || '',
            durationMinutes: String(item.duracao_minutos ?? ''),
        active: item.ativo ?? 1,
            unitsOfMeasure: item.unidades_medida ? item.unidades_medida.map(u => ({
                unitOfMeasureId: u.unidade_medida_id,
                unitMultiplier: String(u.multiplicador_unidade),
        isPrincipal: u.principal === 1,
            })) : [{ unitOfMeasureId: item.unidade_medida_id, unitMultiplier: String(item.multiplicador_unidade ?? 1), isPrincipal: true }],
        });
        setFormBarcodes(item.codigos_barras || []);
        setNewBarcode('');
        setAdjustQuantity('');
        setAdjustDescription('');
        setStockMovements([]);
        setStockAdjustModalOpen(false);
        setIsDirty(false);
        nameInputRef.current?.focus();
    }, []);

    // Carrega item pelo ID (vindo da query ?id=X) para pré-preencher o formulário de edição
    const loadItemForEditing = useCallback(async (id: number) => {
        try {
            // Tenta buscar como produto primeiro, depois como serviço
            const [productsData, servicesData] = await Promise.all([
                fetchProducts({ page: 1, pageSize: 10000 }),
                fetchServices({ page: 1, pageSize: 10000 }),
            ]);

            const allProducts: ItemData[] = productsData?.items || [];
            const allServices: ItemData[] = (servicesData?.items || []).map((service: ServiceData) => ({
                id: service.id,
        tipo: 'SERVICO',
        nome: service.nome,
        descricao: service.descricao,
                categoria_id: service.categoria_id,
                unidade_medida_id: 21,
                marca_id: 1,
                fornecedor_id: 1,
                preco_compra: 0,
                margem_lucro: 0,
                preco_venda: service.preco_venda,
        estoque: 0,
                multiplicador_unidade: 1,
                estoque_total: 0,
                codigo_interno: service.codigo_interno,
        referencia: service.referencia || '',
                duracao_minutos: service.duracao_minutos,
                data_criacao: service.data_criacao,
                data_atualizacao: service.data_atualizacao,
                categoria_nome: service.categoria_nome,
            }));

            const item = [...allProducts, ...allServices].find((i) => i.id === id);
            if (!item) {
                showToast('Item não encontrado para edição.', 'error');
                return;
            }

            fillFormWithItem(item);
        } catch (error) {
            console.error(error);
            showToast('Erro ao carregar item para edição.', 'error');
        }
    }, [showToast, fillFormWithItem]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadAuxiliaryData();
        }, 0);
        return () => clearTimeout(timer);
    }, [loadAuxiliaryData]);

    const isQueryProcessed = useRef(false);

    // Lê a query: pré-carrega para edição (?id=X) ou preenche para cadastro rápido (?novoImport=1...)
    useEffect(() => {
        if (!router.isReady || isQueryProcessed.current) return;
        const { id, novoImport: isNewImport, nome: nameParam, purchasePrice, estoque: stockParam, unidade: unitParam, ean, internalCode } = router.query;

        if (id) {
            const numId = Number(id);
            if (!isNaN(numId) && numId > 0) {
                isQueryProcessed.current = true;
                const timer = setTimeout(() => {
                    void loadItemForEditing(numId);
                }, 0);
                return () => clearTimeout(timer);
            }
        } else if (isNewImport || nameParam) {
            isQueryProcessed.current = true;
            const timer = setTimeout(() => {
                const nameValue = typeof nameParam === 'string' ? nameParam : '';
                const purchasePriceValue = typeof purchasePrice === 'string' ? purchasePrice : '';
                const stockValue = typeof stockParam === 'string' ? stockParam : '';
                const unitValue = typeof unitParam === 'string' ? unitParam.trim().toUpperCase() : '';
                const eanStr = typeof ean === 'string' ? ean.trim() : '';
                const internalCodeValue = typeof internalCode === 'string' ? internalCode.trim() : '';

                let uomId = 1;
                if (unitValue && options.unitsOfMeasure.length > 0) {
                    const foundUnit = options.unitsOfMeasure.find(
                        u => u.sigla.toUpperCase() === unitValue || u.sigla.toUpperCase().includes(unitValue)
                    );
                    if (foundUnit) uomId = foundUnit.id;
                }

                const purchasePriceNumber = parseNumber(purchasePriceValue) || 0;
                const defaultMargin = 50;
                const calculatedSalePrice = purchasePriceNumber > 0 ? (purchasePriceNumber * (1 + defaultMargin / 100)).toFixed(2) : '';

                setEditingId(null);
                setForm({
        type: 'PRODUTO',
        name: nameValue,
        description: 'Importado via XML da NF-e',
                    categoryId: 1,
                    brandId: 1,
                    supplierId: 1,
                    purchasePrice: purchasePriceValue,
                    profitMargin: purchasePriceNumber > 0 ? String(defaultMargin) : '',
                    salePrice: calculatedSalePrice,
        stock: stockValue,
                    unitMultiplier: '1',
                    unitOfMeasureId: uomId,
                    internalCode: internalCodeValue,
        reference: '',
        durationMinutes: '',
        active: 1,
                    unitsOfMeasure: [{ unitOfMeasureId: uomId, unitMultiplier: '1', isPrincipal: true }],
                });

                if (eanStr) {
                    setFormBarcodes([{ codigo_barras: eanStr, principal: 1 }]);
                } else {
                    setFormBarcodes([]);
                }

                showToast('Dados do item preenchidos para cadastro. Complete as informações e salve.', 'info');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [router.isReady, router.query, options.unitsOfMeasure, loadItemForEditing, showToast]);

    // Guard: aviso nativo do browser ao fechar aba ou recarregar página
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Guard: intercepta navegações do Next.js router (Links, router.push, etc.)
    const handleRouteChangeStart = useCallback((url: string) => {
        if (skipDirtyGuard.current || !isDirty) return;
        // Aborta a navegação
        router.events.emit('routeChangeError');
        pendingNavUrl.current = url;
        setDiscardDialogOpen(true);
        // Lança erro para cancelar o routeChange (padrão Next.js Pages Router)
        throw 'routeChange aborted by unsaved changes guard';
    }, [isDirty, router.events]);

    useEffect(() => {
        router.events.on('routeChangeStart', handleRouteChangeStart);
        return () => router.events.off('routeChangeStart', handleRouteChangeStart);
    }, [handleRouteChangeStart, router.events]);

    // Reseta Formulário
    const resetForm = () => {
        isQueryProcessed.current = false;
        setIsDirty(false);
        setEditingId(null);
        setForm({
        type: 'PRODUTO',
        name: '',
        description: '',
            categoryId: 1,
            brandId: 1,
            supplierId: 1,
            purchasePrice: '',
            profitMargin: '',
            salePrice: '',
        stock: '',
            unitMultiplier: '1',
            unitOfMeasureId: 1,
            internalCode: '',
        reference: '',
        durationMinutes: '',
        active: 1,
            unitsOfMeasure: [{ unitOfMeasureId: 1, unitMultiplier: '1', isPrincipal: true }],
        });
        setFormBarcodes([]);
        setNewBarcode('');
        setAdjustQuantity('');
        setAdjustDescription('');
        setStockMovements([]);
        setStockAdjustModalOpen(false);
        // Remove o ?id da URL sem recarregar a página
        router.replace('/cadastro', undefined, { shallow: true });
    };

    const loadMovements = async (itemId: number) => {
        setMovementsLoading(true);
        try {
            const data = await fetchStockMovements(itemId);
            setStockMovements(data.slice(0, 10));
        } catch (error) {
            console.error(error);
            showToast('Erro ao carregar histórico de movimentações.', 'error');
            setStockMovements([]);
        } finally {
            setMovementsLoading(false);
        }
    };

    // Adiciona Código de Barras ao formulário
    const handleAddBarcode = () => {
        const code = newBarcode.trim();
        const barcodeCheck = validateRequired(code, 'Código de barras');
        if (!barcodeCheck.ok) {
            showToast(barcodeCheck.message ?? 'Código de barras é obrigatório.', 'error');
            barcodeInputRef.current?.focus();
            return;
        }

        if (formBarcodes.some((c) => c.codigo_barras === code)) {
            showToast('Este código de barras já foi adicionado a este item.', 'error');
            barcodeInputRef.current?.focus();
            return;
        }

        // Se for o primeiro, ele será o principal
        const isPrincipal = formBarcodes.length === 0 ? 1 : 0;
        setFormBarcodes([...formBarcodes, { codigo_barras: code, principal: isPrincipal }]);

        setNewBarcode('');
        barcodeInputRef.current?.focus();
    };

    // Remove Código de Barras do formulário
    const handleRemoveBarcode = (code: string) => {
        const itemToRemove = formBarcodes.find((c) => c.codigo_barras === code);
        const updated = formBarcodes.filter((c) => c.codigo_barras !== code);

        // Se o removido era o principal e sobrou algum código, define o primeiro como principal
        if (itemToRemove?.principal === 1 && updated.length > 0) {
            updated[0].principal = 1;
        }

        setFormBarcodes(updated);
    };

    // Alterna o Código de Barras Principal
    const handleSetPrincipalBarcode = (code: string) => {
        const updated = formBarcodes.map((c) => ({
            ...c,
            principal: c.codigo_barras === code ? 1 : 0,
        }));
        setFormBarcodes(updated);
    };

    // Submit do formulário de Cadastro/Edição
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        const nameCheck = validateRequired(form.name, 'O nome do item');
        if (!nameCheck.ok) {
            showToast(nameCheck.message ?? 'O nome do item é obrigatório.', 'error');
            nameInputRef.current?.focus();
            return;
        }
        const categoryCheck = validateRequired(form.categoryId, 'Categoria');
        if (!categoryCheck.ok) {
            showToast(categoryCheck.message ?? 'Selecione uma categoria.', 'error');
            return;
        }
        if (form.type === 'PRODUTO') {
            const brandCheck = validateRequired(form.brandId, 'Marca');
            if (!brandCheck.ok) {
                showToast(brandCheck.message ?? 'Selecione uma marca.', 'error');
                return;
            }
            const supplierCheck = validateRequired(form.supplierId, 'Fornecedor');
            if (!supplierCheck.ok) {
                showToast(supplierCheck.message ?? 'Selecione um fornecedor.', 'error');
                return;
            }
            const unitOfMeasureCheck = validateRequired(form.unitOfMeasureId, 'Unidade de medida');
            if (!unitOfMeasureCheck.ok) {
                showToast(unitOfMeasureCheck.message ?? 'Selecione uma unidade de medida.', 'error');
                return;
            }
        }

        const purchasePriceRaw = parseNumber(form.purchasePrice);
        const profitMarginRaw = parseNumber(form.profitMargin);
        const salePriceRaw = parseNumber(form.salePrice);
        const stockRaw = parseNumber(form.stock);
        const multiplierRaw = parseNumber(form.unitMultiplier);

        const purchasePriceAmount = Number.isFinite(purchasePriceRaw) ? purchasePriceRaw : 0;
        const profitMarginAmount = Number.isFinite(profitMarginRaw) ? profitMarginRaw : 0;
        const salePriceAmount = Number.isFinite(salePriceRaw) ? salePriceRaw : 0;
        const stockAmount = Number.isFinite(stockRaw) ? stockRaw : 0;
        const multiplierValue = Number.isFinite(multiplierRaw) && multiplierRaw > 0 ? multiplierRaw : 1;

        // Validação de código principal nos códigos de barras
        let finalBarcodes = formBarcodes;
        if (finalBarcodes.length > 0) {
            const hasPrincipal = finalBarcodes.some((c) => c.principal === 1);
            if (!hasPrincipal) {
                // Força o primeiro como principal se nenhum foi marcado
                finalBarcodes = finalBarcodes.map((c, index) =>
                    index === 0 ? { ...c, principal: 1 } : c
                );
                setFormBarcodes(finalBarcodes);
            }
        }

        const payload = {
            tipo: form.type,
            nome: form.name.trim(),
            descricao: form.description.trim() || undefined,
            categoria_id: Number(form.categoryId),
            marca_id: Number(form.brandId || 1),
            fornecedor_id: Number(form.supplierId || 1),
            preco_compra: purchasePriceAmount,
            margem_lucro: profitMarginAmount,
            preco_venda: salePriceAmount,
            estoque: stockAmount,
            multiplicador_unidade: multiplierValue,
            unidade_medida_id: Number(form.unitOfMeasureId || 1),
            codigo_interno: form.internalCode.trim() || undefined,
            referencia: form.reference.trim(),
            duracao_minutos: Number(form.durationMinutes) || 0,
            ativo: form.active,
            codigos_barras: finalBarcodes,
            unidades_medida: form.unitsOfMeasure.map(u => ({
                unidade_medida_id: Number(u.unitOfMeasureId),
                multiplicador_unidade: parseNumber(u.unitMultiplier) || 1,
                principal: u.isPrincipal ? 1 : 0
            })),
        };

        const servicePayload = {
            nome: form.name.trim(),
            descricao: form.description.trim() || undefined,
            categoria_id: Number(form.categoryId),
            preco_venda: salePriceAmount,
            codigo_interno: form.internalCode.trim() || undefined,
            referencia: form.reference.trim(),
            duracao_minutos: Number(form.durationMinutes) || 0,
        };

        try {
            if (form.type === 'SERVICO') {
                if (editingId) {
                    await updateService(editingId, servicePayload);
                    showToast('Serviço atualizado com sucesso. Redirecionando...', 'success');
                } else {
                    await registerService(servicePayload);
                    showToast('Serviço cadastrado com sucesso. Redirecionando...', 'success');
                }
            } else {
                if (editingId) {
                    await updateProduct(editingId, payload);
                    showToast('Item atualizado com sucesso. Redirecionando...', 'success');
                } else {
                    await registerProduct(payload);
                    showToast('Item cadastrado com sucesso. Redirecionando...', 'success');
                }
            }
            // Limpa dirty antes de navegar para não disparar o guard
            setIsDirty(false);
            skipDirtyGuard.current = true;
            setTimeout(() => router.push('/produtos'), 2000);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Erro ao salvar o item.', 'error');
        }
    };

    // Confirma exclusão
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.tipo === 'SERVICO') {
                await deleteService(itemToDelete.id);
            } else {
                await deleteProduct(itemToDelete.id);
            }
            showToast('Item excluído com sucesso.', 'success');
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
            resetForm();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Erro ao excluir item.', 'error');
        }
    };

    // Categorias (hook)
    const {
        categoryModalOpen,
        setCategoryModalOpen,
        categoryForm,
        setCategoryForm,
        categoryEditModalOpen,
        setCategoryEditModalOpen,
        handleSaveCategory,
        handleOpenEditModal,
        handleUpdateCategory,
        handleDeleteCategory,
    } = useCategory({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
    });

    // Marcas (hook)
    const {
        brandModalOpen,
        setBrandModalOpen,
        brandForm,
        setBrandForm,
        brandEditModalOpen,
        setBrandEditModalOpen,
        handleSaveBrand,
        handleOpenEditBrandModal,
        handleUpdateBrand,
        handleDeleteBrand,
    } = useBrand({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
    });

    // Fornecedores (Hooks)
    const {
        supplierModalOpen,
        setSupplierModalOpen,
        supplierForm,
        setSupplierForm,
        supplierEditModalOpen,
        setSupplierEditModalOpen,
        handleSaveSupplier,
        handleOpenEditSupplierModal,
        handleUpdateSupplier,
        handleDeleteSupplier,
    } = useSupplier({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
    });

    // Unidades de Medida (hook)
    const {
        unitOfMeasureModalOpen,
        setUnitOfMeasureModalOpen,
        uomForm,
        setUomForm,
        unitOfMeasureEditModalOpen,
        setUnitOfMeasureEditModalOpen,
        handleSaveUnitOfMeasure,
        handleOpenEditUnitOfMeasureModal,
        handleUpdateUnitOfMeasure,
        handleDeleteUnitOfMeasure,
    } = useUnitOfMeasure({
        form,
        setForm,
        setOptions,
        showToast,
        loadItems: () => { },
        items: [],
        page: 1,
        setPage: () => { },
        setDeleteConfirmOpen,
        setItemToDelete,
    });

    // Função para importação de XML
    const handleImportXML = (file?: File) => {
        setImportFile(file || null);
        setModalImportOpen(true);
    };

    return (
        <>
            <Head>
                <title>Produtos e Serviços | Cadastro e Edição</title>
                <meta
                    name="description"
                    content="Cadastro/Edição de produtos e serviços, suporte a múltiplos códigos de barras."
                />
            </Head>

            <PageShell className={styles.produtosPage}>

                <PageHeader title="Produtos e Serviços" description="Cadastro/Edição de produtos e serviços, suporte a múltiplos códigos de barras." />




                <div className={styles.cadastroEdicaoGrid}>
                    {/* Formulário de Cadastro/Edição */}
                    <div>
                        <Panel>
                            <PanelHeader title={editingId ? 'Editar Item' : 'Cadastrar Item'} />

                            <form onSubmit={handleSubmitForm}>
                                <ItemForm
                                    onImportXML={handleImportXML}
                                    editingProductId={editingId}
                                    form={form}
                                    setForm={setForm}
                                    options={options}
                                    inputRef={nameInputRef}
                                    actions={{
                                        openCategoryModal: () => {
                                            setCategoryForm({ name: '', description: '' });
                                            setCategoryModalOpen(true);
                                        },
                                        openBrandModal: () => {
                                            setBrandForm({ name: '' });
                                            setBrandModalOpen(true);
                                        },
                                        openSupplierModal: () => {
                                            setSupplierForm({ name: '' });
                                            setSupplierModalOpen(true);
                                        },
                                        openUnitOfMeasureModal: () => {
                                            setUomForm({ abbreviation: '', description: '' });
                                            setUnitOfMeasureModalOpen(true);
                                        },
                                        openStockAdjustModal: async () => {
                                            if (editingId) {
                                                await loadMovements(editingId);
                                            }
                                            setStockAdjustModalOpen(true);
                                        },
                                        editCategory: handleOpenEditModal,
                                        editBrand: handleOpenEditBrandModal,
                                        editSupplier: handleOpenEditSupplierModal,
                                        editUnitOfMeasure: handleOpenEditUnitOfMeasureModal,
                                    }}
                                />

                                {/* Códigos de Barras */}
                                {form.type === 'PRODUTO' && (
                                    <BarcodeManager
                                        data={{
                                            barcodes: formBarcodes,
                                            newBarcode: newBarcode,
                                        }}
                                        inputRef={barcodeInputRef}
                                        actions={{
                                            add: handleAddBarcode,
                                            setAsPrincipal: handleSetPrincipalBarcode,
                                            change: setNewBarcode,
                                            remove: handleRemoveBarcode,
                                        }}
                                    />
                                )}

                                {/* Botões de Ação */}
                                <div className={styles.actionButtons}>
                                    <Button type="submit"
                                        variant="success"
                                        id="submit-item-btn"
                                    >
                                        {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                        id="cancel-item-btn"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </Panel>
                    </div>
                </div>

                {/* Modal: Cadastro de Categoria */}
                {categoryModalOpen && (
                    <CatalogEntityModal
                        title="Adicionar Categoria"
                        titleId="modal-cat-title"
                        fields={[
                            {
                                id: 'new-cat-nome',
                                label: 'Nome:*',
                                placeholder: 'Nome da categoria',
                                value: categoryForm.name,
                                required: true,
                                autoFocus: true,
                                onChange: (name) => setCategoryForm(prev => ({ ...prev, name })),
                            },
                            {
                                id: 'new-cat-desc',
                                label: 'Descrição:',
                                placeholder: 'Descrição opcional',
                                value: categoryForm.description,
                                onChange: (description) => setCategoryForm(prev => ({ ...prev, description })),
                            },
                        ]}
                        submitLabel="Salvar"
                        submitButtonId="save-new-cat-btn"
                        cancelButtonId="cancel-new-cat-btn"
                        onSubmit={handleSaveCategory}
                        onClose={() => {
                            setCategoryModalOpen(false);
                            setCategoryForm({ name: '', description: '' });
                        }}
                    />
                )}

                {/* Modal: Edição de Categoria */}
                {categoryEditModalOpen && (
                    <CatalogEntityModal
                        title="Editar Categoria"
                        titleId="modal-cat-edit-title"
                        fields={[
                            {
                                id: 'edit-cat-nome',
                                label: 'Nome:*',
                                placeholder: 'Nome da categoria',
                                value: categoryForm.name,
                                required: true,
                                autoFocus: true,
                                onChange: (name) => setCategoryForm(prev => ({ ...prev, name })),
                            },
                            {
                                id: 'edit-cat-desc',
                                label: 'Descrição:',
                                placeholder: 'Descrição opcional',
                                value: categoryForm.description,
                                onChange: (description) => setCategoryForm(prev => ({ ...prev, description })),
                            },
                        ]}
                        submitLabel="Atualizar"
                        submitButtonId="update-cat-btn"
                        cancelButtonId="cancel-edit-cat-btn"
                        onSubmit={handleUpdateCategory}
                        onClose={() => {
                            setCategoryEditModalOpen(false);
                            setCategoryForm({ name: '', description: '' });
                        }}
                        deleteAction={{
                            title: 'Confirmar Exclusão',
                            message: <>Tem certeza que deseja excluir a categoria <strong>{categoryForm.name}</strong>?</>,
                            confirmButtonId: 'confirm-delete-cat-btn',
                            cancelButtonId: 'cancel-delete-cat-btn',
                            onConfirm: handleDeleteCategory,
                        }}
                    />
                )}

                {/* Modal: Cadastro de Marca */}
                {brandModalOpen && (
                    <CatalogEntityModal
                        title="Adicionar Marca"
                        titleId="modal-marca-title"
                        fields={[
                            {
                                id: 'new-marca-nome',
                                label: 'Nome:*',
                                placeholder: 'Nome da marca',
                                value: brandForm.name,
                                required: true,
                                autoFocus: true,
                                onChange: (name) => setBrandForm({ name }),
                            },
                        ]}
                        submitLabel="Salvar"
                        submitButtonId="save-new-marca-btn"
                        cancelButtonId="cancel-new-marca-btn"
                        onSubmit={handleSaveBrand}
                        onClose={() => {
                            setBrandModalOpen(false);
                            setBrandForm({ name: '' });
                        }}
                    />
                )}

                {/* Modal: Edição de Marca */}
                {brandEditModalOpen && (
                    <CatalogEntityModal
                        title="Editar Marca"
                        titleId="modal-mar-edit-title"
                        fields={[
                            {
                                id: 'edit-mar-nome',
                                label: 'Nome:*',
                                placeholder: 'Nome da marca',
                                value: brandForm.name,
                                required: true,
                                autoFocus: true,
                                onChange: (name) => setBrandForm(prev => ({ ...prev, name })),
                            },
                        ]}
                        submitLabel="Atualizar"
                        submitButtonId="update-mar-btn"
                        cancelButtonId="cancel-edit-mar-btn"
                        onSubmit={handleUpdateBrand}
                        onClose={() => {
                            setBrandEditModalOpen(false);
                            setBrandForm({ name: '' });
                        }}
                        deleteAction={{
                            title: 'Confirmar Exclusão',
                            message: <>Tem certeza que deseja excluir a marca <strong>{brandForm.name}</strong>?</>,
                            confirmButtonId: 'confirm-delete-mar-btn',
                            cancelButtonId: 'cancel-delete-mar-btn',
                            onConfirm: handleDeleteBrand,
                        }}
                    />
                )}

                {/* Modal: Cadastro de Fornecedor */}
                {supplierModalOpen && (
                    <CatalogEntityModal
                        title="Adicionar Fornecedor"
                        titleId="modal-fornecedor-title"
                        fields={[
                            {
                                id: 'new-fornecedor-nome',
                                label: 'Nome:*',
                                placeholder: 'Nome do fornecedor',
                                value: supplierForm.name,
                                required: true,
                                autoFocus: true,
                                onChange: (name) => setSupplierForm({ name }),
                            },
                        ]}
                        submitLabel="Salvar"
                        submitButtonId="save-new-fornecedor-btn"
                        cancelButtonId="cancel-new-fornecedor-btn"
                        onSubmit={handleSaveSupplier}
                        onClose={() => {
                            setSupplierModalOpen(false);
                            setSupplierForm({ name: '' });
                        }}
                    />
                )}

                {/* Modal: Edição de Fornecedor */}
                {supplierEditModalOpen && (
                    <CatalogEntityModal
                        title="Editar Fornecedor"
                        titleId="modal-fornecedor-edit-title"
                        fields={[
                            {
                                id: 'edit-fornecedor-nome',
                                label: 'Nome:*',
                                placeholder: 'Nome do fornecedor',
                                value: supplierForm.name,
                                required: true,
                                autoFocus: true,
                                onChange: (name) => setSupplierForm(prev => ({ ...prev, name })),
                            },
                        ]}
                        submitLabel="Atualizar"
                        submitButtonId="update-fornecedor-btn"
                        cancelButtonId="cancel-edit-fornecedor-btn"
                        onSubmit={handleUpdateSupplier}
                        onClose={() => {
                            setSupplierEditModalOpen(false);
                            setSupplierForm({ name: '' });
                        }}
                        deleteAction={{
                            title: 'Confirmar Exclusão',
                            message: <>Tem certeza que deseja excluir o fornecedor <strong>{supplierForm.name}</strong>?</>,
                            confirmButtonId: 'confirm-delete-fornecedor-btn',
                            cancelButtonId: 'cancel-delete-fornecedor-btn',
                            onConfirm: handleDeleteSupplier,
                        }}
                    />
                )}

                {/* Modal: Cadastro de Unidade de Medida */}
                {unitOfMeasureModalOpen && (
                    <CatalogEntityModal
                        title="Adicionar Unidade de Medida"
                        titleId="modal-uom-title"
                        fields={[
                            {
                                id: 'new-uom-sigla',
                                label: 'Sigla:*',
                                placeholder: 'Sigla da Unidade de Medida',
                                value: uomForm.abbreviation,
                                required: true,
                                autoFocus: true,
                                onChange: (abbreviation) => setUomForm(prev => ({ ...prev, abbreviation })),
                            },
                            {
                                id: 'new-uom-desc',
                                label: 'Descrição:',
                                placeholder: 'Descrição opcional',
                                value: uomForm.description,
                                onChange: (description) => setUomForm(prev => ({ ...prev, description })),
                            },
                        ]}
                        submitLabel="Salvar"
                        submitButtonId="save-new-uom-btn"
                        cancelButtonId="cancel-new-uom-btn"
                        onSubmit={handleSaveUnitOfMeasure}
                        onClose={() => {
                            setUnitOfMeasureModalOpen(false);
                            setUomForm({ abbreviation: '', description: '' });
                        }}
                    />
                )}

                {/* Modal: Edição de Unidade de Medida */}
                {unitOfMeasureEditModalOpen && (
                    <CatalogEntityModal
                        title="Editar Unidade de Medida"
                        titleId="modal-uom-edit-title"
                        fields={[
                            {
                                id: 'edit-uom-sigla',
                                label: 'Sigla:*',
                                placeholder: 'Sigla da Unidade de Medida',
                                value: uomForm.abbreviation,
                                required: true,
                                autoFocus: true,
                                onChange: (abbreviation) => setUomForm(prev => ({ ...prev, abbreviation })),
                            },
                            {
                                id: 'edit-uom-desc',
                                label: 'Descrição:',
                                placeholder: 'Descrição opcional',
                                value: uomForm.description,
                                onChange: (description) => setUomForm(prev => ({ ...prev, description })),
                            },
                        ]}
                        submitLabel="Atualizar"
                        submitButtonId="update-uom-btn"
                        cancelButtonId="cancel-edit-uom-btn"
                        onSubmit={handleUpdateUnitOfMeasure}
                        onClose={() => {
                            setUnitOfMeasureEditModalOpen(false);
                            setUomForm({ abbreviation: '', description: '' });
                        }}
                        deleteAction={{
                            title: 'Confirmar Exclusão',
                            message: <>Tem certeza que deseja excluir a unidade de medida <strong>{uomForm.abbreviation}</strong>?</>,
                            confirmButtonId: 'confirm-delete-uom-btn',
                            cancelButtonId: 'cancel-delete-uom-btn',
                            onConfirm: handleDeleteUnitOfMeasure,
                        }}
                    />
                )}

                {/* Modal: Ajuste de Estoque */}
                {stockAdjustModalOpen && editingId && (
                    <StockAdjustModal
                        open={stockAdjustModalOpen}
                        itemName={form.name}
                        itemStock={parseNumber(form.stock) * (parseNumber(form.unitMultiplier) || 1)}
                        quantity={adjustQuantity}
                        description={adjustDescription}
                        setQuantity={setAdjustQuantity}
                        setDescription={setAdjustDescription}
                        movements={stockMovements}
                        movementsLoading={movementsLoading}
                        onSave={() => {
                            const quantityCheck = validateNumber(adjustQuantity);
                            if (!quantityCheck.ok) {
                                showToast(quantityCheck.message ?? 'Número inválido.', 'error');
                                return;
                            }
                            const quantityAdjustmentNumber = parseNumber(adjustQuantity);

                            setForm((prev) => {
                                const currentStock = parseNumber(prev.stock) || 0;
                                return { ...prev, stock: String(currentStock + quantityAdjustmentNumber) };
                            });

                            showToast('Ajuste aplicado no formulário. Lembre-se de "Salvar Alterações"!', 'info');
                            setStockAdjustModalOpen(false);
                            setAdjustQuantity('');
                            setAdjustDescription('');
                        }}
                        onClose={() => setStockAdjustModalOpen(false)}
                    />
                )}

                {/* Modal: Confirmação de Exclusão */}
                {deleteConfirmOpen && itemToDelete && (
                    <ProductDeleteModal
                        open={deleteConfirmOpen}
                        item={itemToDelete}
                        onConfirm={handleConfirmDelete}
                        onClose={() => {
                            setDeleteConfirmOpen(false);
                            setItemToDelete(null);
                        }}
                    />
                )}

                {/* Modal: Importação XML */}
                {modalImportOpen && (
                    <ImportItemsModal
                        initialFile={importFile}
                        onClose={() => {
                            setModalImportOpen(false);
                            setImportFile(null);
                        }}
                        onImportSuccess={() => {
                            showToast('Itens importados com sucesso!', 'success');
                        }}
                    />
                )}

                {/* Diálogo de confirmação: descartar alterações não salvas */}
                <ConfirmDialog
                    open={discardDialogOpen}
                    title="Descartar alterações?"
                    message="Você tem alterações não salvas. Se continuar, elas serão perdidas."
                    confirmText="Descartar e sair"
                    cancelText="Continuar editando"
                    onConfirm={() => {
                        setDiscardDialogOpen(false);
                        setIsDirty(false);
                        skipDirtyGuard.current = true;
                        if (pendingNavUrl.current) {
                            router.push(pendingNavUrl.current);
                            pendingNavUrl.current = null;
                        }
                    }}
                    onCancel={() => {
                        setDiscardDialogOpen(false);
                        pendingNavUrl.current = null;
                    }}
                />
            </PageShell>
        </>
    );
};

export default RegistrationPage;
