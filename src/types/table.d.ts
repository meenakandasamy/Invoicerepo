import type { BaseProps } from './common';

export type HeadCell = {
  id: string;
  label: string;
  view?: boolean;
  defaultView?: boolean;
  filterable?: boolean;
  filterType?:
    | 'text'
    | 'select'
    | 'range'
    | 'date'
    | 'dateRange'
    | 'boolean'
    | 'multiSelect';
  filterOptions?:
    | Array<{ label: string; value: string | number }>
    | Array<string | number>;
  sortable?: number;
  visualFormat?: (data: any) => string;
};

export type Row = {
  [key: string]: any;
};

type allFns = {
  addFn?: () => void;
  filterFn?: () => void;
  downloadFn?: () => void;
  optionHandler?: (option: any, row: any) => void;
  handleFileChange?: () => void;
};

type hide = {
  add?: boolean;
  upload?: boolean;
  filter?: boolean;
  hidden?: boolean;
  download?: boolean;
};
export type TableProps = {
  headcells: Array<HeadCell>;
  rows: Array<Row>;
  pageName: string;
  functions?: allFns;
  access: { hasCreateAccess: boolean; hasUpdateAccess: boolean };
  hide?: hide;
  enblepay?: boolean;
  editOptions?: Array<string>;
  onClick?: (row: Row, headcellId: string) => void;
  clickableColumn?: string | Array<string>;
  customToolbarItems?: {
    position?: 'before' | 'after';
    element: React.ReactNode;
  };
  colorCode?: boolean;
  includedDownloadColumns?: Array<string>;
  colorCodeLogic?: (
    row: Row,
    headcellId: string,
  ) => string | { backgroundColor?: string; color?: string } | undefined;
  tabsFns?: any;
    toBackend?: boolean;
    labels?:string
  allTabsValues?: any;
    field?: Array<Field>;
    onSubmit?:(value: any) => void
      submitFunction: (value: any) => void;  option?: Record<string, Array<string | number>>;
};
