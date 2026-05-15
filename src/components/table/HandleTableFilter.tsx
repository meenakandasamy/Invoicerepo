import React from 'react';
import type { HeadCell, Row } from '@/types/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DropdownSelect } from '@/utils/common/components/dropDown';
import { MultiSelect } from '../form/multiSelect';
import Loader from '@/utils/common/components/loader';

// A reusable, controlled version of your custom DatePicker
import { DatePicker } from '@/utils/common/DateSelector';

export const HandleTableFilter = ({ headCells, rows, handleFilter, children }: {
  headCells: Array<HeadCell>;
  rows: Array<Row>;
  handleFilter: (filteredRow: Array<Row>, reset?: boolean) => void;
  children: React.ReactNode;
}) => {
  const [rowsValue, setRowsValue] = React.useState<Record<string, any>>({});
  const [filteredRows, setFilteredRows] = React.useState<Array<Row>>([]);
  const [isOpenPopover, setIsOpenPopover] = React.useState<boolean>(false);

  const baselineRef = React.useRef<Array<Row>>([]);

  React.useEffect(() => {
    const noActiveFilters = Object.keys(rowsValue).length === 0;
    const baselineEmpty = baselineRef.current.length === 0;
    const grew = rows.length > baselineRef.current.length;

    if (baselineEmpty || grew || noActiveFilters) {
      baselineRef.current = rows;
      if (noActiveFilters) setFilteredRows(rows);
    }
  }, [rows, rowsValue]);

  const handleFilterState = (name: string, value: any | any[]) => {
    const newValues = { ...rowsValue, [name]: value };
    setRowsValue(newValues);

    const source = baselineRef.current.length ? baselineRef.current : rows;

    const filtered = source.filter((row) =>
      Object.entries(newValues).every(([key, val]) => {
        if (
          val === '' ||
          val === null ||
          val === undefined ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'object' &&
            !Array.isArray(val) &&
            !Object.values(val).some((v) => v !== null && v !== ''))
        ) {
          return true;
        }

        const filterType = headCells.find((h) => h.id === key)?.filterType;
        const rowValue = row[key];

        if (filterType === 'select') {
          if (key === 'installmentStatus') {
            const selectedLabel = val as string;
            return Object.keys(row).some((col) => {
              if (col.toLowerCase().startsWith('status') && row[`${col}Raw`]) {
                return row[`${col}Raw`] === selectedLabel;
              }
              return false;
            });
          }
          return String(rowValue) === String(val);
        }

        if (filterType === 'multiSelect') {
          return Array.isArray(val) && val.includes(rowValue);
        }

        if (filterType === 'range') {
          const num = Number(rowValue);
          if (isNaN(num)) return false;
          const min = val.min !== undefined && val.min !== '' ? Number(val.min) : -Infinity;
          const max = val.max !== undefined && val.max !== '' ? Number(val.max) : Infinity;
          return num >= min && num <= max;
        }

        if (filterType === 'date') {
          if (!rowValue || !val) return false;
          const rowDate = new Date(rowValue);
          const filterDate = new Date(val);
          if (isNaN(rowDate.getTime()) || isNaN(filterDate.getTime())) return false;
          return rowDate.toDateString() === filterDate.toDateString();
        }

        if (filterType === 'dateRange') {
          const normalizeDate = (d: string, end = false) => {
            const date = new Date(d);
            if (isNaN(date.getTime())) return null;
            date.setHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
            return date;
          };
          const fromDate = val.from ? normalizeDate(val.from) : null;
          const toDate = val.to ? normalizeDate(val.to, true) : null;

          if (key === 'dueDate') {
            return Array.from({ length: 6 }).some((_, i) => {
              const col = `dueDate${i + 1}`;
              const raw = row[col];
              if (!raw || typeof raw !== 'string') return false;
              const d = new Date(raw);
              if (isNaN(d.getTime())) return false;
              if (fromDate && d < fromDate) return false;
              if (toDate && d > toDate) return false;
              return true;
            });
          }

          const v = row[key];
          if (!v || typeof v !== 'string') return false;
          const d = new Date(v);
          if (isNaN(d.getTime())) return false;
          if (fromDate && d < fromDate) return false;
          if (toDate && d > toDate) return false;
          return true;
        }

        return String(rowValue).toLowerCase().includes(String(val).toLowerCase());
      }),
    );

    setFilteredRows(filtered);
  };

  const poCountViewer = () =>
    Object.keys(rowsValue).length === 0 ? null : filteredRows.length;

  const handleApply = () => {
    handleFilter(filteredRows);
    setIsOpenPopover(false);
  };

  const handleClose = () => {
    setIsOpenPopover(false);
    setRowsValue({});
    setFilteredRows(rows);
    handleFilter([], true); // 👈 pass second arg to signal reset
  };
  // console.log(Object.keys(rowsValue), 'rowsValue');

  return (
    <Popover open={isOpenPopover} onOpenChange={setIsOpenPopover}>
      <PopoverTrigger asChild>
        <div>{children}</div>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[500px] overflow-y-auto p-0 mr-4 rounded-xl shadow-lg dark:bg-gray-900">
        <div className="grid gap-4">
          <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b px-4 py-3">
            <h4 className="leading-none font-medium">Filter</h4>
            <p className="text-muted-foreground text-sm">
              Customize your view with advanced filters.
            </p>
          </div>

          <div className="grid gap-3 px-5 py-3 ">
            {headCells
              .filter((cell) => cell && cell.filterable && cell.id !== "action")
              .map((cell) => (
                <div
                  // FIX: Make the key dynamic based on whether options are loaded.
                  // This forces a re-render of the entire row when options arrive.
                  key={`${cell.id}-${!!cell.filterOptions?.length}`}
                  className="grid grid-cols-3 items-center gap-4"
                >
                  <Label htmlFor={cell.id}>{cell.label}</Label>

                  {cell.filterType === "select" ? (
                    cell.filterOptions?.length ? (
                      <DropdownSelect
                        key={`${cell.id}-dropdown`}
                        value={rowsValue[cell.id]?.toString() || ""}
                        onChange={(val) => handleFilterState(cell.id, val)}
                        options={cell.filterOptions.map((opt) => ({
                          label: String(opt),
                          value: String(opt),
                        }))}
                        placeholder={`Select ${cell.label}`}
                        styles={{
                          wrapper: "col-span-2 w-full",
                        }}
                        showClearButton={true}
                      />
                    ) : (
                      <div className="col-span-2 flex items-center justify-center h-8">
                        <Loader />
                      </div>
                    )
                  ) : cell.filterType === "multiSelect" ? (
                    cell.filterOptions?.length ? (
                      <MultiSelect
                        key={`${cell.id}-multiselect`}
                        options={cell.filterOptions}
                        selected={rowsValue[cell.id] || []}
                        onChange={(vals) => handleFilterState(cell.id, vals)}
                        placeholder={`Select ${cell.label}`}
                        styles={{
                          wrapper: "col-span-2 w-full",
                          button: "h-8 px-2 text-sm",
                          popover: "max-h-[300px] overflow-y-auto",
                          item: "text-sm",
                        }}
                      />
                    ) : (
                      <div className="col-span-2 flex items-center justify-center h-8">
                        <Loader />
                      </div>
                    )
                  ) : cell.filterType === 'range' ? (
                    <div className="col-span-2 flex items-center gap-2">
                      <Input
                        id={`${cell.id}-min`}
                        type="number"
                        placeholder="Min"
                        value={rowsValue[cell.id]?.min || ''}
                        onChange={(e) =>
                          handleFilterState(cell.id, {
                            ...rowsValue[cell.id],
                            min: e.target.value,
                          })
                        }
                        className="h-8 dark:bg-gray-900"
                      />
                      <Input
                        id={`${cell.id}-max`}
                        type="number"
                        placeholder="Max"
                        value={rowsValue[cell.id]?.max || ''}
                        onChange={(e) =>
                          handleFilterState(cell.id, {
                            ...rowsValue[cell.id],
                            max: e.target.value,
                          })
                        }
                        className="h-8 dark:bg-gray-900"
                      />
                    </div>
                  ) : cell.filterType === 'date' ? (
                    <div className="col-span-2">
                      <DatePicker
                        value={
                          rowsValue[cell.id]
                            ? new Date(rowsValue[cell.id])
                            : undefined
                        }
                        onChange={(date) => handleFilterState(cell.id, date)}
                      />
                    </div>
                  ) : cell.filterType === 'dateRange' ? (
                    <div className="col-span-2 width-full flex flex-col space-y-2 ">
                      <div className="col-span-2 flex items-center gap-2 width-full ">
                        <DatePicker
                          placeholder="From date"
                          value={
                            rowsValue[cell.id]?.from
                              ? new Date(rowsValue[cell.id].from)
                              : undefined
                          }
                          onChange={(date) =>
                            handleFilterState(cell.id, {
                              ...rowsValue[cell.id],
                              from: date,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2 width-full">
                        <DatePicker
                          placeholder="To date"
                          value={
                            rowsValue[cell.id]?.to
                              ? new Date(rowsValue[cell.id].to)
                              : undefined
                          }
                          onChange={(date) =>
                            handleFilterState(cell.id, {
                              ...rowsValue[cell.id],
                              to: date,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <Input
                      id={cell.id}
                      type="text"
                      value={rowsValue[cell.id] || ''}
                      onChange={(e) =>
                        handleFilterState(cell.id, e.target.value)
                      }
                      className="col-span-2 h-8 dark:bg-gray-900"
                    />
                  )}
                </div>
              ))}
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-gray-900 z-10 border-t px-4 py-3 flex justify-between items-center">
            <p className="text-sm">
              {poCountViewer() == null
                ? ''
                : poCountViewer() === 0
                  ? 'No Data Found'
                  : `${poCountViewer()} Data Found`}
            </p>
            <div className="flex gap-2">
              <Button
                className="bg-red-500 hover:bg-red-600 cursor-pointer"
                onClick={handleClose}
              >
                Clear
              </Button>
              <Button
                disabled={
                  Object.keys(rowsValue).length === 0 || poCountViewer() === 0
                }
                className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
