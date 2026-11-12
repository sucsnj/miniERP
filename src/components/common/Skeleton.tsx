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
}) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        aria-hidden="true"
        className={className ? `${styles.skeleton} ${VARIANT_CLASS[variant]} ${className}` : `${styles.skeleton} ${VARIANT_CLASS[variant]}`}
        style={{ ...style, width, height }}
      />
    ))}
  </>
);

export const SkeletonText: FC<{ lines?: number; lastLineWidth?: CSSProperties['width'] }> = ({
  lines = 3,
  lastLineWidth = '70%',
}) => (
  <div aria-busy="true" style={{ display: 'grid', gap: '8px' }}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton key={index} variant="line" width={index === lines - 1 ? lastLineWidth : undefined} />
    ))}
  </div>
);

export const SkeletonTable: FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 4 }) => (
  <div aria-busy="true" style={{ display: 'grid', gap: '8px' }}>
    <Skeleton variant="row" height="36px" />
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div
        key={rowIndex}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: '12px',
        }}
      >
        {Array.from({ length: columns }, (_, columnIndex) => (
          <Skeleton key={columnIndex} variant="line" height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCards: FC<{ cards?: number; minHeight?: CSSProperties['height'] }> = ({
  cards = 3,
  minHeight,
}) => (
  <div
    aria-busy="true"
    style={{ display: 'grid', gridTemplateColumns: `repeat(${cards}, minmax(0, 1fr))`, gap: '12px' }}
  >
    {Array.from({ length: cards }, (_, index) => (
      <Skeleton key={index} variant="card" height={minHeight} />
    ))}
  </div>
);

export const PageSkeleton: FC<{ cards?: number }> = ({ cards = 3 }) => (
  <PageShell>
    <PageHeader title="Carregando..." />
    <SkeletonCards cards={cards} minHeight="110px" />
    <Panel>
      <SkeletonText lines={5} />
    </Panel>
  </PageShell>
);

export default Skeleton;
