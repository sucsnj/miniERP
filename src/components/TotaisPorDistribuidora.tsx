import React from 'react';
import { formatCurrency } from '../utils/formatter';

interface TotaisPorDistribuidoraProps {
    totaisPorDistribuidora: Record<string, number>;
}

const TotaisPorDistribuidora: React.FC<TotaisPorDistribuidoraProps> = ({ totaisPorDistribuidora }) => {
    return (
        <div>
            <div className="summary-card small">
                <h3>Totais por distribuidora</h3>
                {Object.keys(totaisPorDistribuidora).length === 0 ? (
                    <p>Sem pendências por distribuidora.</p>
                ) : (
                    <ul>
                        {Object.entries(totaisPorDistribuidora).map(([nome, valor]) => (
                            <li key={nome}>
                                {nome}: R$ {formatCurrency(valor, 2)}
                            </li>
                        ))}
                    </ul>
                )}
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

                .summary-card h3 {
                    margin: 0 0 14px;
                    font-size: 1rem;
                    color: var(--muted);
                }

                .summary-card ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    gap: 10px;
                }

                .summary-card ul li {
                    color: var(--foreground);
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
};

export default TotaisPorDistribuidora;
