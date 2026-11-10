import React from 'react';
import styles from '../styles/contas.module.css';
import { ContaDetalhe } from '../services/contasService';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ImportExportIcon from '@mui/icons-material/ImportExport';

interface ContasAPagarFormProps {
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
  editingConta: ContaDetalhe | null;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onReset: () => void;
  onImportXML: () => Promise<void>;
  onCancelarEdicao: () => void;
  distribuidoraInputRef: React.RefObject<HTMLInputElement | null>;
  valorInputRef: React.RefObject<HTMLInputElement | null>;
  dataInputRef: React.RefObject<HTMLInputElement | null>;
  documentoInputRef: React.RefObject<HTMLInputElement | null>;
}

const ContasAPagarForm: React.FC<ContasAPagarFormProps> = ({
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
  editingConta,
  onSubmit,
  onReset,
  onImportXML,
  onCancelarEdicao,
  distribuidoraInputRef,
  valorInputRef,
  dataInputRef,
  documentoInputRef,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.contasForm}>
      <div className={styles.formRow}>
        <label>
          Distribuidora
          <input
            ref={distribuidoraInputRef}
            type="text"
            value={distribuidora}
            onChange={(e) => setDistribuidora(e.target.value)}
          />
        </label>
        <label>
          Valor
          <input
            ref={valorInputRef}
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </label>
        <label>
          Vencimento
          <input
            ref={dataInputRef}
            type="date"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
          />
        </label>
        <label>
          Documento
          <input
            ref={documentoInputRef}
            type="text"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
        </label>
      </div>
      <label>
        Banco / Observações
        <textarea
          rows={4}
          value={bancoObservacoes}
          onChange={(e) => setBancoObservacoes(e.target.value)}
        />
      </label>
      <div className={styles.formActions}>
        <button type="submit">
          <NoteAddIcon className="material-icon" />
          {editingConta ? 'Salvar Alteração' : 'Cadastrar Conta'}</button>
        <button type="button" className={styles.secondary} onClick={onReset}>
          <ClearAllIcon className="material-icon" />
          Limpar Campos
        </button>
        <button type="button" className={styles.secondary} onClick={onImportXML}>
          <ImportExportIcon className="material-icon" />
          Importar XML
        </button>
        {editingConta ? (
            <button type="button" className={styles.secondary} onClick={onCancelarEdicao}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default ContasAPagarForm;
