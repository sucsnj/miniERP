import React from 'react';
import styles from '../../styles/layout.module.css';

interface PanelHeaderProps {
  title: string;
  chip?: React.ReactNode;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ title, chip }) => (
  <div className={styles.panelHeader}>
    <h2>{title}</h2>
    {chip}
  </div>
);

export default PanelHeader;
