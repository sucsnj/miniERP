import { useMemo, useRef, useState } from 'react';
import { useToast } from '../hooks/useToast';
import { usePayables } from '../hooks/usePayables';
import {
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  usePayAccount,
  useCancelPayment,
  useImportAccountsFromXml,
} from '../hooks/usePayablesMutations';
import { readStoredString, writeStoredValue, removeStoredValue } from '../utils/storage';
import Agenda from '@/components/payables/Agenda';
import Summary from '@/components/summary/Summary';
import PayablesHeader from '@/components/payables/PayablesHeader';
import PayablesFilterPanel from '@/components/payables/PayablesFilterPanel';
import PayablesAccountModal from '@/components/payables/PayablesAccountModal';
import PayablesPaymentModal from '@/components/payables/PayablesPaymentModal';
import parseNumber from '../utils/number';
import PayablesLastTen from '@/components/payables/PayablesLastTen';
import PayablesModals from '@/components/payables/PayablesModals';
import styles from '@/styles/payables.module.css';
import PageShell from '@/components/common/PageShell';
import type { AccountDetails } from '../services/payablesService';
import { highlightField } from '../utils/forms';
import { useShortcuts } from '../utils/shortcuts';
import { getDateArray, toTimestamp, now } from '../utils/date';
import { validateRequired, validateCurrency } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import Button from '@/components/common/Button';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ImportExportIcon from '@mui/icons-material/ImportExport';

const today = now().format('YYYY-MM-DD');

