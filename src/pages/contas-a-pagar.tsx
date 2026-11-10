import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Toast from '../components/Toast';
import Agenda from '@/components/Agenda';
import Resumo from '@/components/Resumo';
import ContasAPagarHeader from '@/components/ContasAPagarHeader';
import ContasAPagarFilterPanel from '@/components/ContasAPagarFilterPanel';
import ContasAPagarForm from '@/components/ContasAPagarForm';
import parseNumber from '../utils/number';
import ContasAPagarLastTen from '@/components/ContasAPagarLastTen';
import ContasAPagarModals from '@/components/ContasAPagarModals';
import styles from '@/styles/contas.module.css';
import {
  buscarContas,
  atualizarConta,
  cancelarPagamentoConta,
  excluirConta,
  fazerBackupContas,
  pagarConta,
  registrarConta,
  ContaDetalhe,
} from '../services/contasService';
import { highlightField } from '../utils/forms';
import { useShortcuts } from '../utils/shortcuts';
import { getDateArray, toTimestamp, now } from '../utils/date';
import { validateRequired, validateCurrency } from '../utils/validation';

const hoje = now().format('YYYY-MM-DD');

// Componente React.
const ContasAPagar: React.FC = () => {
  const queryClient = useQueryClient();
  const [ano, setAno] = useState(getDateArray()[2]);
  const [mes, setMes] = useState(getDateArray()[1]);
  const [contasMes, setContasMes] = useState<ContaDetalhe[]>([]);
  const [contasAno, setContasAno] = useState<ContaDetalhe[]>([]);
  const [distribuidora, setDistribuidora] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState(hoje);
  const [documento, setDocumento] = useState('');
  const [bancoObservacoes, setBancoObservacoes] = useState('');
  const [editingConta, setEditingConta] = useState<ContaDetalhe | null>(null);
  const [selectedConta, setSelectedConta] = useState<ContaDetalhe | null>(null);
  const [filtroDistribuidora, setFiltroDistribuidora] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');
  const [filtroVencimentoDe, setFiltroVencimentoDe] = useState(() => {
    if (typeof window === 'undefined') return hoje;
    return localStorage.getItem('filtroVencimentoDe') || hoje;
  });
  const [filtroVencimentoAte, setFiltroVencimentoAte] = useState(() => {
    if (typeof window === 'undefined') return hoje;
    return localStorage.getItem('filtroVencimentoAte') || hoje;
  });
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const distribuidoraInputRef = useRef<HTMLInputElement | null>(null);
  const valorInputRef = useRef<HTMLInputElement | null>(null);
  const dataInputRef = useRef<HTMLInputElement | null>(null);
  const documentoInputRef = useRef<HTMLInputElement | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payObservacao, setPayObservacao] = useState('');

  const handleFiltroVencimentoDeChange = (value: string) => {
    setFiltroVencimentoDe(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('filtroVencimentoDe', value);
      if (value > filtroVencimentoAte) {
        localStorage.setItem('filtroVencimentoAte', value);
      }
    }
    if (value > filtroVencimentoAte) {
      setFiltroVencimentoAte(value);
    }
  };

  const handleFiltroVencimentoAteChange = (value: string) => {
    setFiltroVencimentoAte(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('filtroVencimentoAte', value);
      if (value < filtroVencimentoDe) {
        localStorage.setItem('filtroVencimentoDe', value);
      }
    }
    if (value < filtroVencimentoDe) {
      setFiltroVencimentoDe(value);
    }
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  }, []);

  const closeToast = () => setToastOpen(false);

  const loadContasMes = useCallback(async () => {
    try {
      const data = await buscarContas(ano, mes);
      setContasMes(data);
    } catch {
      showToast('Não foi possível carregar as contas do mês.', 'error');
    }
  }, [ano, mes, showToast]);

  const loadContasAno = useCallback(async () => {
    try {
      const data = await buscarContas(ano);
      setContasAno(data);
    } catch {
      showToast('Não foi possível carregar o resumo anual.', 'error');
    }
  }, [ano, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContasMes();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadContasMes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContasAno();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadContasAno]);

  const resetForm = () => {
    setDistribuidora('');
    setValor('');
    setVencimento(hoje);
    setDocumento('');
    setBancoObservacoes('');
    setEditingConta(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validações de campos obrigatórios e formato (contrato ADR 0002)
    const distribuidoraCheck = validateRequired(distribuidora, 'Distribuidora');
    if (!distribuidoraCheck.ok) {
      showToast(distribuidoraCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(distribuidoraInputRef);
      return;
    }

    const valorCheck = validateRequired(valor, 'Valor');
    if (!valorCheck.ok) {
      showToast(valorCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(valorInputRef);
      return;
    }

    const valorFormato = validateCurrency(valor);
    if (!valorFormato.ok) {
      showToast(valorFormato.message ?? 'Valor inválido.', 'error');
      highlightField(valorInputRef);
      return;
    }

    const vencimentoCheck = validateRequired(vencimento, 'Vencimento');
    if (!vencimentoCheck.ok) {
      showToast(vencimentoCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(dataInputRef);
      return;
    }

    const documentoCheck = validateRequired(documento, 'Documento');
    if (!documentoCheck.ok) {
      showToast(documentoCheck.message ?? 'Campo obrigatório.', 'error');
      highlightField(documentoInputRef);
      return;
    }

    const numericValor = parseNumber(valor);
    if (Number.isNaN(numericValor) || numericValor <= 0) {
      showToast('Valor deve ser um número maior que zero.', 'error');
      return;
    }

    try {
      if (editingConta) {
        await atualizarConta(
          editingConta.id,
          distribuidora,
          numericValor,
          vencimento,
          documento,
          bancoObservacoes,
        );
        showToast('Conta atualizada com sucesso.', 'success');
      } else {
        // traz o retorno do backend para mostrar a mensagem de sucesso ou erro específico
        // o retorno do json
        const response = await registrarConta(distribuidora, numericValor, vencimento, documento, bancoObservacoes);
        if (response.error) {
          showToast(response.error, 'error');
          return;
        }
        // await registrarConta(distribuidora, numericValor, vencimento, documento, bancoObservacoes);
        showToast(response.message, 'success');
      }

      resetForm();
      loadContasMes();
      loadContasAno();
    } catch {
      showToast('Erro ao salvar a conta.', 'error');
    }
  };

  const handleEditar = (conta: ContaDetalhe) => {
    setEditingConta(conta);
    setDistribuidora(conta.distribuidora);
    setValor(conta.valor.toFixed(2));
    setVencimento(conta.vencimento);
    setDocumento(conta.documento);
    setBancoObservacoes(conta.banco_observacoes ?? '');
    distribuidoraInputRef.current?.focus();
  };

  const handleCancelarEdicao = () => resetForm();

  const handleView = (conta: ContaDetalhe) => setSelectedConta(conta);

  const handleDelete = async (id: number) => {
    try {
      await excluirConta(id);
      showToast('Conta excluída com sucesso.', 'success');
      loadContasMes();
      loadContasAno();
      setSelectedConta((current) => (current?.id === id ? null : current));
    } catch {
      showToast('Erro ao excluir a conta.', 'error');
    }
  };

  const handleConfirmarPagamento = async () => {
    if (!selectedConta) return;

    try {
      await atualizarConta(
        selectedConta.id,
        selectedConta.distribuidora,
        selectedConta.valor,
        selectedConta.vencimento,
        selectedConta.documento,
        payObservacao
      );

      await pagarConta(selectedConta.id);

      showToast('Conta paga com sucesso.', 'success');

      setPayModalOpen(false);

      loadContasMes();
      loadContasAno();

      setSelectedConta(null);
    } catch {
      showToast('Erro ao pagar conta.', 'error');
    }
  };

  const handleCancelarPagamento = async (id: number) => {
    try {
      await cancelarPagamentoConta(id);
      showToast('Pagamento cancelado e conta voltou a Pendente.', 'success');
      loadContasMes();
      loadContasAno();
      setSelectedConta(null);
    } catch {
      showToast('Erro ao cancelar o pagamento.', 'error');
    }
  };

  const handleBackup = async () => {
    try {
      const result = await fazerBackupContas();
      showToast(result.message || 'Backup criado com sucesso.', 'success');
    } catch {
      showToast('Erro ao fazer backup das contas.', 'error');
    }
  };

  // Função para importação de XML
  const handleImportXML = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xml';
      fileInput.onchange = async (event: Event) => {
        const files = (event.target as HTMLInputElement).files;
        const file = files?.[0];
        if (!file) return;

        const text = await file.text();

        const response = await fetch('/api/contas/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xml: text }),
        });

        const result = await response.json();

        if (result.sucesso) {
          showToast(`Importação concluída: ${result.registros.length} registros inseridos`, 'success');
          // Atualiza imediatamente a UI
          await loadContasMes();
          await loadContasAno();
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

  const filteredContas = useMemo(() => {
    return contasAno.filter((conta) => {
      const matchesDistribuidora = conta.distribuidora
        .toLowerCase()
        .includes(filtroDistribuidora.toLowerCase());
      const matchesStatus = filtroStatus === 'Todos' || conta.status === filtroStatus;
      const matchesVencimentoDe = filtroVencimentoDe ? conta.vencimento >= filtroVencimentoDe : true;
      const matchesVencimentoAte = filtroVencimentoAte ? conta.vencimento <= filtroVencimentoAte : true;
      return matchesDistribuidora && matchesStatus && matchesVencimentoDe && matchesVencimentoAte;
    });
  }, [contasAno, filtroDistribuidora, filtroStatus, filtroVencimentoDe, filtroVencimentoAte]);

  const ultimasContas = useMemo(() => {
    return [...contasAno]
      .sort((a, b) => {
        const dateA = toTimestamp(a.criado_em || '1970-01-01T00:00:00');
        const dateB = toTimestamp(b.criado_em || '1970-01-01T00:00:00');
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [contasAno]);

  // Limpa formulário de registro de conta ao pressionar esc
  useShortcuts(['Escape'], () => {
    resetForm();
  });

  return (
    <div className={styles.contasPage}>
      <ContasAPagarHeader ano={ano} mes={mes} setAno={setAno} setMes={setMes} handleBackup={handleBackup} />

      <main className={styles.contasGrid}>
        <section className={`${styles.contasPanel} ${styles.detailPanel}`}>
          <ContasAPagarFilterPanel
            filtroDistribuidora={filtroDistribuidora}
            setFiltroDistribuidora={setFiltroDistribuidora}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            filtroVencimentoDe={filtroVencimentoDe}
            setFiltroVencimentoDe={handleFiltroVencimentoDeChange}
            filtroVencimentoAte={filtroVencimentoAte}
            setFiltroVencimentoAte={handleFiltroVencimentoAteChange}
            hoje={hoje}
            filteredContas={filteredContas}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEditar={handleEditar}
            handleStartPayment={(conta) => {
              setSelectedConta(conta);
              setPayObservacao(conta.banco_observacoes || '');
              setPayModalOpen(true);
            }}
            onClearFilters={() => {
              setFiltroDistribuidora('');
              setFiltroStatus('Todos');
              setFiltroVencimentoDe(hoje);
              setFiltroVencimentoAte(hoje);

              if (typeof window !== 'undefined') {
                localStorage.removeItem('filtroVencimentoDe');
                localStorage.removeItem('filtroVencimentoAte');
              }
            }}
          />

          <ContasAPagarForm
            distribuidora={distribuidora}
            setDistribuidora={setDistribuidora}
            valor={valor}
            setValor={setValor}
            vencimento={vencimento}
            setVencimento={setVencimento}
            documento={documento}
            setDocumento={setDocumento}
            bancoObservacoes={bancoObservacoes}
            setBancoObservacoes={setBancoObservacoes}
            editingConta={editingConta}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onImportXML={handleImportXML}
            onCancelarEdicao={handleCancelarEdicao}
            distribuidoraInputRef={distribuidoraInputRef}
            valorInputRef={valorInputRef}
            dataInputRef={dataInputRef}
            documentoInputRef={documentoInputRef}
          />

          <ContasAPagarLastTen
            ultimasContas={ultimasContas}
            handleView={handleView}
            handleDelete={handleDelete}
            handleEditar={handleEditar}
          />
        </section>

        {/* #Agenda */}
        <Agenda contasMes={contasMes} contasAno={contasAno} />

        {/* #Resumo */}
        <Resumo contasAno={contasAno} ano={ano} mes={mes} setAno={setAno} setMes={setMes} />

      </main>

      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />

      <ContasAPagarModals
        selectedConta={selectedConta}
        editingConta={editingConta}
        distribuidora={distribuidora}
        setDistribuidora={setDistribuidora}
        valor={valor}
        setValor={setValor}
        vencimento={vencimento}
        setVencimento={setVencimento}
        documento={documento}
        setDocumento={setDocumento}
        bancoObservacoes={bancoObservacoes}
        setBancoObservacoes={setBancoObservacoes}
        payModalOpen={payModalOpen}
        payObservacao={payObservacao}
        setPayObservacao={setPayObservacao}
        onCloseSelectedConta={() => setSelectedConta(null)}
        onSave={handleSubmit}
        onEditar={handleEditar}
        onCancelEdit={handleCancelarEdicao}
        onStartPayment={(conta) => {
          setSelectedConta(conta);
          setPayObservacao(conta.banco_observacoes || '');
          setPayModalOpen(true);
        }}
        onConfirmPayment={() => {
          handleConfirmarPagamento();
          handleCancelarEdicao();
          setSelectedConta(null);
        }}
        onClosePayModal={() => setPayModalOpen(false)}
        onCancelPayment={handleCancelarPagamento}
      />
    </div>
  );
};

export default ContasAPagar;
