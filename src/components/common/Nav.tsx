import Link from 'next/link';
import styles from '@/styles/nav.module.css';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TableChartIcon from '@mui/icons-material/TableChart';
import InventoryIcon from '@mui/icons-material/Inventory';

const Nav: React.FC = () => {
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
        <Link href="/settings" className={styles.settingsLink} aria-label="Configurações">
          <SettingsIcon />
        </Link>
      </div>
    </nav>

  );
};

export default Nav;
