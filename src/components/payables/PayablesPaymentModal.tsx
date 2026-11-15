import React, { useEffect, useRef } from 'react';
import AppModalShell from '@/components/common/AppModalShell';
import Button from '@/components/common/Button';
import type { AccountDetails } from '../../services/payablesService';
import styles from '../../styles/payables.module.css';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface PaymentModalProps {
  account: AccountDetails | null;
  isOpen: boolean;
  notes: string;
  setNotes: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

const PayablesPaymentModal: React.FC<PaymentModalProps> = ({
  account,
  isOpen,
  notes,
  setNotes,
  onClose,
  onConfirm,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const animationFrame = window.requestAnimationFrame(() => textareaRef.current?.focus());
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isOpen]);

  return (
    <AppModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Observações do pagamento"
      titleId="payables-payment-modal-title"
      icon={<MonetizationOnIcon />}
      closeAriaLabel="Fechar observações do pagamento"
      footerRight={(
        <>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="success" size="sm" onClick={() => void onConfirm()}>
            Confirmar pagamento
          </Button>
        </>
      )}
    >
      <textarea
        ref={textareaRef}
        className={styles.accountPaymentNotes}
        rows={5}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Digite observações..."
        aria-label={account ? `Observações do pagamento de ${account.supplierName}` : 'Observações do pagamento'}
      />
    </AppModalShell>
  );
};

export default PayablesPaymentModal;