// Componente React.
const Payables: React.FC = () => {
  const [year, setYear] = useState(getDateArray()[2]);
  const [month, setMonth] = useState(getDateArray()[1]);
  const {
    accountsMonth,
    accountsYear,
    loadMonthAccounts,
    loadYearAccounts,
  } = usePayables({ month, year });
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const payAccountMutation = usePayAccount();
  const cancelPaymentMutation = useCancelPayment();
  const importAccountsFromXmlMutation = useImportAccountsFromXml();
  const [distributor, setDistributor] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(today);
  const [documentNumber, setDocumentNumber] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<AccountDetails | null>(null);
  const [distributorFilter, setDistributorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [dueDateFromFilter, setDueDateFromFilter] = useState(() => {
    if (typeof window === 'undefined') return today;
    return readStoredString('filtroVencimentoDe', today);
  });
  const [dueDateToFilter, setDueDateToFilter] = useState(() => {
    if (typeof window === 'undefined') return today;
    return readStoredString('filtroVencimentoAte', today);
  });
  const distributorInputRef = useRef<HTMLInputElement | null>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const dataInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const xmlInputRef = useRef<HTMLInputElement | null>(null);

  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');

  const handleDueDateFromChange = (value: string) => {
    setDueDateFromFilter(value);
    if (typeof window !== 'undefined') {
      writeStoredValue('filtroVencimentoDe', value);
      if (value > dueDateToFilter) {
        writeStoredValue('filtroVencimentoAte', value);
      }
    }
    if (value > dueDateToFilter) {
      setDueDateToFilter(value);
    }
  };

  const handleDueDateToChange = (value: string) => {
    setDueDateToFilter(value);
    if (typeof window !== 'undefined') {
      writeStoredValue('filtroVencimentoAte', value);
      if (value < dueDateFromFilter) {
        writeStoredValue('filtroVencimentoDe', value);
      }
    }
    if (value < dueDateFromFilter) {
      setDueDateFromFilter(value);
    }
  };

  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const resetForm = () => {
    setDistributor('');
    setAmount('');
    setDueDate(today);
    setDocumentNumber('');
    setBankNotes('');
  };

  const clearFormFields = () => {
    setDistributor('');
    setAmount('');
    setDueDate(today);
    setDocumentNumber('');
    setBankNotes('');
    distributorInputRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validações de campos obrigatórios e formato (contrato ADR 0002)
    const distributorCheck = validateRequired(distributor, 'Distribuidora');
    if (!distributorCheck.ok) {
      showToast(distributorCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(distributorInputRef);
      return;
    }

    const amountCheck = validateRequired(amount, 'Valor');
    if (!amountCheck.ok) {
      showToast(amountCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(amountInputRef);
      return;
    }

    const amountFormat = validateCurrency(amount);
    if (!amountFormat.ok) {
      showToast(amountFormat.message ?? 'Valor inválido.', 'error');
      highlightField(amountInputRef);
      return;
    }

    const dueDateCheck = validateRequired(dueDate, 'Vencimento');
    if (!dueDateCheck.ok) {
      showToast(dueDateCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(dataInputRef);
      return;
    }

    const documentCheck = validateRequired(documentNumber, 'Documento');
    if (!documentCheck.ok) {
      showToast(documentCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(documentInputRef);
      return;
    }

    const numericAmount = parseNumber(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Valor deve ser um número maior que zero.', 'error');
      return;
    }

    try {
      await createAccountMutation.mutateAsync({
        supplierName: distributor,
        amount: numericAmount,
        dueDate,
        document: documentNumber,
        bankNotes,
      });
      showToast('Conta registrada com sucesso.', 'success');

      resetForm();
      setAccountFormOpen(false);
      await Promise.all([loadMonthAccounts(), loadYearAccounts()]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao salvar a conta.', 'error');
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setAccountFormOpen(false);
  };

  const openNewAccount = () => {
    resetForm();
    setAccountFormOpen(true);
  };

  const handleView = (account: AccountDetails) => setSelectedAccount(account);

  const updateAccountField = async (
    account: AccountDetails,
    field: 'supplierName' | 'amount' | 'dueDate' | 'document' | 'bankNotes',
    value: string
  ): Promise<boolean> => {
    const supplierName = field === 'supplierName' ? value.trim() : account.supplierName;
    const document = field === 'document' ? value.trim() : account.document;
    const dueDateField = field === 'dueDate' ? value : account.dueDate;
    let amountValue = account.amount;

    if (field === 'amount') {
      const parsedAmount = parseNumber(value);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        showToast('Valor deve ser um número maior que zero.', 'error');
        return false;
      }
      amountValue = parsedAmount;
    }

    if (!supplierName || !document || !dueDateField) {
      showToast('Campo obrigatório.', 'error');
      return false;
    }

    try {
      const updated = {
        ...account,
        supplierName,
        amount: amountValue,
        dueDate: dueDateField,
        document,
        bankNotes: field === 'bankNotes' ? value.trim() : (account.bankNotes ?? ''),
      };

      await updateAccountMutation.mutateAsync(updated);
      setSelectedAccount(updated);
      showToast('Conta atualizada com sucesso.', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar a conta.', 'error');
      return false;
    }
  };

  const changeAccountStatus = async (
    account: AccountDetails,
    status: AccountDetails['status']
  ): Promise<boolean> => {
    try {
      if (status === 'Pago') {
        await payAccountMutation.mutateAsync({ id: account.id });
        setSelectedAccount({ ...account, status: 'Pago' });
        showToast('Conta paga com sucesso.', 'success');
      } else {
        await cancelPaymentMutation.mutateAsync({ id: account.id });
        setSelectedAccount({ ...account, status: 'Pendente' });
        showToast('Pagamento cancelado e conta voltou a Pendente.', 'success');
      }
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar o status da conta.', 'error');
      return false;
    }
  };

  const openPaymentModal = (account: AccountDetails) => {
    setSelectedAccount(account);
    setPaymentNotes(account.bankNotes ?? '');
    setPayModalOpen(true);
  };

  const confirmPayment = async () => {
    if (!selectedAccount) return;

    try {
      const updated = { ...selectedAccount, bankNotes: paymentNotes.trim() };
      await updateAccountMutation.mutateAsync(updated);
      await payAccountMutation.mutateAsync({ id: selectedAccount.id });
      setSelectedAccount({ ...updated, status: 'Pago' });
      showToast('Conta paga com sucesso.', 'success');
      setPayModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao pagar conta.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccountMutation.mutateAsync({ id });
      showToast('Conta excluída com sucesso.', 'success');
      setSelectedAccount((current) => (current?.id === String(id) ? null : current));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao excluir a conta.', 'error');
    }
  };

  // Função para importação de XML
  const handleImportXml = async () => {
    xmlInputRef.current?.click();
  };

  const handleImportXmlFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importAccountsFromXmlMutation.mutateAsync({ xml: text });

      if (result.sucesso) {
        showToast(`Importação concluída: ${result.registros?.length ?? 0} registros inseridos`, 'success');
        // Atualiza imediatamente a UI
        await Promise.all([loadMonthAccounts(), loadYearAccounts()]);
      } else {
        showToast(`Erro: ${result.error || 'Falha ao importar XML'}`, 'error');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao importar XML', 'error');
      console.error(error);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accountsYear.filter((account) => {
      const matchesDistribuidora = account.supplierName
        .toLowerCase()
        .includes(distributorFilter.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || account.status === statusFilter;
      const matchesDueDateFrom = dueDateFromFilter ? account.dueDate >= dueDateFromFilter : true;
      const matchesDueDateTo = dueDateToFilter ? account.dueDate <= dueDateToFilter : true;
      return matchesDistribuidora && matchesStatus && matchesDueDateFrom && matchesDueDateTo;
    });
  }, [accountsYear, distributorFilter, statusFilter, dueDateFromFilter, dueDateToFilter]);

  const latestAccounts = useMemo(() => {
    return [...accountsYear]
      .sort((a, b) => {
        const dateA = toTimestamp(a.createdAt || '1970-01-01T00:00:00');
        const dateB = toTimestamp(b.createdAt || '1970-01-01T00:00:00');
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [accountsYear]);

  // Limpa formulário de registro de conta ao pressionar esc
  useShortcuts(['Escape'], () => {
    if (typeof document !== 'undefined' && document.body.classList.contains('modal-open')) return;

    resetForm();
  });

  return (
    <PageShell className={styles.contasPage}>
      <PayablesHeader year={year} month={month} setYear={setYear} setMonth={setMonth} />

      <main className={styles.contasGrid}>
        <section className={`${styles.contasPanel} ${styles.detailPanel}`}>
          <PayablesFilterPanel
            distributorFilter={distributorFilter}
            setDistributorFilter={setDistributorFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dueDateFromFilter={dueDateFromFilter}
            setDueDateFromFilter={handleDueDateFromChange}
            dueDateToFilter={dueDateToFilter}
            setDueDateToFilter={handleDueDateToChange}
            today={today}
            filteredAccounts={filteredAccounts}
            handleView={handleView}
            handleDelete={handleDelete}
            canWrite={isAdmin}
            handleStartPayment={openPaymentModal}
            onClearFilters={() => {
              setDistributorFilter('');
              setStatusFilter('Todos');
              setDueDateFromFilter(today);
              setDueDateToFilter(today);

              if (typeof window !== 'undefined') {
                removeStoredValue('filtroVencimentoDe');
                removeStoredValue('filtroVencimentoAte');
              }
            }}
          />

          {isAdmin ? (
            <div className={styles.accountActions}>
              <Button type="button" variant="success" size="sm" onClick={openNewAccount} leftIcon={<NoteAddIcon />}>
                Nova Conta
              </Button>
              <Button type="button" variant="info" size="sm" onClick={handleImportXml} leftIcon={<ImportExportIcon />}>
                Importar XML
              </Button>
            </div>
          ) : null}

          <PayablesLastTen
            latestAccounts={latestAccounts}
            handleView={handleView}
            handleDelete={handleDelete}
            canWrite={isAdmin}
          />
        </section>

        {/* #Agenda */}
        <Agenda accountsMonth={accountsMonth} accountsYear={accountsYear} />

        {/* #Resumo */}
        <Summary accountsYear={accountsYear} year={year} month={month} setYear={setYear} setMonth={setMonth} />

      </main>

      <input
        ref={xmlInputRef}
        type="file"
        accept=".xml"
        className="hidden"
        onChange={(event) => void handleImportXmlFile(event)}
        aria-label="Arquivo XML da nota fiscal"
      />

      <PayablesAccountModal
        isOpen={accountFormOpen}
        onClose={handleCancelEdit}
        distributor={distributor}
        setDistributor={setDistributor}
        amount={amount}
        setAmount={setAmount}
        dueDate={dueDate}
        setDueDate={setDueDate}
        document={documentNumber}
        setDocument={setDocumentNumber}
        bankNotes={bankNotes}
        setBankNotes={setBankNotes}
        onSubmit={handleSubmit}
        onReset={clearFormFields}
        distributorInputRef={distributorInputRef}
        amountInputRef={amountInputRef}
        dataInputRef={dataInputRef}
        documentInputRef={documentInputRef}
      />

      <PayablesPaymentModal
        account={selectedAccount}
        isOpen={payModalOpen}
        notes={paymentNotes}
        setNotes={setPaymentNotes}
        onClose={() => {
          setPayModalOpen(false);
          setSelectedAccount(null);
        }}
        onConfirm={confirmPayment}
      />

      <PayablesModals
        selectedAccount={payModalOpen ? null : selectedAccount}
        onCloseSelectedAccount={() => setSelectedAccount(null)}
        onUpdateField={updateAccountField}
        onStatusChange={changeAccountStatus}
        canWrite={isAdmin}
      />
    </PageShell>
  );
};

export default Payables;
