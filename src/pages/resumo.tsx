import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/formatter';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { capitalize } from '../utils/captalize';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../hooks/useToast';
import { useMonthlyData } from '../hooks/useMonthlyData';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import Button from '@/components/common/Button';
dayjs.locale('pt-br');

// Componente React: tela de Resumo Mensal.
// Mostra as consolidações mensais (normal e especial) com opção de exclusão,
// usando os hooks useToast, useMonthlyData e useConfirmDialog.
const SummaryPage: React.FC = () => {
  // Notificações (toast) exibidas na tela
  const { showToast } = useToast();
  // Consolidações mensais (carregar e excluir)
  const { mensais, loadMensais, handleDelete } = useMonthlyData(showToast);
  // Diálogo de confirmação antes de excluir
  const { confirmOpen, openConfirm, handleConfirm, cancelConfirm } = useConfirmDialog(handleDelete);

  // Alterna entre a tabela "comum" e a "especial" de forma reativa
  const [view, setView] = useState<'comum' | 'especial'>('comum');

  // Carrega as consolidações ao montar o componente
  useEffect(() => {
    loadMensais();
  }, [loadMensais]);

  return (
    <>
      <PageShell>
        <PageHeader title="Resumo Mensal" />
        <Panel>

      {/* Botões de alternância entre as tabelas */}
      <div className="toggle-buttons">
        <Button
          variant={view === 'comum' ? 'primary' : 'ghost'}
          onClick={() => setView('comum')}
          className={view === 'especial' ? '' : 'hidden'}
        >
          Mostrar Consolidado Normal
        </Button>
        <Button
          variant={view === 'especial' ? 'secondary' : 'ghost'}
          onClick={() => setView('especial')}
          className={view === 'comum' ? '' : 'hidden'}
        >
          Mostrar Consolidado Especial
        </Button>
      </div>

      {/* Tabelas de consolidação do mês */}
      <div className="glass-form">
        <div className="table-container">
          {/* Tabela consolidado normal (visível quando view = 'comum') */}
          <table className={view === 'comum' ? undefined : 'hidden'}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Ticket Médio</th>
                <th>Média de clientes</th>
                <th>Melhor dia</th>
                <th>Maior venda</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {mensais.map((m) => (
                <tr key={m.id}>
                  <td>{capitalize(dayjs().month(m.mes - 1).format('MMMM'))} - {m.ano}</td>
                  <td>R$ {formatCurrency(m.ticketMedio, 2)}</td>
                  <td>{formatCurrency(m.mediaClientes)}</td>
                  <td>
                    {`${dayjs(m.melhorDia).format('D')} - ${capitalize(dayjs(m.melhorDia).locale('pt-br').format('dddd'))}`}
                    <span> - R$ {formatCurrency(m.melhorDiaValor, 2)}</span>
                  </td>
                  <td>R$ {formatCurrency(m.maiorVenda, 2)}</td>
                  <td>{m.qtdVendas}</td>
                  <td>R$ {formatCurrency(m.total, 2)}</td>
                  <td>
                    <Button type="button" variant="danger" size="sm" onClick={() => openConfirm(m.id)} leftIcon={<DeleteIcon />}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabela consolidado especial (visível quando view = 'especial') */}
          <table className={view === 'especial' ? undefined : 'hidden'}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Média de clientes</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {mensais.map((m) => (
                <tr key={m.id}>
                  <td>{capitalize(dayjs().month(m.mes - 1).format('MMMM'))} - {m.ano}</td>
                  <td>{formatCurrency(m.mediaClientesEsp)}</td>
                  <td>{m.qtdVendasEsp}</td>
                  <td>R$ {formatCurrency(m.totalEsp, 2)}</td>
                  <td>
                    <Button type="button" variant="danger" size="sm" onClick={() => openConfirm(m.id)} leftIcon={<DeleteIcon />}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
      </Panel>

      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir este mês?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={cancelConfirm}
      />
    </PageShell>
    </>
  );
};

export default SummaryPage;