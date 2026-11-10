import React from 'react';
import styles from '../../styles/table.module.css';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ wrapperClassName, className, children, ...props }, ref) => (
    <div className={`${styles.wrapper}${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <table ref={ref} className={`${styles.table}${className ? ` ${className}` : ''}`} {...props}>
        {children}
      </table>
    </div>
  ),
);

Table.displayName = 'Table';

export default Table;
