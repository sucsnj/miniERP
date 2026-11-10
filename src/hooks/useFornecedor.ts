import { useState } from 'react';
import {
    buscarFornecedores,
    criarFornecedor,
    deletarFornecedor,
    atualizarFornecedor,
} from '../services/produtosService';
import { FornecedorFormData } from '@/components/ModalFornecedorEdit'
import { ProdutoFormData } from '@/components/FormularioProduto';
import { ProdutoOptions } from '@/components/FormularioProduto';
import { validateRequired } from '../utils/validation';

interface UseFornecedorParams {
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

export const useFornecedor = ({
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
}: UseFornecedorParams) => {
    // Modais de cadastro rápido
    const [modalFornecedorOpen, setModalFornecedorOpen] = useState(false);
    const [fornecedorForm, setFornecedorForm] = useState<FornecedorFormData>({ nome: '' });
    const [novoFornecedorNome, setNovoFornecedorNome] = useState('');

    // Modais de Edição
    const [modalFornecedorEditOpen, setModalFornecedorEditOpen] = useState(false);

    // Cadastro de Fornecedor Inline
    const handleSalvarFornecedor = async (e: React.FormEvent) => {
        e.preventDefault();
        const nomeFornecedor = validateRequired(novoFornecedorNome, 'O nome do fornecedor');
        if (!nomeFornecedor.ok) {
            showToast(nomeFornecedor.message ?? 'Campo obrigatório.', 'error');
            return;
        }
        try {
            const response = await criarFornecedor(novoFornecedorNome.trim());
            showToast(response.message || 'Fornecedor criado com sucesso.', 'success');

            // Re-carrega lista de fornecedores e seleciona o criado
            const forns = await buscarFornecedores();
            setOptions(prev => ({ ...prev, fornecedores: forns }));
            setForm(prev => ({ ...prev, fornecedorId: response.id }));

            // Fecha modal
            setModalFornecedorOpen(false);
            setFornecedorForm({ nome: '' });
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao criar fornecedor.', 'error');
        }
    };

    // Handler para abrir modal de edição de fornecedor
    const handleOpenEditFornecedorModal = (fornecedor: { id: number; nome: string }) => {
        setForm(prev => ({ ...prev, fornecedorId: fornecedor.id }));
        setFornecedorForm({ nome: fornecedor.nome || '' });
        setModalFornecedorEditOpen(true);
    };

    // Ediçao de fornecedor
    const handleAtualizarFornecedor = async (e: React.FormEvent) => {
        e.preventDefault();
        const nomeFornecedor = validateRequired(fornecedorForm.nome, 'O nome do fornecedor');
        if (!nomeFornecedor.ok) {
            showToast(nomeFornecedor.message ?? 'Campo obrigatório.', 'error');
            return;
        }
        try {
            const response = await atualizarFornecedor(form.fornecedorId, fornecedorForm.nome.trim());

            // Atualiza na interface após confirmação da API
            setOptions(prev =>
            ({
                ...prev, fornecedores: prev.fornecedores.map(forn =>
                    forn.id === form.fornecedorId ?
                        { ...forn, nome: fornecedorForm.nome.trim() } : forn
                )
            }));

            showToast(response.message || 'Fornecedor atualizado com sucesso.', 'success');
            setModalFornecedorEditOpen(false);
            setFornecedorForm({ nome: '' });
            carregarItens();
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao atualizar fornecedor.', 'error');
        }
    };

    // Handle para deletar fornecedor
    const handleDeletarFornecedor = async () => {
        try {
            await deletarFornecedor(form.fornecedorId);
            showToast('Fornecedor deletado com sucesso.', 'success');
            setDeleteConfirmOpen(false);
            setItemParaExcluir(null);

            // Atualiza a interface após confirmação da API
            setOptions(prev => ({
                ...prev,
                fornecedores: prev.fornecedores.filter(forn => forn.id !== form.fornecedorId)
            }));

            // Fecha o modal após a exclusão
            setModalFornecedorOpen(false);
            setFornecedorForm({ nome: '' });

            // Coloca o Id para 1
            setForm(prev => ({ ...prev, fornecedorId: 1 }));

            if (items.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                carregarItens();
            }
        } catch (error: unknown) {
            showToast(error instanceof Error ? error.message : 'Erro ao deletar fornecedor.', 'error');
        }
    };

    return {
        // Estados
        modalFornecedorOpen,
        setModalFornecedorOpen,
        fornecedorForm,
        setFornecedorForm,
        modalFornecedorEditOpen,
        setModalFornecedorEditOpen,
        novoFornecedorNome,
        setNovoFornecedorNome,

        // Handlers
        handleSalvarFornecedor,
        handleOpenEditFornecedorModal,
        handleAtualizarFornecedor,
        handleDeletarFornecedor,
    };
};