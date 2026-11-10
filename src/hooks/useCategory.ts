import { useState } from 'react';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from '../services/produtosService';
import { CategoryFormData } from '@/types/categoria';
import { ProductFormData } from '@/components/products/ProductForm';
import { ProductOptions } from '@/components/products/ProductForm';
import { validateRequired } from '../utils/validation';

interface UseCategoryParams {
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

export const useCategory = ({
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
}: UseCategoryParams) => {
  // Modais de cadastro rápido
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', description: '' });

  // Modais de Edição
  const [categoryEditModalOpen, setCategoryEditModalOpen] = useState(false);

  // Cadastro de Categoria Inline
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameValidation = validateRequired(categoryForm.name, 'O nome da categoria');
    if (!nameValidation.ok) {
      showToast(nameValidation.message ?? 'Campo obrigatório.', 'error');
      return;
    }
    try {
      const response = await createCategory(categoryForm.name.trim(), categoryForm.description.trim());
      showToast(response.message || 'Categoria criada com sucesso.', 'success');

      // Re-carrega lista de categories e seleciona a criada
      const categories = await fetchCategories();
      setOptions(prev => ({ ...prev, categories: categories }));
      setForm(prev => ({ ...prev, categoryId: response.id }));

      // Fecha modal
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '' });
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao criar categoria.', 'error');
    }
  };

  // Handler para abrir modal de edição de categoria
  const handleOpenEditModal = (category: { id: number; nome: string; descricao?: string }) => {
    setForm(prev => ({ ...prev, categoryId: category.id }));
    setCategoryForm({ name: category.nome, description: category.descricao || '' });
    setCategoryEditModalOpen(true);
  };

  // Ediçao de categoria
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameValidation = validateRequired(categoryForm.name, 'O nome da categoria');
    if (!nameValidation.ok) {
      showToast(nameValidation.message ?? 'Campo obrigatório.', 'error');
      return;
    }
    try {
      const response = await updateCategory(form.categoryId, categoryForm.name.trim(), categoryForm.description.trim());

      // Atualiza na interface após confirmação da API
      setOptions(prev =>
      ({
        ...prev, categories: prev.categories.map(cat =>
          cat.id === form.categoryId ?
            { ...cat, nome: categoryForm.name.trim(), descricao: categoryForm.description.trim() } : cat
        )
      }));

      showToast(response.message || 'Categoria atualizada com sucesso.', 'success');
      setCategoryEditModalOpen(false);
      setCategoryForm({ name: '', description: '' });
      loadItems();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar categoria.', 'error');
    }
  };

  // Handle para deletar categoria
  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(form.categoryId);
      showToast('Categoria deletada com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);

      // Atualiza a interface após confirmação da API
      setOptions(prev => ({
        ...prev,
        categories: prev.categories.filter(cat => cat.id !== form.categoryId)
      }));

      // Fecha o modal após a exclusão
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '' });

      // Coloca o Id para 1
      setForm(prev => ({ ...prev, categoryId: 1 }));

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadItems();
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao deletar categoria.', 'error');
    }
  };

  return {
    // Estados
    categoryModalOpen,
    setCategoryModalOpen,
    categoryForm,
    setCategoryForm,
    categoryEditModalOpen,
    setCategoryEditModalOpen,

    // Handlers
    handleSaveCategory,
    handleOpenEditModal,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};
