import React from 'react';
import { useRef } from 'react';
import styles from '../../styles/contas.module.css';
import { AccountDetails } from '../../services/contasService';
import { formatCurrency } from '../../utils/formatter';
import { useShortcuts } from '../../utils/shortcuts';
import { useFocusTrap } from '../../utils/focus';
import Button from '@/components/common/Button';

interface PayablesModalsProps {
  selectedAccount: AccountDetails | null;
  editingAccount: AccountDetails | null;
  distributor: string;
  setDistributor: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  document: string;
  setDocument: (value: string) => void;
  bankNotes: string;
  setBankNotes: (value: string) => void;
  payModalOpen: boolean;
  paymentNotes: string;
  setPaymentNotes: (value: string) => void;
  onCloseSelectedAccount: () => void;
  onEdit: (account: AccountDetails) => void;
  onCancelEdit: () => void;
  onStartPayment: (account: AccountDetails) => void;
  onConfirmPayment: () => void;
  onClosePayModal: () => void;
  onCancelPayment: (id: number) => void;
  onSave: (event: React.FormEvent<HTMLButtonElement>) => void;
}

const PayablesModals: React.FC<PayablesModalsProps> = ({
  selectedAccount,
  editingAccount,
  distributor,
  setDistributor,
  amount,
  setAmount,
  dueDate,
  setDueDate,
  document,
  setDocument,
  bankNotes,
  setBankNotes,
  payModalOpen,
  paymentNotes,
  setPaymentNotes,
  onCloseSelectedAccount,
  onSave,
  onEdit,
  onCancelEdit,
  onStartPayment,
  onConfirmPayment,
  onClosePayModal,
  onCancelPayment,
}) => {

  const modalRef = useRef<HTMLDivElement>(null);

  // Adiciona classe modal-open ao body quando a modal estiver aberta
  useFocusTrap(modalRef, Boolean(selectedAccount || payModalOpen));

  // Fecha o modal ao pressionar esc
  useShortcuts(['Escape'], () => {
    // Se o modal de edição estiver aberto, fecha
    if (editingAccount) {
      onCancelEdit();
      return;
    }

    // Se o modal principal estiver aberto, fecha
    if (selectedAccount) {
      onCloseSelectedAccount();
      return;
    }
  });

  const onClose = () => {
    onCloseSelectedAccount();
    onCancelEdit();
  };

  return (
    <>
      {selectedAccount ? (
        <div className={styles.modalOverlay} onClick={onClose}>
          <div
            ref={modalRef}
            tabIndex={-1} // Permite foco na div do modal
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}>
            <h2>
              Detalhes da conta
              {editingAccount?.id === selectedAccount.id ? (
                <>
                  <Button type="button" variant="success" size="sm" onClick={(event) => onSave(event)}>
                    Salvar
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={onCancelEdit}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button type="button" variant="info" size="sm" onClick={() => onEdit(selectedAccount)}>
                  Editar
                </Button>
              )}
            </h2>

            <div className={styles.modalRow}>
              <strong>Distribuidora:</strong>
              {editingAccount?.id === selectedAccount.id ? (
                <input
                  className={styles.modalEdit}
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                />
              ) : (
                <span>{selectedAccount.distribuidora}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Valor:</strong>
              {editingAccount?.id === selectedAccount.id ? (
                <input
                  className={styles.modalEdit}
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              ) : (
                <span>R$ {formatCurrency(selectedAccount.valor, 2)}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Vencimento:</strong>
              {editingAccount?.id === selectedAccount.id ? (
                <input
                  className={styles.modalEdit}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              ) : (
                <span>{selectedAccount.vencimento}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Documento:</strong>
              {editingAccount?.id === selectedAccount.id ? (
                <input
                  className={styles.modalEdit}
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                />
              ) : (
                <span>{selectedAccount.documento}</span>
              )}
            </div>
            <div className={styles.modalRow}>
              <strong>Status:</strong>
              <span className={`${styles.status} ${styles[selectedAccount.status === 'Pago' ? 'pago' : 'pendente']}`}>{selectedAccount.status}</span>
            </div>
            <div className={styles.modalRow}>
              <strong>Banco / Observações:</strong>
              {editingAccount?.id === selectedAccount.id ? (
                <textarea
                  className={styles.modalEdit}
                  rows={4}
                  value={bankNotes}
                  onChange={(e) => setBankNotes(e.target.value)}
                />
              ) : (
                <span>{selectedAccount.banco_observacoes || 'Sem observações'}</span>
              )}
            </div>
            <div className={styles.modalActions}>
              {selectedAccount.status === 'Pendente' ? (
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={() => onStartPayment(selectedAccount)}
                >
                  Pagar conta
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    onCancelPayment(selectedAccount.id);
                    onCancelEdit();
                  }}
                >
                  Cancelar pagamento
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onCloseSelectedAccount();
                  onCancelEdit();
                }}
              >
                Fechar
              </Button>
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
              value={paymentNotes}
              autoFocus
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Digite observações..."
            />
            <div className={styles.modalActions}>
              <Button type="button" variant="success" onClick={onConfirmPayment}>
                Confirmar pagamento
              </Button>
              <Button type="button" variant="outline" onClick={onClosePayModal}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PayablesModals;
