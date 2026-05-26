import { CirclePlus, Download, Eye, Filter, Upload } from 'lucide-react';
import { useRef } from 'react';
import { HeadCellsHandler } from './HeadcellsHandler';
import { HandleTableFilter } from './HandleTableFilter';
import type { HeadCell, Row, hide } from '@/types/table';
import { exportToExcel } from '@/lib/downloadExcel';
import CustomTooltip from '@/utils/common/components/CustomTooltip';

export const ToolbarActions = ({
  access,
  addFn,
  hide = { add: false, upload: true, filter: false, download: false },
  downloadableRows,
  pageName,
  headCells,
  handleHeadCellsFromActions,
  handleFilter,
  handleFileChange,
}: {
  access: any;
  addFn: () => void;
  hide?: hide;
  downloadableRows: Array<Row>;
  pageName: string;
  headCells: Array<HeadCell>;
  handleHeadCellsFromActions: (modifiedHeadcells: Array<HeadCell>) => void;
  handleFilter: (value: Array<Row> | []) => void;
  handleFileChange?: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleIconClick = () => {
    if (!access.hasCreateAccess) return;
    fileInputRef.current?.click();
  };
  return (
    <div className="flex items-center gap-4">
      {!hide.add && (
        <CustomTooltip
          content="Add"
          children={
            <CirclePlus
              // color={access.hasCreateAccess ? 'blue' : 'gray'}
  className={`h-4 w-4 ${
    access.hasCreateAccess
      ? 'text-violet-600 hover:text-violet-700 cursor-pointer'
      : 'text-gray-400 cursor-not-allowed'
  }`}
              onClick={() => access.hasCreateAccess && addFn()}
            />
          }
        />
      )}

      {hide.upload != undefined && (
        <CustomTooltip
          content="Upload"
          children={
            <Upload
               className={`h-4 w-4 ${
    access.hasCreateAccess
      ? 'text-violet-600 hover:text-violet-700 cursor-pointer'
      : 'text-gray-400 cursor-not-allowed'
  }`}
              onClick={handleIconClick}
            />
          }
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleFileChange}
      />

      {!hide.hidden && (
        <CustomTooltip
          content="Hide"
          children={
            <HeadCellsHandler
              headCells={headCells}
              handleHeadCellsFromActions={handleHeadCellsFromActions}
            >
              <Eye
             
                 className={`h-4 w-4 ${
    access.hasCreateAccess
      ? 'text-violet-600 hover:text-violet-700 cursor-pointer'
      : 'text-gray-400 cursor-not-allowed'
  }`}
              />
            </HeadCellsHandler>
          }
        />
      )}

      {!hide.filter && (
        <CustomTooltip
          content="Filter"
          children={
            <HandleTableFilter
              headCells={headCells}
              rows={downloadableRows}
              handleFilter={handleFilter}
            >
              <Filter
              className={`h-4 w-4 ${
    access.hasCreateAccess
      ? 'text-violet-600 hover:text-violet-700 cursor-pointer'
      : 'text-gray-400 cursor-not-allowed'
  }`}
              />
            </HandleTableFilter>
          }
        />
      )}
      {!hide.download && (
        <CustomTooltip
          content="Download"
          children={
            <Download
             className={`h-4 w-4 ${
    access.hasCreateAccess
      ? 'text-violet-600 hover:text-violet-700 cursor-pointer'
      : 'text-gray-400 cursor-not-allowed'
  }`}
              onClick={() => exportToExcel(downloadableRows, pageName)}
            />
          }
        />
      )}
    </div>
  );
};
