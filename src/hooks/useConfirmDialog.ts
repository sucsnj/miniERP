import { useState } from 'react';

// Hook que gerencia o diálogo de confirmação de exclusão:
// o estado de abertura, o item selecionado e as ações confirmar/cancelar.
export const useConfirmDialog = (onConfirmAction: (id: string) => void) => {
  // Controla se o diálogo está aberto
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Id do item que será excluído após confirmação
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Abre o diálogo guardando o id do item a excluir
  const openConfirm = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  // Confirma a exclusão (se houver id selecionado), executa a ação e fecha o diálogo
  const handleConfirm = () => {
    if (selectedId !== null) {
      onConfirmAction(selectedId);
    }
    setConfirmOpen(false);
  };

  // Cancela a exclusão fechando o diálogo
  const cancelConfirm = () => setConfirmOpen(false);

  return {
    confirmOpen,
    selectedId,
    openConfirm,
    handleConfirm,
    cancelConfirm,
  };
};