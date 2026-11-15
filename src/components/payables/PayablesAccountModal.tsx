import React, { useEffect, useId } from 'react';
import styles from '../../styles/payables.module.css';
import Form from '@/components/common/Form';
import Button from '@/components/common/Button';
import AppModalShell from '@/components/common/AppModalShell';
import AccountField from './AccountField';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ClearAllIcon from '@mui/icons-material/ClearAll';

interface PayablesAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onReset: () => void;
  distributorInputRef: React.RefObject<HTMLInputElement | null>;
  amountInputRef: React.RefObject<HTMLInputElement | null>;
  dataInputRef: React.RefObject<HTMLInputElement | null>;
  documentInputRef: React.RefObject<HTMLInputElement | null>;
}

const PayablesAccountModal: React.FC<PayablesAccountModalProps> = ({
  isOpen,
  onClose,
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
  onSubmit,
  onReset,
  distributorInputRef,
  amountInputRef,
  dataInputRef,
  documentInputRef,
}) => {
  const formId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const animationFrame = window.requestAnimationFrame(() => {
      distributorInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isOpen, distributorInputRef]);

  const footerLeft = (
    <Button type="button" variant="outline" size="sm" onClick={onReset} leftIcon={<ClearAllIcon />}>
      Limpar Campos
    </Button>
  );

  const footerRight = (
    <>
      <Button type="button" variant="outline" size="sm" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form={formId} variant="success" size="sm" leftIcon={<NoteAddIcon />}>
        Registrar Conta
      </Button>
    </>
  );

  return (
    <AppModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Conta"
      titleId="payables-account-modal-title"
      icon={<NoteAddIcon />}
      closeAriaLabel="Fechar nova conta"
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      <Form id={formId} onSubmit={onSubmit} className={styles.accountFormFields}>
        <AccountField label="Distribuidora" value={distributor} editable required inputRef={distributorInputRef} onChange={setDistributor} />
        <AccountField label="Valor" value={amount} editable required inputType="number" inputRef={amountInputRef} onChange={setAmount} />
        <AccountField label="Vencimento" value={dueDate} editable required inputType="date" inputRef={dataInputRef} onChange={setDueDate} />
        <AccountField label="Documento" value={document} editable required inputRef={documentInputRef} onChange={setDocument} />
        <AccountField label="Banco / Observações" value={bankNotes} editable inputType="textarea" rows={4} onChange={setBankNotes} />
      </Form>
    </AppModalShell>
  );
};

export default PayablesAccountModal;
