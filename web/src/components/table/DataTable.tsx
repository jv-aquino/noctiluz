import React from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  className?: string;
  tableClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  rowActions,
  className = '',
  tableClassName = '',
}: DataTableProps<T>) {
  return (
    <div className={`bg-pink-50 rounded-xl border border-gray-400 mt-4 ${className}`}>
      <table className={`min-w-full text-sm rounded-xl ${tableClassName}`}>
        <thead>
          <tr className="border-gray-400">
            {columns.map(col => (
              <th key={col.key} className={`font-semibold text-left table-th ${col.className || ''}`}>{col.header}</th>
            ))}
            {rowActions && <th className="text-center table-th">Opções</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const isLast = idx === data.length - 1;
            return (
              <tr
                key={getRowKey(row)}
                className={`border-t border-gray-400 hover:bg-stone-100 table-tr ${isLast ? 'last-row-rounded' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map(col => (
                  <td key={col.key} className={`table-td ${col.className || ''}`}>{col.render ? col.render(row) : (row as any)[col.key]}</td>
                ))}
                {rowActions && (
                  <td className="text-center table-td">{rowActions(row)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable; 