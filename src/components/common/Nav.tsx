import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
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
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      const id = window.setTimeout(() => setThemeMode(saved), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  // Controla o tema.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (themeMode === 'system') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = themeMode;
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
          <span className="icon"><Link href="/summary"><BarChartIcon /></Link></span>
          <span className="text-responsive"><Link href="/summary">Resumo Mensal</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/history"><HistoryIcon /></Link></span>
          <span className="text-responsive"><Link href="/history">Histórico</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/payables"><AccountBalanceIcon /></Link></span>
          <span className="text-responsive"><Link href="/payables">Contas</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/medicine-table"><TableChartIcon /></Link></span>
          <span className="text-responsive"><Link href="/medicine-table">Tabela</Link></span>
        </div>
        <div className={styles.navItem}>
          <span className="icon"><Link href="/products"><InventoryIcon /></Link></span>
          <span className="text-responsive"><Link href="/products">Produtos e Serviços</Link></span>
        </div>
      </div>

      <div className={styles.rightSide}>
        {/* Trecho comentado para futura melhoria de UI */}
        {/* <div className={styles.logo}>
          <Link href="/">
            <img src="/favicon.png" alt="logo" width={40} height={36} />
          </Link>
        </div> */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconOnly
          onClick={toggleThemeMode}
          aria-label="Alternar tema"
          leftIcon={
            <span key={themeMode} className={styles.themeIcon}>
              {themeMode === 'system' ? (
                <TuneIcon />
              ) : themeMode === 'light' ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </span>
          }
        />
      </div>
    </nav>

  );
};

export default Nav;
