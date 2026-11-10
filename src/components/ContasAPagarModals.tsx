import React from 'react';
import { useRef } from 'react';
import styles from '../styles/contas.module.css';
import { ContaDetalhe } from '../services/contasService';
import { formatCurrency } from '../utils/formatter';
import { useShortcuts } from '../utils/shortcuts';
import { useFocusTrap } from '../utils/focus';

interface ContasAPagarModalsProps {
  selectedConta: ContaDetalhe | null;
  editingConta: ContaDetalhe | null;
  distribuidora: string;
  setDistribuidora: (value: string) => void;
  valor: string;
  setValor: (value: string) => void;
  vencimento: string;
  setVencimento: (value: string) => void;
  documento: string;
  setDocumento: (value: string) => void;
  bancoObservacoes: string;
  setBancoObservacoes: (value: string) => void;
  payModalOpen: boolean;
  payObservacao: string;
  setPayObservacao: (value: string) => void;
  onCloseSelectedConta: () => void;
  onEditar: (conta: ContaDetalhe) => void;
  onCancelEdit: () => void;
  onStartPayment: (conta: ContaDetalhe) => void;
  onConfirmPayment: () => void;
  onClosePayModal: () => void;
  onCancelPayment: (id: number) => void;
  onSave: (event: React.FormEvent<HTMLButtonElement>) => void;
}

const ContasAPagarModals: React.FC<ContasAPagarModalsProps> = ({
  selectedConta,
  editingConta,
  distribuidora,
  setDistribuidora,
  valor,
  setValor,
  vencimento,
  setVencimento,
  documento,
  setDocumento,
  bancoObservacoes,
  setBancoObservacoes,
  payModalOpen,
  payObservacao,
  setPayObservacao,
  onCloseSelectedConta,
  onSave,
  onEditar,
  onCancelEdit,
  onStartPayment,
  onConfirmPayment,
  onClosePayModal,
  onCancelPayment,
}) => {

  const modalRef = useRef<HTMLDivElement>(null);

  // Adiciona classe modal-open ao body quando a modal estiver aberta
  useFocusTrap(modalRef, Boolean(selectedConta || payModalOpen));

  // Fecha o modal ao pressionar esc
  useShortcuts(['Escape'], () => {
    // Se o modal de edição estiver aberto, fecha
    if (editingConta) {
      onCancelEdit();
      return;
    }

    // Se o modal principal estiver aberto, fecha
    if (selectedConta) {
      onCloseSelectedConta();
      return;
    }
  });

  const onClose = () => {
    onCloseSelectedConta();
    onCancelEdit();
  };

  return (
    <>
      {selectedConta ? (
        <div className={styles.modalOverlay} onClick={onClose}>
          <div
            ref={modalRef}
            tabIndex={-1} // Permite foco na div do modal
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}>
            <h2>
              Detalhes da conta
              {editingConta?.id === selectedConta.id ? (
                <>
                  <button type="button" className={styles.saveButton} onClick={(event) => onSave(event)}>
                    Salvar
                  </button>
                  <button type="button" className={styles.closeButton} onClick={onCancelEdit}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button type="button" className={styles.editButton} onClick={() => onEditar(selectedConta)}>
                  Editar
                </button>
              )}
            </h2>

            <div className={styles.modalRow}>
              <strong>Distribuidora:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className={styles.modalEdit}
                  value={distribuidora}
                  onChange={(e) => setDistribuidora(e.target.value)}
                />
              ) : (
                <span>{selectedConta.distribuidora}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Valor:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className={styles.modalEdit}
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              ) : (
                <span>R$ {formatCurrency(selectedConta.valor, 2)}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Vencimento:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className={styles.modalEdit}
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                />
              ) : (
                <span>{selectedConta.vencimento}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Documento:</strong>
              {editingConta?.id === selectedConta.id ? (
                <input
                  className={styles.modalEdit}
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                />
              ) : (
                <span>{selectedConta.documento}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Status:</strong>
              <span className={`${styles.status} ${styles[selectedConta.status.toLowerCase()]}`}>{selectedConta.status}</span>
            </div>
            <div className={styles.modalRow}>
              <strong>Banco / Observações:</strong>
              {editingConta?.id === selectedConta.id ? (
                <textarea
                  className={styles.modalEdit}
                  rows={4}
                  value={bancoObservacoes}
                  onChange={(e) => setBancoObservacoes(e.target.value)}
                />
              ) : (
                <span>{selectedConta.banco_observacoes || 'Sem observações'}</span>
              )}
            </div>
            <div className={styles.modalActions}>
              {selectedConta.status === 'Pendente' ? (
                <button
                  type="button"
                  className={styles.payButton}
                  onClick={() => onStartPayment(selectedConta)}
                >
                  Pagar conta
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    onCancelPayment(selectedConta.id);
                    onCancelEdit();
                  }}
                >
                  Cancelar pagamento
                </button>
              )}
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  onCloseSelectedConta();
                  onCancelEdit();
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {payModalOpen && (
        <div className={styles.modalOverlay} onClick={onClosePayModal}>
          <div
            ref={modalRef}
            tabIndex={-1}
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}>
            <h2>Observações do pagamento</h2>
            <textarea
              className={styles.modalEdit}
              rows={5}
              value={payObservacao}
              autoFocus
              onChange={(e) => setPayObservacao(e.target.value)}
              placeholder="Digite observações..."
            />
            <div className={styles.modalActions}>
              <button type="button" className={styles.payButton} onClick={onConfirmPayment}>
                Confirmar pagamento
              </button>
              <button type="button" className={styles.closeButton} onClick={onClosePayModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContasAPagarModals;
