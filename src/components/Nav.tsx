import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '@/styles/nav.module.css';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import TuneIcon from '@mui/icons-material/Tune';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TableChartIcon from '@mui/icons-material/TableChart';
import InventoryIcon from '@mui/icons-material/Inventory';

const Nav: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  // Controla o tema.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (themeMode === 'system') {
      document.documentElement.classList.remove('light', 'dark');
    } else {
      document.documentElement.classList.add(themeMode);
      document.documentElement.classList.remove(themeMode === 'light' ? 'dark' : 'light');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', themeMode);
    }
  }, [themeMode]);

  // Alterna o tema.
  const toggleThemeMode = () => {
    setThemeMode((current) =>
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system',
    );
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navLinks}>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/"><DashboardIcon /></Link></span>
          <span className="text-responsive"><Link href="/">Dashboard</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/resumo"><BarChartIcon /></Link></span>
          <span className="text-responsive"><Link href="/resumo">Resumo Mensal</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/historico"><HistoryIcon /></Link></span>
          <span className="text-responsive"><Link href="/historico">Histórico</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/contas-a-pagar"><AccountBalanceIcon /></Link></span>
          <span className="text-responsive"><Link href="/contas-a-pagar">Contas</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/tabela"><TableChartIcon /></Link></span>
          <span className="text-responsive"><Link href="/tabela">Tabela</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/produtos"><InventoryIcon /></Link></span>
          <span className="text-responsive"><Link href="/produtos">Produtos e Serviços</Link></span>
        </div>
      </div>

      <div className={styles.rightSide}>
        {/* Trecho comentado para futura melhoria de UI */}
        {/* <div className={styles.logo}>
          <Link href="/">
            <img src="/favicon.png" alt="logo" width={40} height={36} />
          </Link>
        </div> */}
        <button
          type="button"
          onClick={toggleThemeMode}
          className={styles.themeButton}
        >
          <span key={themeMode} className={styles.themeIcon}>
            {themeMode === 'system' ? (
              <TuneIcon />
            ) : themeMode === 'light' ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </span>
        </button>
      </div>
    </nav>

  );
};

export default Nav;
