import React from 'react';
import styles from '../../styles/layout.module.css';

interface PageGridProps {
  children: React.ReactNode;
  className?: string;
}

const PageGrid: React.FC<PageGridProps> = ({ children, className }) => (
  <div className={className ? `${styles.pageGrid} ${className}` : styles.pageGrid}>{children}</div>
);

export default PageGrid;
