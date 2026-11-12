import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '@/styles/nav.module.css';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TableChartIcon from '@mui/icons-material/TableChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LogoutIcon from '@mui/icons-material/Logout';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

interface StoreOption {
  id: string;
  name: string;
}

const Nav: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [switchingStore, setSwitchingStore] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user) return;

    fetch('/api/stores')
      .then((response) => response.json())
      .then((body) => {
        if (mounted && Array.isArray(body.stores)) setStores(body.stores);
      })
      .catch(() => {
        if (mounted) setStores([]);
      });

    return () => { mounted = false; };
  }, [user]);

  const switchStore = async (storeId: string) => {
    setSwitchingStore(true);
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ storeId }),
      });
      if (response.ok) {
        const body = await response.json();
        if (body?.user) setUser(body.user);
        await queryClient.invalidateQueries();
      }
    } finally {
      setSwitchingStore(false);
    }
  };

  const isAdmin = user?.role === 'admin';

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
        {isAdmin && (
          <div className={styles.navItem}>
            <span className="icon"><Link href="/admin"><SupervisorAccountIcon /></Link></span>
            <span className="text-responsive"><Link href="/admin">Administração</Link></span>
          </div>
        )}
      </div>

      <div className={styles.rightSide} style={{ gap: '8px' }}>
        {stores.length > 0 && user && (
          <select
            className="headerSelect"
            value={user.storeId}
            disabled={switchingStore}
            onChange={(event) => void switchStore(event.target.value)}
            aria-label="Loja atual"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        )}
        {user && (
          <span className="text-responsive" title={`${user.companyName} • ${user.role === 'admin' ? 'Administrador' : 'Vendedor'}`}>
            {user.name}
          </span>
        )}
        <Link href="/settings" className={styles.settingsLink} aria-label="Configurações">
          <SettingsIcon />
        </Link>
        <button type="button" onClick={() => void logout()} aria-label="Sair" title="Sair" style={{ display: 'inline-flex', alignItems: 'center', padding: '6px' }}>
          <LogoutIcon fontSize="small" />
        </button>
      </div>
    </nav>

  );
};

export default Nav;
