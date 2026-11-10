import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react';
import { buscarNotasPorPeriodo, excluirNota, NotaDetalhe } from '../services/notasService';
import { formatCurrency } from '../utils/formatter';
import { formatDateString, getCurrentYear } from '../utils/date';
import ConfirmDialog from '@/components/ConfirmDialog';
import DeleteIcon from '@mui/icons-material/Delete';

// Array com os meses
const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface NotasDoMesProps {
    ano: number;
    mes: number;
    setAno: (ano: number) => void;
    setMes: (mes: number) => void;
}

const NotasDoMes: React.FC<NotasDoMesProps> = ({ ano, mes, setAno, setMes }) => {
    const queryClient = useQueryClient();

    // estado para o diálogo
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Hook que busca notas automaticamente
    const { data: notas = [], isLoading } = useQuery<NotaDetalhe[]>({
        queryKey: ['notas', ano, mes],
        queryFn: () => buscarNotasPorPeriodo(ano, mes).then((data) =>
            Array.isArray(data) ? data : [data]
        ),
    });

    // Somatório de notas
    const somaNotas = notas.reduce((sum, nota) => sum + nota.valor_nota, 0);

    const handleExcluir = async (id: number) => {
        try {
            await excluirNota(id);
            // invalida cache e força refetch
            queryClient.invalidateQueries({ queryKey: ['notas', ano, mes] });
        } catch (error) {
            console.error('Erro ao excluir nota:', error);
        }
    };

    const openConfirm = (id: number) => {
        setSelectedId(id);
        setConfirmOpen(true);
    };

    return (
        <div className="summary-card small">
            <h3>Notas do mês</h3>

            {/* Seletor de período */}
            <div className="selectors">
                <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                    {meses.map((nome, index) => (
                        <option key={index} value={index + 1}>
                            {nome}
                        </option>
                    ))}
                </select>

                <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
                    {Array.from({ length: 5 }, (_, i) => getCurrentYear() - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <div>
                    <h4>Somatório</h4>
                    <span>R$ {formatCurrency(somaNotas, 2)}</span>
                </div>
            </div>

            {isLoading ? (
                <p>Carregando notas...</p>
            ) : notas.length === 0 ? (
                <p>Nenhuma nota encontrada.</p>
            ) : (
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>Emissão</th>
                            <th>Distribuidora</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notas.map((n) => (
                            <tr key={n.id}>
                                <td>{formatDateString(n.data_emissao, 'DD/MM/YYYY HH:mm')}</td>
                                <td>{n.distribuidora}</td>
                                <td>R$ {formatCurrency(Number(n.valor_nota), 2)}</td>
                                <td>
                                    <button onClick={() => openConfirm(n.id)} className="delete-btn">
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
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar exclusão"
                message="Tem certeza que deseja excluir esta nota?"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => {
                    if (selectedId !== null) {
                        handleExcluir(selectedId);
                    }
                    setConfirmOpen(false);
                }}
                onCancel={() => setConfirmOpen(false)}
            />

            <style jsx>{`
        .summary-card {
          background: var(--surface-strong);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 20px;
          min-height: 220px;
        }

        .summary-card.small {
          padding: 18px;
        }

        .selectors {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            gap: 12px;
        }

        .selectors > div,
        .selectors select {
          min-width: 0;
        }

        .selectors select {
          flex: 1 1 160px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface-soft);
          color: var(--foreground);
        }

        .selectors > div {
          flex: 1 1 220px;
          min-width: 160px;
          display: grid;
          gap: 4px;
        }

        .selectors > div h4 {
          margin: 0;
          font-size: 0.95rem;
          color: var(--muted);
        }

        .summary-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 0;
          table-layout: auto;
          color: var(--foreground);
        }

        .summary-table th,
        .summary-table td {
          padding: 10px 7px;
          text-align: left;
          border-bottom: 1px solid var(--border);
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .summary-table th {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .summary-table td:last-child {
          white-space: nowrap;
          width: 1%;
        }

        .delete-btn {
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .delete-btn:hover {
          opacity: 0.95;
        }
      `}</style>
        </div>
    );
};

export default NotasDoMes;
