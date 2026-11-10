import React from 'react';
import styles from '../../styles/layout.module.css';

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

const FormRow: React.FC<FormRowProps> = ({ children, className }) => (
  <div className={className ? `${styles.formRow} ${className}` : styles.formRow}>{children}</div>
);

export default FormRow;
