import React from 'react';
import styles from '../../styles/layout.module.css';

interface StatusChipProps {
  children: React.ReactNode;
}

const StatusChip: React.FC<StatusChipProps> = ({ children }) => (
  <span className={styles.statusChip}>{children}</span>
);

export default StatusChip;
