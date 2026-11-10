import { useState } from 'react';
import {
    fetchSuppliers,
    createSupplier,
    deleteSupplier,
    updateSupplier,
} from '../services/produtosService';
import { SupplierFormData } from '@/types/catalog';
import { ProductFormData } from '@/components/products/ProductForm';
import { ProductOptions } from '@/components/products/ProductForm';
import { validateRequired } from '../utils/validation';

interface UseSupplierParams {
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

export const useSupplier = ({
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
}: UseSupplierParams) => {
    // Modais de cadastro rápido
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);
    const [supplierForm, setSupplierForm] = useState<SupplierFormData>({ name: '' });

    // Modais de Edição
    const [supplierEditModalOpen, setSupplierEditModalOpen] = useState(false);

    // Cadastro de Fornecedor Inline
    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        const nameValidation = validateRequired(supplierForm.name, 'O nome do fornecedor');
        if (!nameValidation.ok) {
            showToast(nameValidation.message ?? 'Campo obrigatório.', 'error');
            return;
        }
        try {
            const response = await createSupplier(supplierForm.name.trim());
            showToast(response.message || 'Fornecedor criado com sucesso.', 'success');

            // Re-carrega lista de suppliers e seleciona o criado
            const suppliers = await fetchSuppliers();
            setOptions(prev => ({ ...prev, suppliers: suppliers }));
            setForm(prev => ({ ...prev, supplierId: response.id }));

            // Fecha modal
            setSupplierModalOpen(false);
            setSupplierForm({ name: '' });
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao criar fornecedor.', 'error');
        }
    };

    // Handler para abrir modal de edição de fornecedor
    const handleOpenEditSupplierModal = (supplier: { id: number; nome: string }) => {
        setForm(prev => ({ ...prev, supplierId: supplier.id }));
        setSupplierForm({ name: supplier.nome || '' });
        setSupplierEditModalOpen(true);
    };

    // Ediçao de fornecedor
    const handleUpdateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        const nameValidation = validateRequired(supplierForm.name, 'O nome do fornecedor');
        if (!nameValidation.ok) {
            showToast(nameValidation.message ?? 'Campo obrigatório.', 'error');
            return;
        }
        try {
            const response = await updateSupplier(form.supplierId, supplierForm.name.trim());

            // Atualiza na interface após confirmação da API
            setOptions(prev =>
            ({
                ...prev, suppliers: prev.suppliers.map(forn =>
                    forn.id === form.supplierId ?
                        { ...forn, nome: supplierForm.name.trim() } : forn
                )
            }));

            showToast(response.message || 'Fornecedor atualizado com sucesso.', 'success');
            setSupplierEditModalOpen(false);
            setSupplierForm({ name: '' });
            loadItems();
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao atualizar fornecedor.', 'error');
        }
    };

    // Handle para deletar fornecedor
    const handleDeleteSupplier = async () => {
        try {
            await deleteSupplier(form.supplierId);
            showToast('Fornecedor deletado com sucesso.', 'success');
            setDeleteConfirmOpen(false);
            setItemToDelete(null);

            // Atualiza a interface após confirmação da API
            setOptions(prev => ({
                ...prev,
                suppliers: prev.suppliers.filter(forn => forn.id !== form.supplierId)
            }));

            // Fecha o modal após a exclusão
            setSupplierModalOpen(false);
            setSupplierForm({ name: '' });

            // Coloca o Id para 1
            setForm(prev => ({ ...prev, supplierId: 1 }));

            if (items.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                loadItems();
            }
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao deletar fornecedor.', 'error');
        }
    };

    return {
        // Estados
        supplierModalOpen,
        setSupplierModalOpen,
        supplierForm,
        setSupplierForm,
        supplierEditModalOpen,
        setSupplierEditModalOpen,

        // Handlers
        handleSaveSupplier,
        handleOpenEditSupplierModal,
        handleUpdateSupplier,
        handleDeleteSupplier,
    };
};