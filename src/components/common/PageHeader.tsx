import React from 'react';
import styles from '../../styles/layout.module.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <header className={styles.pageHeader}>
    <div>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className={styles.pageActions}>{actions}</div> : null}
  </header>
);

export default PageHeader;
