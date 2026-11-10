import React from 'react';
import styles from '../../styles/layout.module.css';

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

const FormActions: React.FC<FormActionsProps> = ({ children, className }) => (
  <div className={className ? `${styles.formActions} ${className}` : styles.formActions}>{children}</div>
);

export default FormActions;
