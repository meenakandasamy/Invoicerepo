import * as React from 'react';
import type { HeadCell } from '@/types/table';
import type { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Checked = DropdownMenuCheckboxItemProps['checked'];

export function HeadCellsHandler({
  headCells,
  handleHeadCellsFromActions,
  children,
}: {
  headCells: Array<HeadCell>;
  handleHeadCellsFromActions: (modifiedHeadcells: Array<HeadCell>) => void;
  children: React.ReactNode;
}) {
  const selectAll: HeadCell = {
    id: 'selectAll',
    label: 'Select All',
    view: false,
    defaultView: false,
    filterable: false,
  };
  const [headCellsState, setHeadCellsState] = React.useState<Array<HeadCell>>([
    selectAll,
    ...headCells,
  ]);

  const handleView = (id: string, view: Checked) => {
    setHeadCellsState((prev: Array<HeadCell>) => {
      let result;
      if (id === 'selectAll') {
        const newView = !view;
        result = prev.map((headCell: HeadCell) => {
          if (!newView && headCell.defaultView) {
            return { ...headCell, view: true };
          } else {
            return { ...headCell, view: newView };
          }
        });
      } else {
        result = prev.map((headCell: HeadCell) => {
          if (headCell.id === id) {
            return { ...headCell, view: !view };
          }
          return headCell;
        });
      }
      handleHeadCellsFromActions(result);
      return result;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer outline-none shadow-none border-none bg-transparent hover:bg-transparent h-0 w-0">
          {children}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50 h-100">
        <DropdownMenuLabel className="text-sm">Column Hider</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {headCellsState.length
          ? headCellsState.map(
            (headCell: HeadCell) =>
              headCell.id !== 'action' && (
                <DropdownMenuCheckboxItem
                  checked={headCell.view}
                  key={headCell.id}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() =>
                    handleView(headCell.id, headCell.view)
                  }
                >
                  {headCell.label}
                </DropdownMenuCheckboxItem>
              ),
          )
          : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
