import React from 'react';
import styles from '../../styles/payables.module.css';

interface PayablesHeaderProps {
}

const PayablesHeader: React.FC<PayablesHeaderProps> = ({}) => {

  return (
    <header className={styles.contasHeader}>
      <div>
        <h1>Contas a pagar</h1>
        <p>Cadastro detalhado, agenda automática e resumo analítico de pagamentos.</p>
      </div>
    </header>
  );
};

export default PayablesHeader;
