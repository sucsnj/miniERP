import { useState } from 'react';
import {
  buscarUnidadesMedida,
  criarUnidadeMedida,
  deletarUnidadeMedida,
  atualizarUnidadeMedida,
} from '../services/produtosService';
import { ProdutoFormData } from '@/components/FormularioProduto';
import { ProdutoOptions } from '@/components/FormularioProduto';
import { validateRequired } from '../utils/validation';

export interface UnidadeMedidaFormData {
    sigla: string;
    descricao: string;
}

export interface UnidadeMedidaOptions {
    abrirModalUnidadeMedida: () => void;
    salvarUnidadeMedida: React.FormEventHandler<HTMLFormElement>;
}

interface UseUnidadeMedidaParams {
  form: ProdutoFormData;
  setForm: React.Dispatch<React.SetStateAction<ProdutoFormData>>;
  setOptions: React.Dispatch<React.SetStateAction<ProdutoOptions>>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  carregarItens: () => void;
  items: unknown[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setItemParaExcluir: (value: null) => void;
}

export const useUnidadeMedida = ({
  form,
  setForm,
  setOptions,
  showToast,
  carregarItens,
  items,
  page,
  setPage,
  setDeleteConfirmOpen,
  setItemParaExcluir,
}: UseUnidadeMedidaParams) => {
  // Modais de cadastro rápido
  const [modalUnidadeMedidaOpen, setModalUnidadeMedidaOpen] = useState(false);
  const [uomForm, setUomForm] = useState<UnidadeMedidaFormData>({ sigla: '', descricao: '' });

  // Modais de Edição
  const [modalUnidadeMedidaEditOpen, setModalUnidadeMedidaEditOpen] = useState(false);

  // Cadastro de Unidade de Medida Inline
  const handleSalvarUnidadeMedida = async (e: React.FormEvent) => {
    e.preventDefault();
    const siglaUnidade = validateRequired(uomForm.sigla, 'A sigla da unidade de medida');
    if (!siglaUnidade.ok) {
      showToast(siglaUnidade.message ?? 'Campo obrigatório.', 'error');
      return;
    }
    try {
      const response = await criarUnidadeMedida(uomForm.sigla.trim(), uomForm.descricao.trim());
      showToast(response.message || 'Unidade de medida criada com sucesso.', 'success');

      // Re-carrega lista de unidade de medida e seleciona a criada
      const uoms = await buscarUnidadesMedida();
      setOptions(prev => ({ ...prev, unidadesMedida: uoms }));
      setForm(prev => ({ ...prev, unidadeMedidaId: response.id }));

      // Fecha modal
      setModalUnidadeMedidaOpen(false);
      setUomForm({ sigla: '', descricao: '' });
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao criar unidade de medida.', 'error');
    }
  };

  // Handler para abrir modal de edição de unidade de medida
  const handleOpenEditUnidadeMedidaModal = (unidadeMedida: { id: number; sigla: string; descricao?: string }) => {
    setForm(prev => ({ ...prev, unidadeMedidaId: unidadeMedida.id }));
    setUomForm({ sigla: unidadeMedida.sigla, descricao: unidadeMedida.descricao || '' });
    setModalUnidadeMedidaEditOpen(true);
  };

  // Ediçao de unidade de medida
  const handleAtualizarUnidadeMedida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uomForm.sigla.trim()) {
      showToast('A sigla da unidade de medida é obrigatório.', 'error');
      return;
    }
    try {
      const response = await atualizarUnidadeMedida(form.unidadeMedidaId, uomForm.sigla.trim(), uomForm.descricao.trim());

      // Atualiza na interface após confirmação da API
      setOptions(prev =>
      ({
        ...prev, unidadesMedida: prev.unidadesMedida.map(uom =>
          uom.id === form.unidadeMedidaId ?
            { ...uom, sigla: uomForm.sigla.trim(), descricao: uomForm.descricao.trim() } : uom
        )
      }));

      showToast(response.message || 'Unidade de medida atualizada com sucesso.', 'success');
      setModalUnidadeMedidaEditOpen(false);
      setUomForm({ sigla: '', descricao: '' });
      carregarItens();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar unidade de medida.', 'error');
    }
  };

  // Handle para deletar unidade de medida
  const handleDeletarUnidadeMedida = async () => {
    try {
      await deletarUnidadeMedida(form.unidadeMedidaId);
      showToast('Unidade de medida deletada com sucesso.', 'success');
      setDeleteConfirmOpen(false);
      setItemParaExcluir(null);

      // Atualiza a interface após confirmação da API
      setOptions(prev => ({
        ...prev,
        unidadesMedida: prev.unidadesMedida.filter(uom => uom.id !== form.unidadeMedidaId)
      }));

      // Fecha o modal após a exclusão
      setModalUnidadeMedidaOpen(false);
      setUomForm({ sigla: '', descricao: '' });

      // Coloca o Id para 1
      setForm(prev => ({ ...prev, unidadeMedidaId: 1 }));

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        carregarItens();
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao deletar unidade de medida.', 'error');
    }
  };

  return {
    // Estados
    modalUnidadeMedidaOpen,
    setModalUnidadeMedidaOpen,
    uomForm,
    setUomForm,
    modalUnidadeMedidaEditOpen,
    setModalUnidadeMedidaEditOpen,

    // Handlers
    handleSalvarUnidadeMedida,
    handleOpenEditUnidadeMedidaModal,
    handleAtualizarUnidadeMedida,
    handleDeletarUnidadeMedida,
  };
};
