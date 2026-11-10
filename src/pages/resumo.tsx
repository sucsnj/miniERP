import { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { formatCurrency } from '../utils/formatter';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { capitalize } from '../utils/captalize';
import ConfirmDialog from '../components/ConfirmDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../hooks/useToast';
import { useMensais } from '../hooks/useMensais';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
dayjs.locale('pt-br');

// Componente React: tela de Resumo Mensal.
// Mostra as consolidações mensais (normal e especial) com opção de exclusão,
// usando os hooks useToast, useMensais e useConfirmDialog.
const Resumo: React.FC = () => {
  // Notificações (toast) exibidas na tela
  const { toastOpen, toastMessage, toastType, toastDuration, showToast, closeToast } = useToast();
  // Consolidações mensais (carregar e excluir)
  const { mensais, loadMensais, handleDelete } = useMensais(showToast);
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
      <div className="container-padding">
        <h1>Resumo Mensal</h1>

      {/* Botões de alternância entre as tabelas */}
      <div className="toggle-buttons">
        <button
          className={`especial-button ${view === 'especial' ? '' : 'hidden'}`}
          onClick={() => setView('comum')}
        >
          Mostrar Consolidado Normal
        </button>
        <button
          className={`comum-button ${view === 'comum' ? '' : 'hidden'}`}
          onClick={() => setView('especial')}
        >
          Mostrar Consolidado Especial
        </button>
      </div>

      {/* Tabelas de consolidação do mês */}
      <div className="glass-form">
        <div className="table-container">
          {/* Tabela consolidado normal (visível quando view = 'comum') */}
          <table className={`comum-table ${view === 'comum' ? '' : 'hidden'}`}>
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
                    <button type="button" onClick={() => openConfirm(m.id)} className="delete-btn">
                      <span className="icon-responsive">
                        <DeleteIcon />
                      </span>
                      <span className="text-responsive">Excluir</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabela consolidado especial (visível quando view = 'especial') */}
          <table className={`epecial-table ${view === 'especial' ? '' : 'hidden'}`}>
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
                    <button type="button" onClick={() => openConfirm(m.id)} className="delete-btn">
                      <span className="icon-responsive">
                        <DeleteIcon />
                      </span>
                      <span className="text-responsive">Excluir</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

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

      {/* Notificação (toast) da página */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        duration={toastDuration}
        onClose={closeToast}
        position="top-right"
      />
      </div>
    </>
  );
};

export default Resumo;