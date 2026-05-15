import { ChevronUpIcon } from 'lucide-react';
import { TableHead, TableRow } from '../ui/table';
import type { HeadCell } from '@/types/table';
import { cn } from '@/lib/utils';

export const TableHeaderRow = ({
  headcells,
  sortConfig,
  onSort,
}: {
  headcells: Array<HeadCell>;
  sortConfig: any;
  onSort: (columnId: string) => void;
}) => (
  <TableRow
    className={cn(
      'sticky top-0 z-10',
      'bg-gray-100 dark:bg-gray-800',
      'shadow-sm dark:shadow-[0_1px_0_rgba(255,255,255,0.1)]',
      'border-none [&>*]:border-none',
      '[&>*]:hover:border-none'
    )}
  >
    {headcells.map(
      (headcell) =>
        headcell.view &&
        headcell.id !== 'selectAll' && (
          <TableHead
            key={headcell.id}
            onClick={() => onSort(headcell.id)}
           className={cn(
              'cursor-pointer select-none text-center',
              'text-gray-900 dark:text-gray-200',
              'hover:bg-gray-200 dark:hover:bg-gray-700 dark:bg-gray-900',
              'hover:text-gray-900 dark:hover:text-white',
              'border-none '
            )}
          >
            <div className="inline-flex justify-center items-center gap-1">
              {headcell.label}
              <ChevronUpIcon
                className={cn(
                  'w-3 h-3 transition-transform',
                  sortConfig?.key === headcell.id
                    ? sortConfig.direction === 'desc'
                      ? 'rotate-180 text-gray-600 dark:text-gray-300'
                      : 'text-gray-600 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500 opacity-50'
                )}
              />
            </div>
          </TableHead>
        ),
    )}
  </TableRow>
);
