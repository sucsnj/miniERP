import type { CSSProperties } from 'react';

export const CARDS_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '12px',
};

export const MASONRY_STYLE: CSSProperties = {
  columnWidth: '260px',
  columnGap: '12px',
};

export const MASONRY_CARD_STYLE: CSSProperties = {
  padding: '10px',
  display: 'flow-root',
  width: '100%',
  marginBottom: '12px',
  breakInside: 'avoid',
};

export const MASONRY_FORM_STYLE: CSSProperties = {
  width: '100%',
  marginBottom: '12px',
  breakInside: 'avoid',
};
