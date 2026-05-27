/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { format } from 'date-fns';
import { TableCell, TableRow } from '../ui/table';
import type { HeadCell, Row } from '@/types/table';

export const TableRowComponent = ({
  row,
  headcells,
  optionPopup,
  onClick,
  clickableColumn,
  colorCode = false,
  colorCodeLogic,
}: {
  row: Row;
  headcells: Array<HeadCell>;
  optionPopup: (data: Row) => React.ReactNode;
  onClick?: (row: Row, headcellId: string) => void;
  clickableColumn?: string | Array<string>;
  colorCode?: boolean;
  colorCodeLogic?: (
    row: Row,
    headcellId: string,
  ) => string | { backgroundColor?: string; color?: string } | undefined;
}) => {
const getStatusStyles = (status: string) => {
  switch (true) {
    case status?.includes('Approved'):
       return 'bg-[#EDFDF5] text-[#0c8b63] border border-[#a8d5c4] uppercase';

    case status?.includes('PENDING'):
      return 'bg-orange-100 text-orange-600 border border-orange-200';

    case status?.includes('REJECTED'):
      return 'bg-red-100 text-red-600 border border-red-200';

    default:
      return '-';
  }
};
  return (
    <TableRow>
      {headcells.map((headcell) => {
        if (!headcell.view || headcell.id === 'selectAll') return null;

        const [parent, child] = headcell.id.includes('.')
          ? headcell.id.split('.')
          : [];
        const isClickable = Array.isArray(clickableColumn)
          ? clickableColumn.includes(headcell.id)
          : clickableColumn === headcell.id;

        const handleClick = isClickable
          ? (e: React.MouseEvent) => {
            e.stopPropagation();
            onClick?.(row, headcell.id);
          }
          : undefined;

        // Base styles
        const cellStyle: React.CSSProperties = {
          ...(isClickable ? { cursor: 'pointer', color: '#2563eb' } : {}),
        };

        // Apply color coding logic if enabled
        if (colorCode && colorCodeLogic) {
          const colorResult = colorCodeLogic(row, headcell.id);

          if (typeof colorResult === 'string') {
            cellStyle.backgroundColor = colorResult;
          } else if (
            typeof colorResult === 'object' &&
            (colorResult.backgroundColor || colorResult.color)
          ) {
            Object.assign(cellStyle, colorResult);
          }
        }

        const cellClass = `px-4 py-2 text-center max-w-[400px] whitespace-pre-wrap break-words ${isClickable
          ? 'cursor-pointer text-blue-600 hover:text-blue-700 hover:underline'
          : ''
          }`;

        let displayValue: React.ReactNode = '-';

        if (headcell.id === 'action' ) {
          displayValue = optionPopup(row);
        } else if (
          (headcell.id.includes('Date') ||
            headcell.id.includes('lastCountedAt')||headcell.id.includes('scheduleOn')) &&
          row?.[headcell.id] && !headcell.visualFormat
        ) {
          // Handle date values
          // displayValue = formatDate(row[headcell.id], 'yyyy-mm-dd');
          displayValue = format(new Date(row[headcell.id]), 'dd-MM-yyyy HH:mm:ss');
        } else if (headcell.id.includes('.') && parent && child) {
          // Handle nested objects
          displayValue = row?.[parent]?.[child] ?? '-';
        } else if (headcell.id === 'currentLevelstatus') {
  const value = row?.[headcell.id];
console.log(value);

  displayValue = (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusStyles(
        value,
      )}`}
    >
      {value||'-'}
    </span>
  );
}else{
          const value = row?.[headcell.id];

          if (Array.isArray(value)) {
            // Array values
            displayValue = value.length > 0 ? value.join(', ') : '-';
          } else if (value !== null && value !== undefined && value !== '') {
            // Use visualFormat if provided
            displayValue = headcell.visualFormat
              ? headcell.visualFormat(value)
              : value;
          } else {
            displayValue = '-';
          }
        }

        return (
          <TableCell
            key={headcell.id}
            onClick={handleClick}
            style={cellStyle}
            className={cellClass}
          >
            {displayValue}
          </TableCell>
        );
      })}
    </TableRow>
  );
};
