import React from 'react';
import styles from '../../styles/layout.module.css';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Panel: React.FC<PanelProps> = ({ children, className, style }) => (
  <section className={className ? `${styles.panel} ${className}` : styles.panel} style={style}>{children}</section>
);

export default Panel;
