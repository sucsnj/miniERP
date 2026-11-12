import type { CSSProperties, FC } from 'react';
import styles from '../../styles/skeleton.module.css';
import PageShell from './PageShell';
import PageHeader from './PageHeader';
import Panel from './Panel';

export type SkeletonVariant = 'line' | 'title' | 'circle' | 'button' | 'card' | 'row' | 'block';

const VARIANT_CLASS: Record<SkeletonVariant, string> = {
  line: styles.text,
  title: styles.title,
  circle: styles.circle,
  button: styles.button,
  card: styles.card,
  row: styles.tableRow,
  block: styles.block,
};

export interface SkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
  style?: CSSProperties;
}

export const Skeleton: FC<SkeletonProps> = ({
  variant = 'line',
  count = 1,
  width,
  height,
  className,
  style,
}) => {
  const classes = [styles.skeleton, VARIANT_CLASS[variant], className].filter(Boolean).join(' ');

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={classes}
          style={{ width, height, ...style }}
        />
      ))}
    </>
  );
};

export const SkeletonText: FC<{ lines?: number; lastLineWidth?: CSSProperties['width'] }> = ({
  lines = 3,
  lastLineWidth = '70%',
}) => (
  <div aria-busy="true" style={{ display: 'grid', gap: '8px' }}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        variant="line"
        width={index === lines - 1 ? lastLineWidth : undefined}
      />
    ))}
  </div>
);

const COLUMN_WIDTHS = ['75%', '55%', '65%', '40%', '50%'];

export const SkeletonTable: FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 4 }) => (
  <div aria-busy="true" style={{ display: 'grid', gap: '4px' }}>
    <Skeleton variant="row" height="38px" style={{ marginBottom: '4px' }} />
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div
        key={rowIndex}
        className={styles.rowGroup}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, columnIndex) => {
          // Varia a largura de forma determinística para parecer texto real
          const width = COLUMN_WIDTHS[(rowIndex + columnIndex) % COLUMN_WIDTHS.length];
          return <Skeleton key={columnIndex} variant="line" height="14px" width={width} />;
        })}
      </div>
    ))}
  </div>
);

const KPI_PLACEHOLDERS = [
  { label: '42%', title: '65%', meta: '55%' },
  { label: '50%', title: '55%', meta: '48%' },
  { label: '36%', title: '72%', meta: '64%' },
  { label: '46%', title: '58%', meta: '70%' },
  { label: '54%', title: '46%', meta: '52%' },
  { label: '40%', title: '68%', meta: '60%' },
];

export const SkeletonCards: FC<{ cards?: number; minHeight?: CSSProperties['height'] }> = ({
  cards = 3,
  minHeight = '116px',
}) => (
  <div
    aria-busy="true"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '12px',
    }}
  >
    {Array.from({ length: cards }, (_, index) => {
      const placeholder = KPI_PLACEHOLDERS[index % KPI_PLACEHOLDERS.length];

      return (
        <div key={index} className={styles.kpiCard} style={{ minHeight }}>
          <Skeleton variant="line" width={placeholder.label} height="12px" />
          <Skeleton variant="title" width={placeholder.title} height="26px" />
          <Skeleton variant="line" width={placeholder.meta} height="11px" />
        </div>
      );
    })}
  </div>
);

export type PageSkeletonLayout = 'standard' | 'dashboard' | 'table' | 'settings' | 'form';

export const PageSkeleton: FC<{ layout?: PageSkeletonLayout; title?: string; cards?: number }> = ({
  layout = 'standard',
  title = 'Carregando...',
  cards = 3,
}) => {
  let content;

  switch (layout) {
    case 'dashboard':
      content = (
        <>
          <SkeletonCards cards={4} minHeight="112px" />
          <Panel>
            <SkeletonTable rows={6} columns={4} />
          </Panel>
        </>
      );
      break;
    case 'table':
      content = (
        <Panel>
          <SkeletonTable rows={8} columns={6} />
        </Panel>
      );
      break;
    case 'settings':
      content = (
        <div
          aria-busy="true"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Panel key={index}>
              <SkeletonText lines={4} lastLineWidth="50%" />
            </Panel>
          ))}
        </div>
      );
      break;
    case 'form':
      content = (
        <Panel>
          <SkeletonText lines={6} lastLineWidth="60%" />
          <Skeleton variant="block" height="128px" style={{ marginTop: '16px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Skeleton variant="button" />
            <Skeleton variant="button" />
          </div>
        </Panel>
      );
      break;
    default:
      content = (
        <>
          <SkeletonCards cards={cards} minHeight="110px" />
          <Panel>
            <SkeletonText lines={5} />
          </Panel>
        </>
      );
  }

  return (
    <PageShell>
      <PageHeader title={title} />
      {content}
    </PageShell>
  );
};

export default Skeleton;