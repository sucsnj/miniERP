import React from 'react';
import styles from '../styles/contas.module.css';
import { formatMonthName } from '../utils/date';
import { capitalize } from '../utils/captalize';
import BackupIcon from '@mui/icons-material/Backup';
import { now } from '../utils/date';

interface ContasAPagarHeaderProps {
  ano: number;
  mes: number;
  setAno: (ano: number) => void;
  setMes: (mes: number) => void;
  handleBackup: () => Promise<void>;
}

const ContasAPagarHeader: React.FC<ContasAPagarHeaderProps> = ({ ano, mes, setAno, setMes, handleBackup }) => {
  const today = now();

  return (
    <header className={styles.contasHeader}>
      <div>
        <h1>Contas a pagar</h1>
        <p>Cadastro detalhado, agenda automática e resumo analítico de pagamentos.</p>
      </div>
      <div className={styles.contasActions}>
        <label>
          Ano:
          <input
            className={styles.anoInput}
            type="number"
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value, 10) || today.year())}
          />
        </label>
        <label>
          Mês:
          <select className={styles.mesSelect} value={mes} onChange={(e) => setMes(parseInt(e.target.value, 10))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {capitalize(formatMonthName(i + 1))}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={handleBackup} className={styles.backupButton}>
          <BackupIcon />
          Backup Anual
        </button>
      </div>
    </header>
  );
};

export default ContasAPagarHeader;
