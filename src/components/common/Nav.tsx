import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import styles from '@/styles/nav.module.css';
import { Skeleton } from '@/components/common/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TableChartIcon from '@mui/icons-material/TableChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface StoreOption {
  id: string;
  name: string;
}

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/summary', label: 'Resumo Mensal', Icon: BarChartIcon },
  { href: '/history', label: 'Histórico', Icon: HistoryIcon },
  { href: '/payables', label: 'Contas', Icon: AccountBalanceIcon },
  { href: '/medicine-table', label: 'Tabela', Icon: TableChartIcon },
  { href: '/products', label: 'Produtos e Serviços', Icon: InventoryIcon },
];

const Nav: React.FC = () => {
  const { user, loading, logout, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [switchingStore, setSwitchingStore] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const switchStore = async (event: FormEvent<HTMLSelectElement>) => {
    const storeId = event.currentTarget.value;
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
        await queryClient.removeQueries({ queryKey: ['tenant'] });
      }
    } finally {
      setSwitchingStore(false);
    }
  };

  const initial = (user?.name.trim().charAt(0) || '?').toUpperCase();
  const avatar = user?.avatarUrl && failedAvatarUrl !== user.avatarUrl ? user.avatarUrl : null;

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <Link href="/" className={styles.brand} prefetch>MinErp</Link>

      <div className={styles.navLinks}>
        {user ? (
          NAV_ITEMS.map(({ href, label, Icon }) => (
            <div className={styles.navItem} key={href}>
              <span className="icon"><Link href={href} prefetch><Icon /></Link></span>
              <span className="text-responsive"><Link href={href} prefetch>{label}</Link></span>
            </div>
          ))
        ) : (
          <>
            <Skeleton variant="button" width={88} height="28px" />
            <Skeleton variant="button" width={72} height="28px" />
            <Skeleton variant="button" width={88} height="28px" />
          </>
        )}
      </div>

      <div className={styles.rightSide}>
        {!user || loading ? (
          <>
            <Skeleton variant="button" width={132} height="32px" />
            <Skeleton variant="circle" width="34px" height="34px" />
          </>
        ) : (
          <>
            {stores.length > 0 && (
              <select
                className="headerSelect"
                value={user.storeId}
                disabled={switchingStore}
                onChange={(event) => void switchStore(event)}
                aria-label="Loja atual"
                style={{ maxWidth: '180px' }}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            )}

            <div ref={menuRef} className={styles.userMenuWrapper}>
              <button
                type="button"
                className={styles.userMenuButton}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Abrir menu de ${user.name}`}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {avatar ? (
                  <img
                    className={styles.avatar}
                    src={avatar}
                    alt={user.name}
                    onError={() => user.avatarUrl && setFailedAvatarUrl(user.avatarUrl)}
                  />
                ) : (
                  <span className={styles.avatarInitial} aria-hidden="true">{initial}</span>
                )}
                <span className="text-responsive" title={`${user.companyName} • ${user.role === 'admin' ? 'Administrador' : 'Vendedor'}`}>
                  {user.name}
                </span>
                <ExpandMoreIcon fontSize="small" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div className={styles.menuDropdown} role="menu" aria-label="Opções do usuário">
                  <div className={styles.menuIdentity}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span>{user.companyName} • {user.role === 'admin' ? 'Administrador' : 'Vendedor'}</span>
                  </div>
                  <hr className={styles.menuDivider} />
                  <Link href="/settings" role="menuitem" className={styles.menuItem} prefetch onClick={() => setMenuOpen(false)}>
                    <SettingsIcon fontSize="small" />
                    Configurações
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" role="menuitem" className={styles.menuItem} prefetch onClick={() => setMenuOpen(false)}>
                      <SupervisorAccountIcon fontSize="small" />
                      Administração
                    </Link>
                  )}
                  <button type="button" role="menuitem" className={styles.menuItem} onClick={() => void logout()}>
                    <LogoutIcon fontSize="small" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
