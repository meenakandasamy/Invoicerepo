import * as React from 'react';

import { EllipsisVertical, FileQuestion, Download } from 'lucide-react';
import { useEffect } from 'react';
import { TabsTrigger } from '@radix-ui/react-tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsList } from '../ui/tabs';
import {CustomTicketform}  from '../form/customTicketform';
import { ToolbarActions } from './ActionToolBar';
import { SearchBar } from './SearchBar';
import { TableHeaderRow } from './TableHeader';
import { TableRowComponent } from './TableRow';

import { Pagination } from './Pagination';
import type { HeadCell, Row, TableProps } from '@/types/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdvancedTicketChart from '@/components/Chart/barticketchart'
import TicketSummaryCards from '@/components/Chart/Ticketcard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export const CustomTable = ({
  headcells,
  rows,
  pageName,
  functions = {},
  access = { hasCreateAccess: true, hasUpdateAccess: true },
  hide,
  editOptions = ['Edit'],
  onClick,
  clickableColumn,
  customToolbarItems = { position: 'before', element: null },
  colorCode,
  colorCodeLogic,
  includedDownloadColumns = [],
  tabsFns,
  allTabsValues,
  field,
  option,
  onSubmit,
  toBackend,
  labels,dataChart,
  carddata,isdownload,

}: TableProps) => {
  const {
    addFn = () => {},
    optionHandler = () => {},
    handleFileChange = () => {},
    handleDownloadAction=() =>{}
  } = functions;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [handledHeadCells, setHandledHeadCells] = React.useState(headcells);
  const [filteredRowsByFilter, setFilteredRowsByFilter] = React.useState<
    Array<Row>
  >([]);
  const [isFilterActive, setIsFilterActive] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    setFilteredRowsByFilter([]);
    setSearchTerm('');
    setIsFilterActive(false);
    setCurrentPage(1);
  }, [rows]);
  useEffect(() => {
    setHandledHeadCells(headcells);
  }, [headcells]);

  const handleHeadCellsFromTable = (modified: Array<HeadCell>) => {
    setHandledHeadCells(modified);
  };

  const handleFilterTable = (filteredRow: Array<Row>, reset = false) => {
    if (reset) {
      setFilteredRowsByFilter([]);
      setIsFilterActive(false);
      setSearchTerm('');
      setCurrentPage(1);
    } else {
      setFilteredRowsByFilter(filteredRow);
      setIsFilterActive(true);
      setCurrentPage(1);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (columnId: string) => {
    setSortConfig((prev) =>
      prev?.key === columnId
        ? {
            key: columnId,
            direction: prev.direction === 'asc' ? 'desc' : 'asc',
          }
        : { key: columnId, direction: 'asc' },
    );
  };

  const activeRows = isFilterActive ? filteredRowsByFilter : rows;

  const searchedRows = activeRows.filter((row) =>
    headcells.some((cell) => {
      const value = row[cell.id]?.toString().toLowerCase() || '';
      return value.includes(searchTerm.toLowerCase());
    }),
  );

  const sortedRows = sortConfig
    ? [...searchedRows].sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || '';
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      })
    : searchedRows;

  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // const downloadableRows = sortedRows.filter(
  //   (row) => !excludedDownloadColumns.some((column) => column in row),
  // );

  const downloadableRows = sortedRows.map((row) => {
    const newRow = { ...row };
    const filteredRow = Object.fromEntries(
      Object.entries(newRow).filter(([key]) =>
        includedDownloadColumns.includes(key),
      ),
    );
    return filteredRow;
  });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string | number) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const optionPopup = (row: Row) => (
      <div className="flex items-center justify-center">
    
    {/* First Icon - Custom Function */}

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
     disabled={
  !access.hasUpdateAccess ||
  (
    pageName === 'Ticket Approval' &&
    (
      row.approverstatus === false ||
      row.currentLevel === row.approverLevel ||
      row.currentLevel < 0 ||
      row.currentLevel === 2
    )
  )
}
          size="icon"
          className="cursor-pointer"
        >
          <EllipsisVertical />
        </Button>
        
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 cursor-pointer ">
        {editOptions.map((option, index) => {
          const isDelete = option === 'Delete';
          return (
            <React.Fragment key={index}>
              {isDelete && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={
                  isDelete
                    ? 'bg-red-800 text-red-200 cursor-pointer hover:bg-red-600 hover:text-red-100 dark:hover:bg-red-600'
                    : 'cursor-pointer hover:bg-gray-50'
                }
                onClick={() => optionHandler(option, row)}
              >
                {option}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
    {isdownload&&(
      <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer"
      
      onClick={() => handleDownloadAction(row)}
    >
      <Download className="h-4w-4" />
    </Button>)}
    </div>
  );

  return (
    <section className="w-full h-full flex flex-col">
      {allTabsValues && (
        <Tabs defaultValue={allTabsValues.tabsValue} className="flex self-end">
          <TabsList className="flex gap-2 bg-violet-100 p-1 rounded-xl">
            {allTabsValues.tabsHeadcells.map((tabList: any) => (
              <TabsTrigger
                key={tabList.id}
                value={tabList.id}
                onClick={() => tabsFns.setTabsValue(tabList.id)}
                className="
          flex items-center gap-1
          rounded-lg px-3 py-1
          text-sm
          cursor-pointer
          data-[state=active]:bg-white
          data-[state=active]:shadow-sm
          data-[state=active]:text-gray-800
        "
              >
                {tabList.label}
                {allTabsValues.tabsCount[tabList.id] > 0 && (
                  <span
                    className={
                      tabList.countClassName
                        ? tabList.countClassName +
                          ' ml-1 flex h-5 min-w-5 items-center justify-center rounded-full text-xs font-medium px-1'
                        : 'ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-800 px-1'
                    }
                  >
                    {allTabsValues.tabsCount[tabList.id]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      <div className="w-full">
        {isFilterActive && (
          <div className="text-xs text-muted-foreground pl-4">
            Showing filtered results — press Clear to reset view
          </div>
        )}
        <div className="py-2">
          <Card>
            <CardContent className="flex justify-between">
              <SearchBar
                searchTerm={searchTerm}
                onChange={handleSearch}
                key={pageName + 'search'}
              />
              <div className="flex items-center gap-4">
                {customToolbarItems.position === 'before' &&
                  customToolbarItems.element}
                <ToolbarActions
                  access={access}
                  addFn={addFn}
                  hide={hide}
                  downloadableRows={downloadableRows}
                  pageName={pageName}
                  key={pageName + 'toolbar'}
                  headCells={headcells}
                  handleHeadCellsFromActions={handleHeadCellsFromTable}
                  handleFilter={handleFilterTable}
                  handleFileChange={handleFileChange}
                />
                {customToolbarItems.position === 'after' &&
                  customToolbarItems.element}
              </div>
            </CardContent>
          </Card>
        </div>
{(labels === 'Ticket Approval' || labels === 'Ticket Config') && (
  <div className="grid w-full grid-cols-1 gap-4 py-2 xl:grid-cols-2 items-stretch">
    
    {/* Left Column - Form Container */}
    <div className="flex flex-col h-full min-w-0">
      <div className="flex flex-col h-full w-full rounded-2xl border bg-white shadow-sm dark:bg-neutral-950 p-4">
        <CustomTicketform
          submitFunction={(data: any) => onSubmit(data)}
          fields={field ?? []}
          options={option || {}}
          label={labels}
          toBackend={toBackend}
        />
      </div>
    </div>

    {/* Right Column */}
    <div className="flex flex-col h-full min-w-0">
      
      {labels === 'Ticket Config' && (
        <div className="h-full w-full rounded-2xl border bg-white shadow-sm dark:bg-neutral-950 p-4 flex items-center justify-center">
          <AdvancedTicketChart chartData={dataChart} />
        </div>
      )}

      {labels === 'Ticket Approval' && (
        <div className="h-full w-full rounded-2xl border bg-white shadow-sm dark:bg-neutral-950 p-4 flex items-center justify-center">
          <TicketSummaryCards data={carddata} />
        </div>
      )}

    </div>
  </div>
)}
        <Card className="py-2">
          <CardContent className="flex flex-col justify-between py-2 w-full">
            <div
              className={
                sortedRows.length > 10
                  ? ''
                  : //  'max-h-[600px] w-full overflow-auto'
                    'overflow-visible'
              }
            >
              <Table key={pageName} className="w-full ">
                <TableHeader className="dark:bg-violet-100 dark:text-secondary-foreground">
                  <TableHeaderRow
                    headcells={handledHeadCells}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </TableHeader>
                <TableBody className="w-full h-full bg-white dark:bg-background">
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, idx) => (
                      <TableRowComponent
                        key={idx}
                        row={row}
                        headcells={handledHeadCells}
                        optionPopup={optionPopup}
                        onClick={onClick}
                        clickableColumn={clickableColumn}
                        colorCode={colorCode}
                        colorCodeLogic={colorCodeLogic}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={handledHeadCells.length}
                        className="h-[50dvh]"
                      >
                        <Card
                          style={{ height: '100%' }}
                          className="border-dashed"
                        >
                          <CardContent className="py-12 h-full flex flex-col items-center justify-center text-muted-foreground">
                            <FileQuestion
                              size={34}
                              className="h-8 w-8 mb-2 opacity-70"
                            />
                            <p>No records found</p>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="sticky bottom-0 bg-white dark:bg-background border-t border-gray-200 dark:border-border py-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handlePageSizeChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
