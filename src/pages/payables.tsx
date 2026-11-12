import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { readStoredString, writeStoredValue, removeStoredValue } from '../utils/storage';
import Agenda from '@/components/payables/Agenda';
import Summary from '@/components/summary/Summary';
import PayablesHeader from '@/components/payables/PayablesHeader';
import PayablesFilterPanel from '@/components/payables/PayablesFilterPanel';
import PayablesForm from '@/components/payables/PayablesForm';
import parseNumber from '../utils/number';
import PayablesLastTen from '@/components/payables/PayablesLastTen';
import PayablesModals from '@/components/payables/PayablesModals';
import styles from '@/styles/payables.module.css';
import PageShell from '@/components/common/PageShell';
import {
  fetchAccounts,
  updateAccount,
  cancelAccountPayment,
  deleteAccount,
  payAccount,
  registerAccount,
  AccountDetails,
} from '../services/payablesService';
import { highlightField } from '../utils/forms';
import { useShortcuts } from '../utils/shortcuts';
import { getDateArray, toTimestamp, now } from '../utils/date';
import { validateRequired, validateCurrency } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import { usePendingTask } from '../contexts/RouteLoadingContext';

const today = now().format('YYYY-MM-DD');

// Componente React.
const Payables: React.FC = () => {
  const queryClient = useQueryClient();
  const [year, setYear] = useState(getDateArray()[2]);
  const [month, setMonth] = useState(getDateArray()[1]);
  const [monthLoading, setMonthLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(true);
  const [monthReady, setMonthReady] = useState(false);
  const [yearReady, setYearReady] = useState(false);
  usePendingTask('payables-month-initial', monthLoading && !monthReady);
  usePendingTask('payables-year-initial', yearLoading && !yearReady);
  const [accountsMonth, setAccountsMonth] = useState<AccountDetails[]>([]);
  const [accountsYear, setAccountsYear] = useState<AccountDetails[]>([]);
  const [distributor, setDistributor] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(today);
  const [documentNumber, setDocumentNumber] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [editingAccount, setEditingAccount] = useState<AccountDetails | null>(null);
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

  const loadMonthAccounts = useCallback(async () => {
    setMonthLoading(true);
    try {
      const date = await fetchAccounts(year, month);
      setAccountsMonth(date);
    } catch {
      showToast('Não foi possível carregar as contas do mês.', 'error');
    } finally {
      setMonthLoading(false);
      setMonthReady(true);
    }
  }, [year, month, showToast]);

  const loadYearAccounts = useCallback(async () => {
    setYearLoading(true);
    try {
      const date = await fetchAccounts(year);
      setAccountsYear(date);
    } catch {
      showToast('Não foi possível carregar o resumo anual.', 'error');
    } finally {
      setYearLoading(false);
      setYearReady(true);
    }
  }, [year, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMonthAccounts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMonthAccounts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadYearAccounts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadYearAccounts]);

  const resetForm = () => {
    setDistributor('');
    setAmount('');
    setDueDate(today);
    setDocumentNumber('');
    setBankNotes('');
    setEditingAccount(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
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
      if (editingAccount) {
        await updateAccount(
          editingAccount.id,
          distributor,
          numericAmount,
          dueDate,
          documentNumber,
          bankNotes,
        );
        showToast('Conta atualizada com sucesso.', 'success');
      } else {
        // traz o retorno do backend para mostrar a mensagem de sucesso ou erro específico
        // o retorno do json
        const response = await registerAccount(distributor, numericAmount, dueDate, documentNumber, bankNotes);
        if (response.error) {
          showToast(response.error, 'error');
          return;
        }
        // await registerAccount(distributor, numericAmount, dueDate, documentNumber, bankNotes);
        showToast(response.message, 'success');
      }

      resetForm();
      loadMonthAccounts();
      loadYearAccounts();
    } catch {
      showToast('Erro ao salvar a conta.', 'error');
    }
  };

  const handleEdit = (account: AccountDetails) => {
    setEditingAccount(account);
    setDistributor(account.supplierName);
    setAmount(account.amount.toFixed(2));
    setDueDate(account.dueDate);
    setDocumentNumber(account.document);
    setBankNotes(account.bankNotes ?? '');
    distributorInputRef.current?.focus();
  };

  const handleCancelEdit = () => resetForm();

  const handleView = (account: AccountDetails) => setSelectedAccount(account);

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      showToast('Conta excluída com sucesso.', 'success');
      loadMonthAccounts();
      loadYearAccounts();
      setSelectedAccount((current) => (current?.id === String(id) ? null : current));
    } catch {
      showToast('Erro ao excluir a conta.', 'error');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedAccount) return;

    try {
      await updateAccount(
        selectedAccount.id,
        selectedAccount.supplierName,
        selectedAccount.amount,
        selectedAccount.dueDate,
        selectedAccount.document,
        paymentNotes
      );

      await payAccount(selectedAccount.id);

      showToast('Conta paga com sucesso.', 'success');

      setPayModalOpen(false);

      loadMonthAccounts();
      loadYearAccounts();

      setSelectedAccount(null);
    } catch {
      showToast('Erro ao pagar conta.', 'error');
    }
  };

  const handleCancelPayment = async (id: string) => {
    try {
      await cancelAccountPayment(id);
      showToast('Pagamento cancelado e conta voltou a Pendente.', 'success');
      loadMonthAccounts();
      loadYearAccounts();
      setSelectedAccount(null);
    } catch {
      showToast('Erro ao cancelar o pagamento.', 'error');
    }
  };

  // Função para importação de XML
  const handleImportXml = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xml';
      fileInput.onchange = async (event: Event) => {
        const files = (event.target as HTMLInputElement).files;
        const file = files?.[0];
        if (!file) return;

        const text = await file.text();

        const response = await fetch('/api/payables/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xml: text }),
        });

        const result = await response.json();

        if (result.sucesso) {
          showToast(`Importação concluída: ${result.registros.length} registros inseridos`, 'success');
          // Atualiza imediatamente a UI
          await loadMonthAccounts();
          await loadYearAccounts();
          queryClient.invalidateQueries({ queryKey: ['notas'] });
        } else {
          showToast(`Erro: ${result.error || 'Falha ao importar XML'}`, 'error');
        }
      };
      fileInput.click();
    } catch (error) {
      showToast('Erro ao importar XML', 'error');
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
            isLoading={monthLoading || yearLoading}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            canWrite={isAdmin}
            handleStartPayment={(account) => {
              setSelectedAccount(account);
              setPaymentNotes(account.bankNotes || '');
              setPayModalOpen(true);
            }}
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

          {isAdmin && (
            <PayablesForm
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
            editingAccount={editingAccount}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onImportXML={handleImportXml}
            onCancelEdit={handleCancelEdit}
            distributorInputRef={distributorInputRef}
            amountInputRef={amountInputRef}
            dataInputRef={dataInputRef}
            documentInputRef={documentInputRef}
            />
          )}

          <PayablesLastTen
            latestAccounts={latestAccounts}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            canWrite={isAdmin}
          />
        </section>

        {/* #Agenda */}
        <Agenda accountsMonth={accountsMonth} accountsYear={accountsYear} />

        {/* #Resumo */}
        <Summary accountsYear={accountsYear} year={year} month={month} setYear={setYear} setMonth={setMonth} />

      </main>

      <PayablesModals
        selectedAccount={selectedAccount}
        editingAccount={editingAccount}
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
        payModalOpen={payModalOpen}
        paymentNotes={paymentNotes}
        setPaymentNotes={setPaymentNotes}
        onCloseSelectedAccount={() => setSelectedAccount(null)}
        onSave={handleSubmit}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onStartPayment={(account) => {
          setSelectedAccount(account);
          setPaymentNotes(account.bankNotes || '');
          setPayModalOpen(true);
        }}
        onConfirmPayment={() => {
          handleConfirmPayment();
          handleCancelEdit();
          setSelectedAccount(null);
        }}
        onClosePayModal={() => setPayModalOpen(false)}
        onCancelPayment={handleCancelPayment}
        canWrite={isAdmin}
      />
    </PageShell>
  );
};

export default Payables;
