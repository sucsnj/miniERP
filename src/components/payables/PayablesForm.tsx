import React from 'react';
import styles from '../../styles/contas.module.css';
import Form from '@/components/common/Form';
import FormRow from '@/components/common/FormRow';
import FormActions from '@/components/common/FormActions';
import Button from '@/components/common/Button';
import { AccountDetails } from '../../services/contasService';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ImportExportIcon from '@mui/icons-material/ImportExport';

interface PayablesFormProps {
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
  editingAccount: AccountDetails | null;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onReset: () => void;
  onImportXML: () => Promise<void>;
  onCancelEdit: () => void;
  distributorInputRef: React.RefObject<HTMLInputElement | null>;
  amountInputRef: React.RefObject<HTMLInputElement | null>;
  dataInputRef: React.RefObject<HTMLInputElement | null>;
  documentInputRef: React.RefObject<HTMLInputElement | null>;
}

const PayablesForm: React.FC<PayablesFormProps> = ({
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
  editingAccount,
  onSubmit,
  onReset,
  onImportXML,
  onCancelEdit,
  distributorInputRef,
  amountInputRef,
  dataInputRef,
  documentInputRef,
}) => {
  return (
    <Form onSubmit={onSubmit} className={styles.contasForm}>
      <FormRow>
        <label>
          Distribuidora
          <input
            ref={distributorInputRef}
            type="text"
            value={distributor}
            onChange={(e) => setDistributor(e.target.value)}
          />
        </label>
        <label>
          Valor
          <input
            ref={amountInputRef}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label>
          Vencimento
          <input
            ref={dataInputRef}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <label>
          Documento
          <input
            ref={documentInputRef}
            type="text"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
          />
        </label>
      </FormRow>
      <label>
        Banco / Observações
        <textarea
          rows={4}
          value={bankNotes}
          onChange={(e) => setBankNotes(e.target.value)}
        />
      </label>
      <FormActions>
        <Button type="submit" variant="success" leftIcon={<NoteAddIcon />}>
          {editingAccount ? 'Salvar Alteração' : 'Cadastrar Conta'}
        </Button>
        <Button type="button" variant="outline" onClick={onReset} leftIcon={<ClearAllIcon />}>
          Limpar Campos
        </Button>
        <Button type="button" variant="info" onClick={onImportXML} leftIcon={<ImportExportIcon />}>
          Importar XML
        </Button>
        {editingAccount ? (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancelar
          </Button>
        ) : null}
      </FormActions>
    </Form>
  );
};

export default PayablesForm;
