import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatter';
import styles from '../../styles/totalsByDistributor.module.css';

interface TotalsByDistributorProps {
    totalsByDistributor: Record<string, { amount: number; count: number }>;
}

const TotalsByDistributor: React.FC<TotalsByDistributorProps> = ({ totalsByDistributor }) => {
    const [sort, setSort] = useState<'name' | 'value'>('name');

    const entries = Object.entries(totalsByDistributor).sort((a, b) => {
        if (sort === 'value') return b[1].amount - a[1].amount;
        return a[0].localeCompare(b[0], 'pt-BR');
    });

    return (
        <div>
            <div className={`${styles.summaryCard} ${styles.small}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h3>Totais por distribuidora</h3>
                    <select value={sort} onChange={(e) => setSort(e.target.value as 'name' | 'value')} style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', minWidth: 'fit-content' }}>
                        <option value="name">Ordenar por nome</option>
                        <option value="value">Ordenar por valor</option>
                    </select>
                </div>
                {entries.length === 0 ? (
                    <p>Sem pendências por distribuidora.</p>
                ) : (
                    <ul>
                        {entries.map(([distributor, info]) => (
                            <li key={distributor} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <span>
                                    {distributor}
                                    <span className="badge" style={{ marginLeft: '6px' }}>
                                        {info.count}
                                    </span>
                                </span>
                                <span>R$ {formatCurrency(info.amount, 2)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TotalsByDistributor;