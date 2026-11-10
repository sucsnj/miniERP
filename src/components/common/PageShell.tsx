import React from 'react';
import styles from '../../styles/layout.module.css';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

const PageShell: React.FC<PageShellProps> = ({ children, className }) => (
  <div className={className ? `${styles.page} ${className}` : styles.page}>{children}</div>
);

export default PageShell;
