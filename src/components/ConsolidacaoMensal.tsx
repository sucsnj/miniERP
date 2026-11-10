import React from 'react';
import { formatCurrency } from '../utils/formatter';
import { formatMonthName } from '../utils/date';
import { capitalize } from '../utils/captalize';

interface ConsolidacaoMensalProps {
    meses: { mes: number; pago: number; pendente: number }[];
}

const ConsolidacaoMensal: React.FC<ConsolidacaoMensalProps> = ({ meses }) => {
    return (
        <div>
            <div className="summary-card small">
                <h3>Consolidação mensal</h3>
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>Mês</th>
                            <th>Pago</th>
                            <th>Pendente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meses.map((m) => (
                            <tr key={m.mes}>
                                <td>{capitalize(formatMonthName(m.mes))}</td>
                                <td>R$ {formatCurrency(m.pago, 2)}</td>
                                <td>R$ {formatCurrency(m.pendente, 2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
            
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    color: var(--foreground);
                }

                .summary-table th,
                .summary-table td {
                    padding: 10px 12px;
                    text-align: left;
                    border-bottom: 1px solid var(--border);
                }

                .summary-table th {
                    color: var(--muted);
                    font-size: 0.9rem;
                }
            
            `}</style>
        </div>
    );
};

export default ConsolidacaoMensal;
