import React from 'react';
import { formatCurrency } from '../../utils/formatter';
import styles from '../../styles/totalsByDistributor.module.css';

interface TotalsByDistributorProps {
    totalsByDistributor: Record<string, number>;
}

const TotalsByDistributor: React.FC<TotalsByDistributorProps> = ({ totalsByDistributor }) => {
    return (
        <div>
            <div className={`${styles.summaryCard} ${styles.small}`}>
                <h3>Totais por distribuidora</h3>
                {Object.keys(totalsByDistributor).length === 0 ? (
                    <p>Sem pendências por distribuidora.</p>
                ) : (
                    <ul>
                        {Object.entries(totalsByDistributor).map(([distributor, amount]) => (
                            <li key={distributor}>
                                {distributor}: R$ {formatCurrency(amount, 2)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
</div>
    );
};

export default TotalsByDistributor;