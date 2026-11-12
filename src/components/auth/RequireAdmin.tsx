import type { ReactNode } from 'react';
import PageShell from '@/components/common/PageShell';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import { useAuth } from '../../contexts/AuthContext';
import { PageSkeleton } from '../common/Skeleton';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSkeleton cards={3} />;
  }

  if (user?.role !== 'admin') {
    return (
      <PageShell>
        <PageHeader title="Acesso restrito" />
        <Panel>
          <PanelHeader title="Apenas administradores" />
          <p>Esta área está disponível apenas para administradores.</p>
        </Panel>
      </PageShell>
    );
  }

  return <>{children}</>;
}
