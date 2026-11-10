import React from 'react';
import styles from '../../styles/contas.module.css';
import { formatMonthName } from '../../utils/date';
import { capitalize } from '../../utils/captalize';
import BackupIcon from '@mui/icons-material/Backup';
import Button from '@/components/common/Button';
import { now } from '../../utils/date';

interface PayablesHeaderProps {
  year: number;
  month: number;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  handleBackup: () => Promise<void>;
}

const PayablesHeader: React.FC<PayablesHeaderProps> = ({ year, month, setYear, setMonth, handleBackup }) => {
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
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || today.year())}
          />
        </label>
        <label>
          Mês:
          <select className={styles.mesSelect} value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {capitalize(formatMonthName(i + 1))}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="info" onClick={handleBackup} leftIcon={<BackupIcon />}>
          Backup Anual
        </Button>
      </div>
    </header>
  );
};

export default PayablesHeader;
