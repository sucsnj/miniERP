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
    {Array.from({ length: cards }, (_, index) => (
      <div key={index} className={styles.kpiCard} style={{ minHeight }}>
        <Skeleton variant="line" width="42%" height="12px" />
        <Skeleton variant="title" width="65%" height="26px" />
        <Skeleton variant="line" width="55%" height="11px" />
      </div>
    ))}
  </div>
);

export const PageSkeleton: FC<{ title?: string; cards?: number }> = ({
  title = 'Carregando...',
  cards = 3,
}) => (
  <PageShell>
    <PageHeader title={title} />
    <SkeletonCards cards={cards} minHeight="110px" />
    <Panel>
      <SkeletonText lines={5} />
    </Panel>
  </PageShell>
);

export default Skeleton;