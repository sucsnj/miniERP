import { useState } from 'react';
import {
  fetchUnitsOfMeasure,
  createUnitOfMeasure,
  deleteUnitOfMeasure,
  updateUnitOfMeasure,
} from '../services/produtosService';
import { ProductFormData } from '@/components/products/ProductForm';
import { ProductOptions } from '@/components/products/ProductForm';
import { UnitOfMeasureFormData } from '@/types/catalog';
import { validateRequired } from '../utils/validation';

interface UseUnitOfMeasureParams {
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

export const useUnitOfMeasure = ({
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
}: UseUnitOfMeasureParams) => {
  // Modais de cadastro rápido
  const [unitOfMeasureModalOpen, setUnitOfMeasureModalOpen] = useState(false);
  const [uomForm, setUomForm] = useState<UnitOfMeasureFormData>({ abbreviation: '', description: '' });

  // Modais de Edição
  const [unitOfMeasureEditModalOpen, setUnitOfMeasureEditModalOpen] = useState(false);

  // Cadastro de Unidade de Medida Inline
  const handleSaveUnitOfMeasure = async (e: React.FormEvent) => {
    e.preventDefault();
    const abbreviationValidation = validateRequired(uomForm.abbreviation, 'A sigla da unidade de medida');
    if (!abbreviationValidation.ok) {
      showToast(abbreviationValidation.message ?? 'Campo obrigatório.', 'error');
      return;
    }
    try {
      const response = await createUnitOfMeasure(uomForm.abbreviation.trim(), uomForm.description.trim());
      showToast(response.message || 'Unidade de medida criada com sucesso.', 'success');

      // Re-carrega lista de unidade de medida e seleciona a criada
      const uoms = await fetchUnitsOfMeasure();
      setOptions(prev => ({ ...prev, unitsOfMeasure: uoms }));
      setForm(prev => ({ ...prev, unitOfMeasureId: response.id }));

      // Fecha modal
      setUnitOfMeasureModalOpen(false);
      setUomForm({ abbreviation: '', description: '' });
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao criar unidade de medida.', 'error');
    }
  };

  // Handler para abrir modal de edição de unidade de medida
  const handleOpenEditUnitOfMeasureModal = (unit: { id: number; sigla: string; descricao?: string }) => {
    setForm(prev => ({ ...prev, unitOfMeasureId: unit.id }));
    setUomForm({ abbreviation: unit.sigla, description: unit.descricao || '' });
    setUnitOfMeasureEditModalOpen(true);
  };

  // Ediçao de unidade de medida
  const handleUpdateUnitOfMeasure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uomForm.abbreviation.trim()) {
      showToast('A sigla da unidade de medida é obrigatório.', 'error');
      return;
    }
    try {
      const response = await updateUnitOfMeasure(form.unitOfMeasureId, uomForm.abbreviation.trim(), uomForm.description.trim());

      // Atualiza na interface após confirmação da API
      setOptions(prev =>
      ({
        ...prev, unitsOfMeasure: prev.unitsOfMeasure.map(uom =>
          uom.id === form.unitOfMeasureId ?
            { ...uom, sigla: uomForm.abbreviation.trim(), descricao: uomForm.description.trim() } : uom
        )
      }));

      showToast(response.message || 'Unidade de medida atualizada com sucesso.', 'success');
      setUnitOfMeasureEditModalOpen(false);
      setUomForm({ abbreviation: '', description: '' });
      loadItems();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar unidade de medida.', 'error');
    }
  };

  // Handle para deletar unidade de medida
  const handleDeleteUnitOfMeasure = async () => {
    try {
      await deleteUnitOfMeasure(form.unitOfMeasureId);
      showToast('Unidade de medida deletada com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);

      // Atualiza a interface após confirmação da API
      setOptions(prev => ({
        ...prev,
        unitsOfMeasure: prev.unitsOfMeasure.filter(uom => uom.id !== form.unitOfMeasureId)
      }));

      // Fecha o modal após a exclusão
      setUnitOfMeasureModalOpen(false);
      setUomForm({ abbreviation: '', description: '' });

      // Coloca o Id para 1
      setForm(prev => ({ ...prev, unitOfMeasureId: 1 }));

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadItems();
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao deletar unidade de medida.', 'error');
    }
  };

  return {
    // Estados
    unitOfMeasureModalOpen,
    setUnitOfMeasureModalOpen,
    uomForm,
    setUomForm,
    unitOfMeasureEditModalOpen,
    setUnitOfMeasureEditModalOpen,

    // Handlers
    handleSaveUnitOfMeasure,
    handleOpenEditUnitOfMeasureModal,
    handleUpdateUnitOfMeasure,
    handleDeleteUnitOfMeasure,
  };
};
