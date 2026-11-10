import { useState } from "react";
import { fetchBrands, createBrand, deleteBrand, updateBrand } from "../services/produtosService";
import { BrandFormData } from "@/types/catalog";
import { ProductFormData } from "@/components/products/ProductForm";
import { ProductOptions } from "@/components/products/ProductForm";
import { validateRequired } from "../utils/validation";

interface UseBrandParams {
    form: ProductFormData;
    setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
    setOptions: React.Dispatch<React.SetStateAction<ProductOptions>>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    loadItems: () => void;
    items: unknown[];
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    setDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setItemToDelete: (value: null) => void;
}

export const useBrand = ({
    form,
    setForm,
    setOptions,
    showToast,
    loadItems,
    items,
    page,
    setPage,
    setDeleteConfirmOpen,
    setItemToDelete,
}: UseBrandParams) => {
    // Modais de cadastro rápido
    const [brandModalOpen, setBrandModalOpen] = useState(false);
    const [brandForm, setBrandForm] = useState<BrandFormData>({ name: '' });

    // Modais de Edição
    const [brandEditModalOpen, setBrandEditModalOpen] = useState(false);

    // Cadastro de Marca Inline
    const handleSaveBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        const nameValidation = validateRequired(brandForm.name, "O nome da marca");
        if (!nameValidation.ok) {
            showToast(nameValidation.message ?? "Campo obrigatório.", "error");
            return;
        }
        try {
            const response = await createBrand(brandForm.name.trim());
            showToast(response.message || 'Marca criada com sucesso.', 'success');

            // Re-carrega lista de brands e seleciona a criada
            const brands = await fetchBrands();
            setOptions(prev => ({ ...prev, brands: brands }));
            setForm(prev => ({ ...prev, brandId: response.id }));

            // Fecha modal
            setBrandModalOpen(false);
            setBrandForm({ name: '' });
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao criar marca.', 'error');
        }
    };

    // Handler para abrir modal de edição de marca
    const handleOpenEditBrandModal = (brand: { id: number; nome: string }) => {
        setForm(prev => ({ ...prev, brandId: brand.id }));
        setBrandForm({ name: brand.nome });
        setBrandEditModalOpen(true);
    };

    // Edição de marca
    const handleUpdateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        const nameValidation = validateRequired(brandForm.name, "O nome da marca");
        if (!nameValidation.ok) {
            showToast(nameValidation.message ?? "Campo obrigatório.", "error");
            return;
        }
        try {
            const response = await updateBrand(form.brandId, brandForm.name.trim());

            // Atualiza na interface após confirmação da API
            setOptions(prev => ({
                ...prev, brands: prev.brands.map(brand =>
                    brand.id === form.brandId ?
                        { ...brand, nome: brandForm.name.trim() } : brand
                )
            }));

            showToast(response.message || 'Marca atualizada com sucesso.', 'success');
            setBrandEditModalOpen(false);
            setBrandForm({ name: '' });
            loadItems();
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao atualizar marca.', 'error');
        }
    };

    // Handle para deletar marca
    const handleDeleteBrand = async () => {
        try {
            await deleteBrand(form.brandId);
            showToast('Marca deletada com sucesso.', 'success');
            setDeleteConfirmOpen(false);
            setItemToDelete(null);

            // Atualiza a interface após confirmação da API
            setOptions(prev => ({
                ...prev,
                brands: prev.brands.filter(brand => brand.id !== form.brandId)
            }));

            // Fecha o modal após a exclusão
            setBrandModalOpen(false);
            setBrandForm({ name: '' });

            // Coloca o Id para 1
            setForm(prev => ({ ...prev, brandId: 1 }));

            if (items.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                loadItems();
            }
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao deletar marca.', 'error');
        }
    };

    return {
        // Estados
        brandModalOpen,
        setBrandModalOpen,
        brandForm,
        setBrandForm,
        brandEditModalOpen,
        setBrandEditModalOpen,

        // Handlers
        handleSaveBrand,
        handleOpenEditBrandModal,
        handleUpdateBrand,
        handleDeleteBrand,
    };
};