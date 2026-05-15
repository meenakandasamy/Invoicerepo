import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import debounce from 'lodash.debounce';
import ExcelJS from 'exceljs';
import { CustomForm } from '../form/customForm';
import { CustomTable } from '../table/customTable';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import LogPopup from '../layout/LogPopup';
import { Button } from '../ui/button';
import { FormLinkGenerator } from '../form/FormLinkGenerator';
import { Card, CardContent, CardHeader } from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import ExcelPreviewModal from '../layout/helpers/ExcelUpload';
import { RentApprovalCard } from './RentApprovalCard';
import type { JSX } from 'react';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type { VendorRentSearch } from '@/utils/Validators/schema/SearchSchemas';
import type { vendorDropdownType } from '@/types/requestor';
import type {
  RentRecurrsionType,
  VendorRentApprovalDTOType,
  VendorRentDTOType,
  VendorRentRejectionDTOType,
  VendorRentUpdateDTOType,
} from '@/utils/Validators/schema/RentSchema';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useVendorDropdown } from '@/hooks/data/useVendor';
import { useApproverCategory } from '@/hooks/data/useApproverCategory';
import { useApproverStatus } from '@/hooks/data/useApproverStatus';
import { invalidateQuery } from '@/utils/common/queryUtils';
import { useApproverDetails } from '@/hooks/data/useApproverDetails';
import {
  APPROVER_CATEGORY,
  getDisableApprovalFlow,
  isPrimaryValidator,
} from '@/utils/common/permissions';
import { useVendorRents } from '@/hooks/data/useVendorRent';
import { RentQueries, RentServices } from '@/integrations/Services/rentService';
import { INTL_UTILS } from '@/utils/common/IntlUtils';
import { useVendorRentById } from '@/hooks/data/useVendorRentById';
import { formatDate } from '@/utils/common/DateUtil';
import { useVendorRentLogs } from '@/hooks/data/useVendorRentLogs';
import Loader from '@/utils/common/components/loader';

interface ExpensesProps extends BaseProps {
  search: VendorRentSearch;
}

export default function VendorRentPage(props: ExpensesProps): JSX.Element {
  const { hasCreateAccess, hasUpdateAccess, session, search } = props;

  const navigate = useNavigate({
    from: '/vendor_expenditure/advance',
  });

  // ! must call in all expense flow modules
  const { data: approverDetails } = useApproverDetails(session.userId);
  const ModuleName = APPROVER_CATEGORY.VENDOR_RENT;
  const isAccounts = isPrimaryValidator(ModuleName);

  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalFields, setApprovalModalFields] =
    useState<Array<Field>>();
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [toApprovalBackend, setToApprovalBackend] = useState<boolean>(false);
  const [toRejectionBackend, setToRejectionBackend] = useState<boolean>(false);
  const DATE_KEYS = ['dateOfOccupancy', 'paymentDueDate'];

  //   Log States:
  const [isLogOpen, setIsLogOpen] = useState(false);

  const [logTableValue, setLogTableValue] = useState<any>(null);
  const [logTabsValue, setLogTabsValue] = useState<any>('details');
  const [selectedRow, setSelectedRow] = useState<VendorRentDTOType | null>(
    null,
  );
  const [selectedvendorRentId, setSelectedvendorRentId] = useState<
    number | null
  >(null);
  const [selectedRentRecurrsion, setSelectedRentRecurrsion] =
    useState<RentRecurrsionType | null>(null);
console.log(logTableValue, 'logTableValue');
  enum METHOED {
    COST_IDS = 'COST_IDS',
    COST_IDS_ADMIN = 'COST_IDS_ADMIN',
    LEVEl_ID = 'LEVEL_ID',
    ALL = 'ALL',
  }

  enum ApproverStatus {
    Pending = 1,
    InProgress = 2,
    Approved = 3,
    Rejected = 4,
    Paid = 5,
    Overdue = 6,
    Hold = 7,
    PartiallyApproved = 8,
  }

  const VendorAdvanceQuery = useVendorRents(
    session,
    METHOED.ALL,
    // isAccounts ?
    //     METHOED.ALL :
    //     sessionStorage.getItem('poRoleName')?.toLocaleLowerCase().includes('admin') ?
    //         METHOED.COST_IDS_ADMIN
    //         : METHOED.COST_IDS
  );
  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const VendorQuery = useVendorDropdown();
  const ApproverCategoryQuery = useApproverCategory();
  const ApproverStatusQuery = useApproverStatus();
  const logsQuery = useVendorRentLogs(selectedvendorRentId, session);
  const isDependencyLoading =
    CostHeaderQuery.isLoading ||
    CostCenterQuery.isLoading ||
    ApproverCategoryQuery.isLoading ||
    ApproverStatusQuery.isLoading ||
    VendorQuery.isLoading;
  useApproverDetails(session.userId);

  const allVendorRent = useMemo(
    () =>
      (VendorAdvanceQuery.data ?? [])
        .map((v) => {
          const rec = v.vendorRentRecurrsion;
          const latestRec =
            Array.isArray(rec) && rec.length > 0 ? rec[rec.length - 1] : null;

          return {
            ...v,
            currentLevelId: latestRec?.levelId ?? '-',
            currentApproverStatusId: latestRec?.approverStatusId, // (optional)
          };
        })
        .sort(
          (a, b) =>
            new Date(b.lastUpdatedDate!).getTime() -
            new Date(a.lastUpdatedDate!).getTime(),
        ),
    [VendorAdvanceQuery.data],
  );

  const costHeadersDropdown = useMemo(
    () => CostHeaderQuery.data ?? [],
    [CostHeaderQuery.data],
  );
  const costCentersDropdown = useMemo(
    () => CostCenterQuery.data ?? [],
    [CostCenterQuery.data],
  );
  const vendorDropdown = useMemo(
    () => VendorQuery.data ?? [],
    [VendorQuery.data],
  );
  const categoryDropdown = useMemo(
    () => ApproverCategoryQuery.data ?? [],
    [ApproverCategoryQuery.data],
  );
  const statusDropdown = useMemo(
    () => ApproverStatusQuery.data ?? [],
    [ApproverStatusQuery.data],
  );
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

  const vendorRentByIdQuery = useVendorRentById(
    session,
    search.vendorRentId as number,
  );

  useEffect(() => {
    if (search.vendorRentId && vendorRentByIdQuery.data) {
      handleLogPopup(vendorRentByIdQuery.data);
    }
  }, [vendorRentByIdQuery.data, search.vendorRentId]);

  const vendorAdvanceFieldNames = [
    'vendorName',
    'selectedVendorName',
    'address',
    'propertyType',
    'securityDepositAmount',
    'rentAmount',
    'gstSlab',
    'gstAmount',
    'totalAmountWithGST',
    'dateOfOccupancy',
    'tenure',
    'paymentDueDate',
    'providedProducts',
    'itemsProvidedByIce',
    'occupants',
    'description',
  ];

  const rentRequestViewForm = [
    // --- 1 to 3: Identity & Creation ---
    'vendorRentCode',
    'createdByName',
    'createdDate',
    // --- 4 to 7: Vendor & Property Details ---
    'vendorName',
    'vendorCode',
    'contact',
    'propertyType',
    // 'address',
    'occupants',
    'description',

    // --- 8 to 9: Base Amounts ---
    'securityDepositAmount',
    'rentAmount',

    // --- 10 to 12: GST Details ---
    'gstSlab',
    'gstAmount',
    'totalAmountInGst',

    // --- 13 to 14: TDS Details ---
    // 'tdsPercentage',
    // 'tdsAmount',

    // --- 15: Final Total ---
    'totalAmount',
    'itemsProvidedByIce',
    'providedProducts',

    // --- 16 to 18: Occupancy Details ---
    'dateOfOccupancy',
    'paymentDueDate',
    'tenure',
    'ownerProductList',

    // --- 19 to 20: Allocations ---
    'costCentreName',
    'costHeaderName',

    // --- 21: Status ---
    'approverStatusName',

    // --- 22: Remarks ---
    'remarks',

    // --- 23 to 24: Updates ---
    'lastUpdatedByName',
    'lastUpdatedDate',

    // --- 25 to 26: Payment ---
    'dateOfPayment',
    'transferReference',

    // --- 27: Hostbook ---
    'hostbooks',
  ];

  const headCells: Array<HeadCell> = [
    // 1. Rent Request Code
    {
      id: 'vendorRentCode',
      label: 'Rent Request Code',
      defaultView: true,
      view: true,
      filterable: true,
    },

    // 2. Created By
    {
      id: 'createdByName',
      label: 'Created By',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // 3. Created Timestamp
    {
      id: 'createdDate',
      label: 'Created On',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // 4. Vendor (from vendorId)
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorDropdown.map((v) => v.vendorName),
    },
    {
      id: 'vendorName',
      label: 'Vendor Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorDropdown.map((v) => v.vendorName),
    },

    // 5. Contact (NOT IN OBJECT → remove or keep placeholder)
    // {
    //   id: 'contact',
    //   label: 'Contact',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    // },

    // 6. Property Type
    {
      id: 'propertyType',
      label: 'Property Type',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // 7. Address
    {
      id: 'address',
      label: 'Address',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // 8. Security Deposit
    {
      id: 'securityDepositAmount',
      label: 'Security Deposit',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },

    // 9. Rent Amount
    {
      id: 'rentAmount',
      label: 'Rent Amount',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },

    // 10. GST Slab
    {
      id: 'gstSlab',
      label: 'GST Slab',
      defaultView: true,
      view: true,
      filterable: true,
    },

    // 11. GST Amount
    {
      id: 'gstAmount',
      label: 'GST Amount',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },

    // 12. Total Amount With GST
    {
      id: 'totalAmountWithGST',
      label: 'Total Amount (incl. GST)',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },

    // 13. TDS %
    {
      id: 'tdsPercentage',
      label: 'TDS %',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
    },

    // 14. TDS Amount
    {
      id: 'tdsAmount',
      label: 'TDS Amount',
      defaultView: false,
      view: false,
      filterable: true,
      filterType: 'range',
    },

    // 15. Total Amount (final)
    {
      id: 'totalAmount',
      label: 'Total Amount (excl. GST)',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
     {
      id: 'itemsProvidedByIce',
      label: 'Items Provided by ICE',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
    },

    // 16. Date of Payment (matches paymentDueDate)
    {
      id: 'paymentDueDate',
      label: 'Payment Due Date',
      defaultView: true,
      view: true,
      filterable: true,
      visualFormat: (data: 'dd') => {
        return format(data, 'dd-MM-yyyy');
      },
    },

    // 17. Tenure
    {
      id: 'tenure',
      label: 'Tenure',
      defaultView: false,
      view: false,
      filterable: false,
    },

    {
      id: 'dateOfOccupancy',
      label: 'Date of Occupancy',
      defaultView: true,
      view: true,
      filterable: true,
      visualFormat: (data) => {
        return format(data, 'dd-MM-yyyy');
      },
    },

    // 18. Provided Products
    {
      id: 'providedProducts',
      label: 'Owner Products List',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // 19. Cost Centre (IDs array)
    {
      id: 'costCentreNames',
      label: 'Cost Centre',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: costCentersDropdown.map((c) => c.costCentreName),
    },

    // 20. Cost Header (IDs array)
    {
      id: 'costHeaderNames',
      label: 'Cost Header',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'select',
      filterOptions: costHeadersDropdown.map((c) => c.costHeaderName),
    },
    {
      id: 'currentLevelId',
      label: 'Current Level',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // {
    //   id: 'nextApproverName',
    //   label: 'Next Approver',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    // },
    // 21. Approval Status
    {
      id: 'approverStatusName',
      label: 'Approval Status',
      defaultView: true,
      view: true,
      filterable: true,
    },

    // 22. Deposit Status
    {
      id: 'approverDepositStatusName',
      label: 'Deposit Status',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // 23. Rent Status
    {
      id: 'approverRentStatusName',
      label: 'Rent Status',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // {
    //   id: 'itemsProvidedByIce',
    //   label: 'Items Provided by ICE',
    //   defaultView: false,
    //   view: false,
    //   filterable: false,

    // },

    // 24. Remarks — NOT IN OBJECT
    // {
    //   id: 'remarks',
    //   label: 'Remarks',
    //   defaultView: false,
    //   view: true,
    //   filterable: true,
    // },

    // 25. Updated By
    {
      id: 'lastUpdatedByName',
      label: 'Updated By',
      defaultView: false,
      view: false,
      filterable: false,
    },

    // 26. Updated Timestamp
    {
      id: 'lastUpdatedDate',
      label: 'Last Updated On',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'occupants',
      label: 'Occupants',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'description',
      label: 'Description',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'remarks',
      label: 'Remarks',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
    },
    // 27. Transfer Reference — NOT IN OBJECT
    // {
    //   id: 'transferReference',
    //   label: 'IMPS / NEFT Ref #',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    // },

    // 28. Workflow Level — NOT IN OBJECT
  ];
const includedDownloadColumns = headCells.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id);  

  const logHeadcells = useMemo(() => {
    if (logTabsValue === 'logs') {
      return [
        { id: 'action', label: 'Action' },
        { id: 'changes', label: 'Changes' },
        { id: 'occuredOn', label: 'Occurred On' },
        { id: 'updatedByName', label: 'Updated By' },
      ];
    }

    if (!logTableValue) return [];
    return Object.keys(logTableValue)
      .filter(
        (key) =>
          logTableValue[key] !== null &&
          logTableValue[key] !== undefined &&
          logTableValue[key] !== '',
      )
      .map((key) => ({
        id: key,
        label: headCells.find((hc) => hc.id === key)?.label || key,
      }))
      .filter((item) => rentRequestViewForm.includes(item.id))
      .sort(
        (a, b) =>
          rentRequestViewForm.indexOf(a.id) - rentRequestViewForm.indexOf(b.id),
      );
  }, [logTableValue, logTabsValue, rentRequestViewForm]);
  console.log(logHeadcells, 'logHeadcells');

  const formatLogs = (logsArr: Array<any>) => {
    return logsArr.map((log) => {
      const formattedAction = log.action
        ? log.action.charAt(0).toUpperCase() + log.action.slice(1).toLowerCase()
        : '-';

      const dateObj = new Date(log.occuredOn);
      const formattedDate =
        `${String(dateObj.getDate()).padStart(2, '0')}-` +
        `${String(dateObj.getMonth() + 1).padStart(2, '0')}-` +
        `${dateObj.getFullYear()} ` +
        `${String(dateObj.getHours()).padStart(2, '0')}:` +
        `${String(dateObj.getMinutes()).padStart(2, '0')}`;

      const formattedChanges = log.changes
        ? (log.changes as string)
            // split by period followed by space, ignoring periods inside numbers
            .split(/\. (?=[A-Z0-9])/)
            .map((c) => c.trim())
            .filter((c) => c.length > 0)
            .map((c, i) => {
              // ensure each line ends with a period
              const line = c.endsWith('.') ? c : c + '.';
              return `${i + 1}. ${line}`;
            })
            .join('\n')
        : '-';

      return {
        ...log,
        action: formattedAction,
        occuredOn: formattedDate,
        changes: formattedChanges,
      };
    });
  };

  const sortByOccurredOnAsc = (data: any) => {
    const parseDate = (str: string) => {
      const [datePart, timePart] = str.split(' ');
      const [day, month, year] = datePart.split('-');
      return new Date(`${year}-${month}-${day} ${timePart}`).getTime();
    };

    return [...data].sort(
      (a, b) => parseDate(b.occuredOn) - parseDate(a.occuredOn),
    );
  };

  function handleLogsTabChange(value: string) {
    setLogTabsValue(value);
    if (value === 'recurrence') {
      setLogTableValue(selectedRow);
      console.log(selectedRow, 'rowsss');
    } else if (value === 'logs') {
      const sorted = sortByOccurredOnAsc(logs);
      // const formattedLogs = formatLogs(logs);
      setLogTableValue(sorted);
    } else if (value === 'details') {
      setLogTableValue(selectedRow);
    }
  }

  const [tableValue, setTableValue] = useState<Array<Row>>(allVendorRent);
  const [tabsValue, setTabsValue] = useState<string>('all');
  const [statusTabsValue, setStatusTabsValue] =
    useState<string>('approvalStatus');

  useEffect(() => {
    switch (statusTabsValue) {
      case 'approveStatus':
        setTableValue(allVendorRent);
        break;
      case 'depositStatus':
        setTableValue(allVendorRent);
        break;
      case 'rentStatus':
        setTableValue(allVendorRent);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTabsValue, allVendorRent]);

  const getStatusKey = (
    statusTabs: string,
  ):
    | 'approverStatusId'
    | 'approverDepositStatusId'
    | 'approverRentStatusId' => {
    switch (statusTabs) {
      case 'depositStatus':
        return 'approverDepositStatusId';
      case 'rentStatus':
        return 'approverRentStatusId';
      case 'approvalStatus':
      default:
        return 'approverStatusId';
    }
  };

  useEffect(() => {
    const statusKey = getStatusKey(statusTabsValue);

    let filteredData = allVendorRent;

    switch (tabsValue) {
      case 'pending':
        filteredData = allVendorRent.filter(
          (item) =>
            item[statusKey] === ApproverStatus.Pending ||
            item[statusKey] === ApproverStatus.InProgress ||
            item[statusKey] === ApproverStatus.Hold,
        );
        break;

      case 'approved':
        filteredData = allVendorRent.filter(
          (item) => item[statusKey] === ApproverStatus.Approved && !item.isPaid,
        );
        break;

      case 'partiallyApproved':
        filteredData = allVendorRent.filter(
          (item) => item[statusKey] === ApproverStatus.PartiallyApproved,
        );
        break;

      case 'rejected':
        filteredData = allVendorRent.filter(
          (item) => item[statusKey] === ApproverStatus.Rejected,
        );
        break;
      case 'paid':
        setTableValue(() => {
          return allVendorRent.filter((vendorAdvance) => vendorAdvance.isPaid);
        });
        break;
      case 'hostBooks':
        filteredData = allVendorRent.filter(
          (item) => item.hostBooks === true || item.hostBooks === 'Yes',
        );
        break;

      case 'all':
      default:
        filteredData = allVendorRent;
    }

    setTableValue(filteredData);
  }, [tabsValue, statusTabsValue, allVendorRent]);

  const tabsCount = useMemo(() => {
    const statusKey = getStatusKey(statusTabsValue);

    const all = allVendorRent.length;

    const pending = allVendorRent.filter(
      (item) =>
        item[statusKey] === ApproverStatus.Pending ||
        item[statusKey] === ApproverStatus.InProgress ||
        item[statusKey] === ApproverStatus.Hold,
    ).length;

    const approved = allVendorRent.filter(
      (item) => item[statusKey] === ApproverStatus.Approved && !item.isPaid,
    ).length;

    const partiallyApproved = allVendorRent.filter(
      (item) => item[statusKey] === ApproverStatus.PartiallyApproved,
    ).length;

    const rejected = allVendorRent.filter(
      (item) => item[statusKey] === ApproverStatus.Rejected,
    ).length;

    const paid = allVendorRent.filter((item) => item.isPaid).length;
    const hostBooks = allVendorRent.filter(
      (item) => item.hostBooks === true || item.hostBooks === 'Yes',
    ).length;

    return {
      all,
      pending,
      partiallyApproved,
      approved,
      rejected,
      paid,
      hostBooks,
    };
  }, [allVendorRent, statusTabsValue, tabsValue]);

  // const logHeadcells = useMemo(() => {
  //   if (!logTableValue) return [];
  //   if (logTabsValue === 'logs') {
  //     return [
  //       { id: 'action', label: 'Action' },
  //       { id: 'changes', label: 'Changes' },
  //       { id: 'occuredOn', label: 'Occured On' },
  //       { id: 'updatedByName', label: 'Updated By' },
  //     ];
  //   }

  //   return Object.keys(logTableValue)
  //     .map((key) => ({
  //       id: key,
  //       label: headCells.find((hc) => hc.id === key)?.label || key,
  //     }))
  //     .filter((item) => headCells.map((hc) => hc.id).includes(item.id))
  //     .sort(
  //       (a, b) =>
  //         rentRequestViewForm.indexOf(a.id) - rentRequestViewForm.indexOf(b.id),
  //     );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [logTableValue, logTabsValue]);

  // Form variables, states, functions and declarations
  const defaultValues: VendorRentDTOType = {
    // ---------- Dates ----------
    createdDate: new Date().toISOString().slice(0, 10),
    lastUpdatedDate: new Date().toISOString().slice(0, 10),

    // ---------- Identifiers ----------
    vendorRentCode: '',
    vendorRentId: 0,

    // ---------- Audit ----------
    createdBy: 0,
    createdByName: null,

    lastUpdatedBy: 0,
    updatedByName: null,

    // ---------- Vendor ----------
    vendorId: 0,
    vendorName: '',
    vendorEmail: null,
    vendorCode: null,
    vendorPocName: null,

    // ---------- Property / Rent ----------
    propertyType: '',
    propertyTypeName: '',
    address: '',

    tenure: 0,

    // ---------- Amount / GST / TDS ----------
    securityDepositAmount: 0,
    rentAmount: 0,

    gstSlab: 0,
    gstAmount: 0,
    totalAmountWithGST: 0,

    tdsPercentage: 0,
    tdsAmount: 0,

    totalAmount: 0,

    // ---------- Costing ----------
    costHeaderIds: null,
    costHeaderNames: null,

    costCentreIds: null,
    costCentreNames: null,

    providedProducts: null,

    // ---------- Approval Status ----------
    approverStatusId: 0,
    approverStatusName: null,

    approverRentStatusId: 0,
    approverRentStatusName: null,

    approverDepositStatusId: 0,
    approverDepositStatusName: null,

    // ---------- Payment ----------
    paymentDueDate: '',
    // ---------- Flags ----------
    rentFlagCount: null,

    // ---------- Additional Visual Levels ----------
    levelId: null,
    visualLevelId: null,
    dateOfOccupancy: '',
    isPaid: false,
  };

  const [formFields, setFormFields] =
    useState<VendorRentDTOType>(defaultValues);

  // console.log(
  //   formFields.costHeaderNames,
  //   formFields.costCentreNames,
  //   'testFielsdsTest',
  // );

  const computeTotals = (form: any) => {
    const totalNoGst = Number(form.getFieldValue('rentAmount') || 0);
    const gst = Number(form.getFieldValue('gstSlab') || 0);
    const tds = Number(form.getFieldValue('tdsPercentage') || 0);

    // Calculate GST & TDS
    const gstAmount = (totalNoGst * gst) / 100;
    const tdsAmount = (totalNoGst * tds) / 100;

    // Calculate final total (No GST + GST - TDS)
    const totalAmountWithGST = totalNoGst + gstAmount;
    const totalAmount = totalAmountWithGST - tdsAmount;

    // Set form values
    form.setFieldValue('gstAmount', gstAmount.toFixed(2));
    form.setFieldValue('totalAmountWithGST', totalAmountWithGST.toFixed(2));
    form.setFieldValue('tdsAmount', tdsAmount.toFixed(2));
    form.setFieldValue('totalAmount', totalAmount.toFixed(2));
    form.setFieldValue('totalNoGst', totalNoGst.toFixed(2));
    console.log(totalAmount, 'totalAmounts');
  };

  const [isValidVendor, setIsValidVendor] = useState(false);
  const [vendorHasGST, setVendorHasGST] = useState(false);

  const validateVendorEmail = debounce(
    (
      value: string,
      form: any,
      vd: Array<vendorDropdownType>,
      setState: (v: boolean) => void,
    ) => {
      // Check vendor exists
      const vendorExists = vd.find(
        (v) =>
          v.emailId === value ||
          v.vendorName === value ||
          v.vendorCode === value,
      );
      const isPropertyOwner =
        vendorExists?.vendorType.includes('Property Owner');
      const isPropertyOwnerApproved =
        vendorExists?.approverStatusId === ApproverStatus.Approved;
      if (!vendorExists) {
        toast.error('Vendor does not exist or not verified yet.');
        setIsValidVendor(false);
        return;
      }
      if (!isPropertyOwner) {
        toast.error('Vendor Type is not a property owner.');
        setIsValidVendor(false);
        return;
      }
      if (!isPropertyOwnerApproved) {
        toast.error('Property owner is not approved yet.');
        setIsValidVendor(false);
        return;
      }
      setState(!!vendorExists);
      if (vendorExists.approverStatusId !== ApproverStatus.Approved) {
        toast.error('Vendor is not approved yet.');
        setIsValidVendor(false);

        return;
      } else {
        setVendorHasGST(
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          vendorExists.gstNo !== null && vendorExists.gstNo !== '',
        );
      }

      const updatedValues = {
        ...form.store.state.values,
        selectedVendorName: vendorExists?.vendorName || null,
      };

      form.setFieldValue(
        'selectedVendorName',
        vendorExists?.vendorName || null,
      );
      setFormFields(updatedValues);
    },
    1000, // 1s delay
  );

  const vendorRentFields: Array<Field> = [
    // 1. Vendor ID
    {
      name: 'vendorName',
      label: 'Owner Email / Code',
      type: 'text',
      placeholder: 'Enter Owner Email / Code',
      required: true,
      disabled: toBackend || edit,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('vendorId', value);
        validateVendorEmail(value, form, vendorDropdown, setIsValidVendor);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'selectedVendorName',
      label: 'Owner Name',
      type: 'text',
      placeholder: 'Owner Name',
      disabled: true,
      // onChange: (_name: string, value: any, form: any) => {
      //   form.setFieldValue('vendorId', value);
      //   validateVendorEmail(value, form, vendorDropdown, setIsValidVendor);
      // },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 2. Property Type
    {
      name: 'propertyType',
      label: 'Property Type',
      type: 'select',
      placeholder: 'Enter property type (e.g., Office Space)',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('propertyType', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 3. Address
    {
      name: 'address',
      label: 'Property Address',
      type: 'text',
      placeholder: 'Enter property address',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('address', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 4. Security Deposit Amount
    {
      name: 'securityDepositAmount',
      label: 'Security Deposit Amount',
      type: 'text',
      placeholder: 'Enter Security Deposit Amount',
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('securityDepositAmount', Number(value));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 5. Rent Amount
    {
      name: 'rentAmount',
      label: 'Rent Amount',
      type: 'text',
      placeholder: 'Enter Monthly Rent Amount',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('rentAmount', Number(value));
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 6. GST Slab
    {
      name: 'gstSlab',
      label: 'GST Slab (%)',
      type: 'select',
      placeholder: 'Enter GST %',
      required: vendorHasGST,
      disabled: !isValidVendor || !vendorHasGST || toBackend || edit,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('gstSlab', Number(value));
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 7. GST Amount
    {
      name: 'gstAmount',
      label: 'GST Amount',
      type: 'number',
      placeholder: 'Enter GST Amount',
      required: vendorHasGST,
      disabled: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('gstAmount', Number(value));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 8. Total Amount With GST
    {
      name: 'totalAmountWithGST',
      label: 'Total Amount (incl. GST)',
      type: 'number',
      placeholder: 'Enter Total Amount (incl. GST)',
      required: true,
      disabled: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('totalAmountWithGST', Number(value));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 11. Total Amount
    {
      name: 'totalAmount',
      label: 'Total Amount (excl. GST)',
      type: 'number',
      placeholder: 'Enter Total Amount',
      required: true,
      disabled: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('totalAmount', Number(value));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // 9. TDS Percentage
    {
      name: 'tdsPercentage',
      label: 'TDS Percentage',
      type: 'select',
      placeholder: 'Enter TDS Percentage',
      // required: true,
      disabled:
        !isValidVendor ||
        toBackend ||
        !isAccounts ||
        selectedRow?.approverStatusId !== ApproverStatus.Pending,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('tdsPercentage', Number(value));
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 10. TDS Amount
    {
      name: 'tdsAmount',
      label: 'TDS Amount',
      type: 'number',
      placeholder: 'Enter TDS Amount',
      // required: true,
      disabled: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('tdsAmount', Number(value));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 12. Tenure
    {
      name: 'tenure',
      label: 'Tenure (months)',
      type: 'number',
      placeholder: 'Enter Tenure (Months)',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('tenure', Number(value));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 13. Payment Due Date
    {
      name: 'paymentDueDate',
      label: 'Payment Due Date',
      type: 'date',
      placeholder: 'Select Due Date',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('paymentDueDate', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 14. Date of Occupancy
    {
      name: 'dateOfOccupancy',
      label: 'Date of Occupancy',
      type: 'date',
      placeholder: 'Select Date of Occupancy',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('dateOfOccupancy', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // 15. Provided Products
    {
      name: 'providedProducts',
      label: 'Provided Products By Owner',
      type: 'text',
      placeholder: 'Enter Provided Products By Owner',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('providedProducts', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'itemsProvidedByIce',
      label: 'Provided Products By ICE',
      type: 'text',
      placeholder: 'Enter Provided Products By ICE',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('itemsProvidedByIce', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'occupants',
      label: 'Occupants',
      type: 'text',
      placeholder: 'Occupant Name (Occupant Employee ID)',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('occupants', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Enter Description',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('description', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'costCentreNames',
      label: 'Cost Centres',
      type: 'select',
      placeholder: 'Select Cost Centres',
      required: true,
      disabled:
        !isValidVendor ||
        !isAccounts ||
        toBackend ||
        selectedRow?.approverStatusId !== ApproverStatus.Pending,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('costCentreNames', value);
        form.setFieldValue(
          'costCentreIds',
          costCentersDropdown
            .filter((costCenter: any) =>
              value.includes(costCenter.costCentreName),
            )
            .map((costCenter: any) => costCenter.costCentreId),
        );
        setFormFields({ ...form.store.state.values, costCentreNames: value });
      },
      value: formFields.costCentreNames || [],
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'costHeaderNames',
      label: 'Cost Header',
      type: 'select',
      placeholder: 'Select Cost Headers',
      required: true,
      disabled:
        !isValidVendor ||
        !isAccounts ||
        toBackend ||
        selectedRow?.approverStatusId !== ApproverStatus.Pending,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('costHeaderNames', value);
        form.setFieldValue(
          'costHeaderIds',
          costHeadersDropdown
            .filter((costHeader: any) =>
              value.includes(costHeader.costHeaderName),
            )
            .map((costHeader: any) => costHeader.costHeaderId),
        );
        setFormFields({ ...form.store.state.values, costHeaderNames: value });
      },
      value: formFields.costHeaderNames || [],
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'hostBooks',
      label: 'Host Book',
      type: 'select',
      placeholder: 'Yes or No',
      disabled: !isValidVendor || toBackend || !isAccounts,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  const options = {
    costHeaderNames: costHeadersDropdown
      .filter((item: any) =>
        isAccounts
          ? true
          : approverDetails?.costHeaderIds?.includes(item.costHeaderId),
      )
      .map((item: any) => item.costHeaderName),

    costCentreNames: costCentersDropdown
      .filter((item: any) =>
        isAccounts
          ? true
          : approverDetails?.costCentreIds?.includes(item.costCentreId),
      )
      .map((item: any) => item.costCentreName),

    costHeaderName: costHeadersDropdown
      .filter((item: any) =>
        approverDetails?.costHeaderIds?.includes(item.costHeaderId),
      )
      .map((item: any) => item.costHeaderName),

    costCentreName: costCentersDropdown
      .filter((item: any) =>
        approverDetails?.costCentreIds?.includes(item.costCentreId),
      )
      .map((item: any) => item.costCentreName),
    // siteNames: siteDropdown.map((item: any) => item.siteName),
    vendorName: vendorDropdown.map((item: any) => item.vendorName),
    categoryName: categoryDropdown.map((item: any) => item.categoryName),
    gstSlab: [0, 1.25, 2.5, 5, 6, 12, 18, 40],
    hostBooks: ['No', 'Yes'],
    tdsPercentage: [0, 0.1, 1, 2, 5, 10, 12.5, 20, 30, 35, 40],

    propertyType: [
      'Office Space',
      // 'Guest House',
      '1BHK',
      '2BHK',
      '3BHK',
      '4BHK',
      '5BHK',
      '1RK',
      '2RK',
      'Other',
    ],
  };
  console.log(allVendorRent, 'allVendorRent');

  const handleOpen = () => {
    setFormFields(defaultValues);
    setEdit(false);
    setIsOpen(true);
  };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // const data = await readExcelFile(file);
  //   // setExcelData(data);
  //   // setIsExcelOpen(true); // open preview modal
  // };

  const readExcelFile = async (file: File) => {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0]; // first sheet

    const headers: Array<string> = [];
    const rowsData: Array<any> = [];

    worksheet.eachRow((row, rowNumber) => {
      const rowValues = row.values as Array<any>;

      // Header row (1st row)
      if (rowNumber === 1) {
        rowValues.forEach((cell, index) => {
          if (index !== 0) headers[index] = String(cell).trim();
        });
      } else {
        const rowObject: any = {};
        rowValues.forEach((cell, index) => {
          if (index !== 0 && headers[index]) {
            rowObject[headers[index]] = cell ?? '';
          }
        });

        rowsData.push(rowObject);
      }
    });

    return rowsData; // ✅ array of objects
  };

  const EXCEL_FIELD_MAP: Record<string, string> = {
    'Owner Email / Code': 'vendorName',
    'Property Address': 'address',
    'Property Type': 'propertyType',
    'Security Deposit Amount': 'securityDepositAmount',
    'Rent Amount': 'rentAmount',
    'GST Slab': 'gstSlab',
    'GST Amount': 'gstAmount',
    'Total Amount with GST': 'totalAmountWithGST',
    'Date of Occupancy': 'dateOfOccupancy',
    'Tenure (months)': 'tenure',
    'Payment Due Date': 'paymentDueDate',
    'Provided Products By Owner': 'providedProducts',
    'Provided Products By ICE': 'itemsProvidedByIce',
    Occupants: 'occupants',
    Description: 'description',
  };

  function excelValidationCheck(data: any) {
    const errors: any = {};
    data.forEach((item: any) => {
      for (const [key, value] of Object.entries(item)) {
        if (key in EXCEL_FIELD_MAP) {
          if (!value) {
            errors[key] = 'This field is required';
          }
        }
      }
    });
    console.log(errors, 'responseTest');
    return errors;
  }
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const response = await readExcelFile(file);
    e.target.value = '';
    excelValidationCheck(response);
    setExcelData(response);
    // console.log(response, 'payloadTest');

    setIsExcelOpen(true);
  };

  const formatDateTime = (value: any) => {
    if (!(value instanceof Date)) return value ?? '';

    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    const hh = String(value.getHours()).padStart(2, '0');
    const mi = String(value.getMinutes()).padStart(2, '0');
    const ss = String(value.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  const normalizeValue = (value: any) => {
    if (value instanceof Date) {
      return formatDateTime(value);
    }
    return value ?? '';
  };
  function handleCloseExcel() {
    setIsExcelOpen(false);
    setExcelData([]);
  }
  const handleUploadExcel = async () => {
    const payload = excelData.map((item: any) => {
      const mappedItem: any = {};

      Object.entries(EXCEL_FIELD_MAP).forEach(([excelKey, apiKey]) => {
        mappedItem[apiKey] = normalizeValue(item[excelKey]);
      });

      return {
        ...mappedItem,
        createdBy: session.userId,
        lastUpdatedBy: session.userId,
        vendorId: vendorDropdown.find(
          (vendor: any) => vendor.vendorCode === mappedItem.vendorName,
        )?.vendorId,
        totalAmount: Number(mappedItem.rentAmount),
        dateOfOccupancy: formatDate(mappedItem.dateOfOccupancy, 'yyyy-mm-dd'),
        paymentDueDate: formatDateTime(new Date(mappedItem.paymentDueDate)),
        // totalAmount: Number(mappedItem.gst),
      };
    });
    console.log(payload, 'payloadTest');

    // const uploadSequentially = async () => {
    //   try {
    //     for (const item of payload) {
    //       await createVendorRentMutation.mutateAsync(item);
    //     }
    //     console.log('All uploads completed');
    //   } catch (error) {
    //     console.error('Upload failed:', error);
    //   }
    // };

    // await uploadSequentially();
    // handleCloseExcel();
  };

  const handleClose = () => {
    setIsValidVendor(false);
    setVendorHasGST(false);
    setIsOpen(false);
    setEdit(false);
    setFormFields(defaultValues);
  };

  const handleCloseAll = () => {
    handleClose();
    handleCloseLog();
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      setFormFields(row);
      setIsOpen(true);
      setEdit(true);

      const vendorExists = vendorDropdown.find(
        (item: any) => item.vendorName === row.vendorName,
      );
      if (vendorExists) {
        setIsValidVendor(true);
        setVendorHasGST(vendorExists.gstNo ? true : false);
      } else {
        setIsValidVendor(false);
        setVendorHasGST(false);
        return toast.error('Vendor does not exist');
      }
      const editOpenPayload = {
        ...row,
        vendorName: row.vendorCode
          ? row.vendorCode
          : row.vendorEmailId
            ? row.vendorEmailId
            : '',
        selectedVendorName: row.vendorName ? row.vendorName : '',
        advancePaid: row.advancePaid ? row.advancePaid : 0,
      };
      setFormFields(editOpenPayload);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
    handleFileChange: handleFileChange,
  };

  const formStyles = {
    pageName: 'Vendor Advance',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const createVendorRentMutation = useMutation({
    mutationKey: [RentQueries.CREATE_RENT],
    mutationFn: async (data: VendorRentDTOType) => {
      setToBackend(true);
      return await RentServices.createRent(data);
    },
    onSuccess: () => {
      toast.success('Vendor Rent added successfully!');
      invalidateQuery(RentQueries.GET_RENT);
      setFormFields(defaultValues);
      setIsOpen(false);
      setToBackend(false);
      // window.location.reload();
    },
    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to add Vendor Rent: ${error.message || error}`);
    },
  });

  const updateVendorRentMutation = useMutation({
    mutationKey: [RentQueries.UPDATE_RENT],
    mutationFn: async (data: VendorRentDTOType) => {
      setToBackend(true);
      const response = await RentServices.updateRent(
        data.vendorRentId as number,
        data,
      );
      return response;
    },
    onSuccess: () => {
      invalidateQuery(RentQueries.GET_RENT);
      toast.success('Vendor Rent updated successfully!');
      if (search.vendorRentId || search.rentRecurrsionId) {
        window.location.reload();
      }
      // setFormFields(defaultValues);
      setToBackend(false);
    },
    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to update Vendor Rent: ${error.message || error}`);
    },
  });

  const vendorRentApproveMutation = useMutation({
    mutationKey: [RentQueries.APPROVE_RENT],
    mutationFn: async (data: any) => {
      setToBackend(true);
      setToApprovalBackend(true);
      return await RentServices.approveRent(data);
    },
    onSuccess: () => {
      invalidateQuery(RentQueries.GET_RENT);
      handleCloseAll();
      setToBackend(false);
      setToApprovalBackend(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        `Failed to approve vendor rent ${error.response.data || error.message}`,
      );
      setToBackend(false);
      setToApprovalBackend(false);
    },
  });

  const vendorRentRejectMutation = useMutation({
    mutationKey: [RentQueries.REJECT_RENT],
    mutationFn: async (data: any) => {
      setToBackend(true);
      setToRejectionBackend(true);
      return await RentServices.rejectRent(data);
    },
    onSuccess: () => {
      invalidateQuery(RentQueries.GET_RENT);
      handleCloseAll();
      setToBackend(false);
      setToRejectionBackend(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        `Failed to reject vendor rent ${error.response.data || error.message}`,
      );
      setToBackend(false);
      setToRejectionBackend(false);
    },
  });

  function onSubmit(data: VendorRentDTOType) {
    const vendor = vendorDropdown.find(
      (v) =>
        v.emailId === data.vendorName ||
        v.vendorName === data.vendorName ||
        v.vendorCode === data.vendorName,
    );
    const category: any = categoryDropdown.find(
      (c) => c.categoryName === 'Vendor Rent',
    );
    if (!vendor) {
      toast.error('Vendor not found or unverified');
      return;
    }
    if (!category) {
      toast.error('Category not found');
    }
    const payload: VendorRentDTOType = {
      ...data,
      vendorId: vendor.vendorId,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      securityDepositAmount: data.securityDepositAmount || 0,
      dateOfOccupancy: formatDate(data.dateOfOccupancy, 'yyyy-mm-dd'),
      paymentDueDate: formatDateTime(new Date(data.paymentDueDate)),
      approverRentStatusId: 1,
      totalAmount: Number(data.totalNoGst),
      organizationId: sessionStorage.getItem('organizationId'),
    };

    const filteredPayload = deepClean(payload);

    console.log(filteredPayload, 'filteredPayload');

    createVendorRentMutation.mutateAsync(filteredPayload);
  }

  function deepClean(obj: any): any {
    if (Array.isArray(obj)) {
      const cleanedArray = obj
        .map((item) => deepClean(item))
        .filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            item !== '' &&
            item !== 0 &&
            !(Array.isArray(item) && item.length === 0) &&
            !(typeof item === 'object' && Object.keys(item).length === 0),
        );
      return cleanedArray;
    }

    if (typeof obj === 'object' && obj !== null) {
      const cleanedObj = Object.fromEntries(
        Object.entries(obj)
          .map(([key, value]) => {
            // if (DATE_KEYS.includes(key)) {
            //   return [key, value ?? ''];
            // }
            return [key, deepClean(value)];
          })
          .filter(([key, value]) => {
            return (
              value !== null &&
              value !== undefined &&
              value !== '' &&
              value !== 0 &&
              !(Array.isArray(value) && value.length === 0) &&
              !(typeof value === 'object' && Object.keys(value).length === 0)
            );
          }),
      );

      return cleanedObj;
    }

    return obj;
  }

  function onUpdate(data: VendorRentUpdateDTOType) {
    setIsOpen(false);
    const vendor = vendorDropdown.find(
      (v) =>
        v.emailId === data.vendorName ||
        v.vendorName === data.vendorName ||
        v.vendorCode === data.vendorName ||
        v.vendorId === data.vendorId,
    );

    if (!vendor) {
      toast.error('Vendor not found or unverified');
      return;
    }
    const payload: VendorRentUpdateDTOType = {
      // spread the data
      ...data,

      // update the vendorId based on the vendorName
      vendorId: vendor.vendorId,

      // set createdBy and lastUpdatedBy
      lastUpdatedBy: session.userId,
      hostBooks: data.hostBooks === 'Yes' ? true : false,
      dateOfOccupancy: formatDate(data.dateOfOccupancy, 'yyyy-mm-dd'),
      paymentDueDate: formatDateTime(new Date(data.paymentDueDate)),
      organizationId:
        data.organizationId || sessionStorage.getItem('organizationId'),
    };

    // console.log(payload, 'dataTestLogBefore');
    const filteredPayload = deepClean(payload);
    console.log(filteredPayload, data, 'dataTestLog');

    console.log(filteredPayload, 'filteredPayload');

    updateVendorRentMutation.mutate(filteredPayload);
  }

  function handleApprovalModalClose() {
    setIsApprovalModalOpen(false);
    setApprovalModalFields([]);
  }

  const handleApproval = (data: VendorRentApprovalDTOType) => {
    if (!selectedRentRecurrsion) return;
    if (
      Number(data.amountApproved) !== Number(selectedRentRecurrsion.amountToPay)
    )
      return toast.error('Amount approved must be equal to the amount to pay');
    const payload: VendorRentApprovalDTOType = {
      rentRecurrsionId: selectedRentRecurrsion.rentRecurrsionId,
      approvedBy: session.userId,
      amountApproved: data.amountApproved,
      isAccounts: session.roleName.toLowerCase() === 'accounts',
      remarks: data.remarks,
    };
    // console.log(payload);

    vendorRentApproveMutation.mutate(payload);
    handleApprovalModalClose();
  };

  const handleReject = (data: VendorRentRejectionDTOType) => {
    if (!selectedRentRecurrsion) return;

    const payload: VendorRentRejectionDTOType = {
      rentRecurrsionId: selectedRentRecurrsion.rentRecurrsionId,
      rejectedBy: session.userId,
      levelId: +sessionStorage.getItem('levelId')!,
      remarks: data.remarks,
    };
    vendorRentRejectMutation.mutate(payload);
    handleApprovalModalClose();
  };

  const handleApprovalModal = (
    approveStatus: boolean,
    data: RentRecurrsionType,
  ) => {
    // console.log(formFields, 'testFielsdsTest');

    if (
      formFields.costCentreNames &&
      formFields.costCentreNames.length === 0 &&
      formFields.costHeaderNames &&
      formFields.costHeaderNames.length === 0
    ) {
      toast.error('Please add at least one cost centre or cost header');
      return;
    }
    setSelectedRentRecurrsion(data);

    // const advancePop: VendorRentDTOType = useFormPageStore.getState().getPage("advance_pop");
    // if (sessionStorage.getItem('levelId') === '0' && approveStatus) {
    //   const payload: VendorAdvanceApprovalType = {
    //     vendorRentId: advancePop.vendorRentId,
    //     approvedBy: session.userId,
    //     amountApproved: advancePop.amountApproved,
    //     isAccounts: session.roleName.toLowerCase() === 'accounts',
    //     remarks: "Accounts Verified",
    //   };
    //   await vendorRentApproveMutation.mutate(payload);
    //   return
    // }

    setIsApproved(approveStatus);
    setIsApprovalModalOpen(true);

    if (approveStatus) {
      setApprovalModalFields([
        {
          name: 'amountApproved',
          label: 'Amount Approved (excl. GST)',
          type: 'text',
          required: true,
          onChange: (_name: string, value: any, form: any) => {
            form.setFieldValue('amountApproved', value);
          },
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
        {
          name: 'remarks',
          label: 'Remarks',
          type: 'text',
          // required: true,
          onChange: (_name: string, value: any, form: any) => {
            form.setFieldValue('remarks', value);
          },
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
      ]);
    } else {
      setApprovalModalFields([
        {
          name: 'remarks',
          label: 'Remarks',
          type: 'text',
          required: true,
          onChange: (_name: string, value: any, form: any) => {
            form.setFieldValue('remarks', value);
          },
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
      ]);
    }
  };

  const clickableColumnList = 'vendorRentCode';
  const handleLogPopup = async (row: Row | Promise<Row>) => {
    const resolvedRow = await Promise.resolve(row);
    console.log(resolvedRow);

    //     console.log(allVendorRent, 'ALL VENDOR RENT');
    // console.log(
    //   allVendorRent.map((v) => ({
    //     vendorRentId: v.vendorRentId,
    //     recursionLength: v.vendorRentRecurrsion?.length,
    //     LevelId:
    //       v.vendorRentRecurrsion?.[v.vendorRentRecurrsion.length - 1]?.levelId,
    //     latestStatus:
    //       v.vendorRentRecurrsion?.[v.vendorRentRecurrsion.length - 1]?.approverStatusId,
    //   })),
    //   'ALL VENDOR RENT LEVELS'
    // );
    setIsValidVendor(true);
    setVendorHasGST(true);
    setIsLogOpen(true);
    setSelectedRow({
      ...resolvedRow,
    } as VendorRentDTOType);
    setFormFields({
      ...resolvedRow,
    } as VendorRentDTOType);
    setLogTableValue(resolvedRow);

    setSelectedvendorRentId(
      (resolvedRow as VendorRentDTOType).vendorRentId as number,
    );
  };

  function handleCloseLog() {
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    setIsValidVendor(false);
    if (search.vendorRentId || search.rentRecurrsionId) {
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
      return;
    } else {
      navigate({
        to: '/vendor_expenditure/rent',
        replace: true,
      });
    }
  }

  const isDate = (value: any) => {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  };
  const getOrdinal = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`; // 11–13
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const formatValue = (value: any, label: string) => {
    // --- Handle Date values ---
    if (
      isDate(value) ||
      (!isNaN(Date.parse(value)) && typeof value === 'string')
    ) {
      try {
        const date = new Date(value);

        if (label === 'Payment due date') {
          return getOrdinal(date.getDate());
        }
        if (label === 'Invoice Date' || label === 'Date of occupancy') {
          return format(new Date(value), 'dd-MM-yyyy');
        }
        if (label === 'Created on' || label === 'Last updated on') {
          return format(new Date(value), 'dd-MM-yyyy h:mm a');
        }
        return value;
      } catch {
        return value;
      }
    }

    // --- Handle URL values ---
    if (typeof value === 'string' && value.startsWith('http')) {
      try {
        const url = new URL(value);
        const pathname = url.pathname;
        const filename =
          pathname.substring(pathname.lastIndexOf('/') + 1) || 'Download';

        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            {filename}
          </a>
        );
      } catch {
        return value;
      }
    }
    if (label.toLocaleLowerCase().includes('amount')) {
      return INTL_UTILS.formatCurrency({ value });
    }

    if (!value) return '-';

    return value;
  };

  const formatLabel = (label: string) => {
    if (!label) return '';
    if (typeof label === 'number') return label;

    // Insert space before capital letters (camelCase → Camel Case)
    const spaced = label
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');

    // Replace underscores (snake_case → snake case)
    const cleaned = spaced.replace(/_/g, ' ');

    // Capitalize first letter of each word
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map((word, index) => {
        if (/gst/i.test(word)) return word.replace(/gst/gi, 'GST');

        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        // Remaining words lowercase
        return word.toLowerCase();
      })
      .join(' ');
  };

  const ObjectTable = ({ data }: { data: Array<any> }) => {
    if (!Array.isArray(data) || data.length === 0) return '-';

    const keys = Object.keys(data[0]).filter(
      (k) => !k.toLowerCase().includes('id'),
    );

    return (
      <table className="border border-gray-300 rounded text-sm my-2">
        <thead>
          <tr>
            {keys.map((k) => (
              <th
                key={k}
                className="border px-2 py-1 bg-gray-100 dark:bg-gray-800 capitalize"
              >
                {formatLabel(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((obj, idx) => (
            <tr key={idx}>
              {keys.map((k) => (
                <td key={k} className="border px-2 py-1">
                  {formatValue(obj[k], k) || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const DetailItem = ({ row, headcells }: any) => {
    const normalFields: Array<any> = [];
    const objectArrays: Array<any> = [];

    // Separate normal fields and object-array fields
    headcells.forEach((hc: any) => {
      // const value = row[hc.id];
      // if (
      //   hc.id.toLowerCase().includes('id') ||
      //   hc.id.toLowerCase().includes('type')
      // )
      // const excludedKeys = ['id', 'type',];
      // if (
      //   excludedKeys.some(field => 
      //   hc.id.toLowerCase().includes(field)))
      //   return;
      const value = row[hc.id];
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'object' &&
        value[0] === null
      )
        return;
        
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'object'
      ) {
        objectArrays.push({ label: formatLabel(hc.label), value });
      } else {
console.log(normalFields, 'normalFields');
        normalFields.push({ label: formatLabel(hc.label), value });
      }
    });

    return (
      <div className="flex flex-col gap-4">
        {/* GRID FOR NORMAL FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {normalFields.map((item, idx) => (
            <div key={idx}>
              <p className="text-sm text-gray-600 dark:text-gray-500 font-medium">
                {item.label}:
              </p>
              <p className="text-base text-gray-900 dark:text-gray-300 font-semibold mt-1">
                {Array.isArray(item.value)
                  ? item.value.join(', ')
                  : formatValue(item.value, item.label) || '-'}
              </p>
            </div>
          ))}
        </div>

        {/* OBJECT ARRAYS PLACED AT THE BOTTOM */}
        {objectArrays.length > 0 && (
          <div className="mt-1">
            {objectArrays.map((item, idx) => (
              <div key={idx} className="mb-1 flex flex-col">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {item.label}
                </p>
                <ObjectTable data={item.value} />
              </div>
            ))}
          </div>
        )}
        <CustomForm
          label="rent_pop"
          disableLabel
          initialValues={formFields}
          submitFunction={(data) => onUpdate(data)}
          onClose={() => {}}
          fields={vendorRentFields.filter(
            (f) => ![...vendorAdvanceFieldNames, 'siteNames'].includes(f.name),
          )}
          options={options}
          styles={{
            pageName: 'Vendor Rent',
            label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
            container:
              'flex h-fit overflow-auto bg-transparent dark:bg-transparent',
            form: 'w-[100%] max-h-[100vh] border rounded-xl backdrop-blur-md p-1 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
            grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
            submitButton:
              'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
            cancelButton:
              'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
          }}
          buttonLabel={'Update'}
          hide={{
            label: false,
            button: false,
            container: false,
            form: false,
            cancelButton: true,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            submitButton: !isAccounts || toBackend || !isValidVendor,
          }}
        />
      </div>
    );
  };

  const EXCLUDED_KEYS = [
    'rentRecurrsionId',
    'vendorRentId',
    'createdBy',
    'lastUpdatedBy',
  ];

  const RecurrenceItem = ({ row }: any) => {
    const recursions = row?.vendorRentRecurrsion || [];
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!recursions.length) return null;

    const allRecursion = recursions.map((rec: any) => ({
      ...rec,
      approverStatusName: statusDropdown.find(
        (s) => s.approverStatusId === rec.approverStatusId,
      )?.approveStatusName,
    }));
    const nonZeroAmount = allRecursion.filter(
      (rec: any) =>
        !(
          rec.paymentFor === 'Security Deposit' &&
          (rec.amountToPay === 0 || rec.amountToPay == null)
        ),
    );

    const showNoSecurityMessage =
      allRecursion.some((rec: any) => rec.paymentFor === 'Security Deposit') &&
      nonZeroAmount.length === 0;

    if (showNoSecurityMessage) {
      return (
        <>
          <div className="text-sm text-gray-500">
            No Recursion Found
          </div>
        </>
      );
    }

    console.log(nonZeroAmount, allRecursion, 'allRecursion');

    return (
      <div className="flex flex-col gap-4">
        {nonZeroAmount.map((rec: any, index: number) => (
          <RecursionCard
            key={rec.rentRecurrsionId ?? index}
            rec={rec}
            index={index}
            open={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    );
  };

  const RecursionCard = ({ rec, index, open, onToggle }: any) => {
    const getApproverStatusStyle = (statusId: number) => {
      switch (statusId) {
        case 1:
          return { bg: '#FEF9C3', text: '#92400E' };
        case 2:
          return { bg: '#FFEDD5', text: '#9A3412' };
        case 7:
          return { bg: '#EDE9FE', text: '#5B21B6' };
        case 3:
          return { bg: '#DCFCE7', text: '#065F46' };
        case 4:
          return { bg: '#FEE2E2', text: '#991B1B' };
        case 8:
          return { bg: '#DBEAFE', text: '#1E40AF' };
        default:
          return { bg: '#F3F4F6', text: '#374151' };
      }
    };

    return (
      <Card className="border shadow-sm">
        <Collapsible open={open} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer flex flex-row items-center justify-between p-3">
              <div>
                <p className="text-sm font-semibold">
                  {rec.paymentFor} #{index + 1}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>
                    {rec.paymentFor} • ₹{rec.amountToPay ?? '-'}
                  </span>

                  {rec.createdDate && (
                    <span>
                      • Created on{' '}
                      {new Date(rec.createdDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}

                  {rec.approverStatusName && (
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: getApproverStatusStyle(
                          rec.approverStatusId,
                        ).bg,
                        color: getApproverStatusStyle(rec.approverStatusId)
                          .text,
                      }}
                    >
                      {rec.approverStatusName}
                    </span>
                  )}
                </div>
              </div>

              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 space-y-4">
              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(rec)
                  .filter(
                    ([key]) =>
                      !EXCLUDED_KEYS.includes(key) &&
                      !key.toLowerCase().includes('id'),
                  )
                  .map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground">
                        {formatLabel(key)}
                      </p>
                      <p className="font-medium">{formatValue(value, key)}</p>
                    </div>
                  ))}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  onClick={() => handleApprovalModal(false, rec)}
                  disabled={
                    getDisableApprovalFlow({
                      selectedRow: rec,
                      isAccounts,
                      toBackend,
                      toRejectionBackend,
                      toApprovalBackend,
                      approverCategory: ModuleName,
                    }) || toRejectionBackend
                  }
                  variant="destructive"
                  className="px-5"
                >
                  {toRejectionBackend ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting
                    </>
                  ) : (
                    'Reject'
                  )}
                </Button>

                <Button
                  onClick={() => handleApprovalModal(true, rec)}
                  disabled={
                    getDisableApprovalFlow({
                      selectedRow: rec,
                      isAccounts,
                      toBackend,
                      toRejectionBackend,
                      toApprovalBackend,
                      approverCategory: ModuleName,
                    }) || toApprovalBackend
                  }
                  className="px-5 bg-green-600 hover:bg-green-700"
                >
                  {toApprovalBackend ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving
                    </>
                  ) : (
                    'Approve'
                  )}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const DetailTable = ({ row, headcells }: { row: any; headcells: any }) => {
    return (
      <div className="w-full max-w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {headcells.map((hc: any) => (
                <th
                  key={hc.id}
                  className={`px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                    hc.id === 'changes' ? 'w-[60%] max-w-[60%]' : 'w-auto'
                  }`}
                >
                  {hc.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {row.length > 0 ? (
              row.map((rw: any, rowIndex: number) => (
                <tr key={rowIndex} className="border-b dark:border-gray-700">
                  {headcells.map((hc: any) => (
                    <td
                      key={hc.id}
                      className={`px-4 py-2 text-sm text-gray-800 dark:text-gray-300 ${
                        hc.id === 'changes' ? 'whitespace-pre-line' : ''
                      }`}
                    >
                      {rw[hc.id] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headcells.length}
                  className="px-4 py-3 text-center text-gray-500"
                >
                  No Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const tabList = [
    {
      value: 'details',
      label: 'Details',
      component: DetailItem,
    },
    {
      value: 'recurrence',
      label: 'Recurrence',
      component: RecurrenceItem,
    },
    {
      value: 'logs',
      label: 'Logs',
      component: DetailTable,
      className:
        'w-full max-w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700',
    },
  ];

  function handleStatusTab(tab: string) {
    setStatusTabsValue(tab);
    // setTabsValue('all');
  }

  return (
    <div className="m-2.5 h-[80%]">
      {VendorAdvanceQuery.isLoading ||
      VendorAdvanceQuery.isFetching ||
      isDependencyLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <section className="w-full h-full flex flex-col">
          <div className="flex items-center justify-end gap-2">
            <Tabs defaultValue={statusTabsValue}>
              <TabsList className="flex gap-2">
                <TabsTrigger
                  value="approvalStatus"
                  onClick={() => handleStatusTab('approvalStatus')}
                >
                  Approval status
                </TabsTrigger>

                <TabsTrigger
                  value="depositStatus"
                  onClick={() => handleStatusTab('depositStatus')}
                >
                  Deposit Status
                </TabsTrigger>

                <TabsTrigger
                  value="rentStatus"
                  onClick={() => handleStatusTab('rentStatus')}
                >
                  Rent Status
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs defaultValue={tabsValue}>
              <TabsList className="flex gap-2">
                <TabsTrigger value="all" onClick={() => setTabsValue('all')}>
                  All
                  {tabsCount.all > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-800">
                      {tabsCount.all}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="pending"
                  onClick={() => setTabsValue('pending')}
                >
                  Pending
                  {tabsCount.pending > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-200 text-xs font-medium text-yellow-800">
                      {tabsCount.pending}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="approved"
                  onClick={() => setTabsValue('approved')}
                >
                  Approved
                  {tabsCount.approved > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-xs font-medium text-green-800">
                      {tabsCount.approved}
                    </span>
                  )}
                </TabsTrigger>

                {/* <TabsTrigger
                  value="partiallyApproved"
                  onClick={() => setTabsValue('partiallyApproved')}
                >
                  Partially Approved
                  {tabsCount.partiallyApproved > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-xs font-medium text-green-800">
                      {tabsCount.partiallyApproved}
                    </span>
                  )}
                </TabsTrigger> */}

                <TabsTrigger
                  value="rejected"
                  onClick={() => setTabsValue('rejected')}
                >
                  Rejected
                  {tabsCount.rejected > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-xs font-medium text-red-800">
                      {tabsCount.rejected}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="paid" onClick={() => setTabsValue('paid')}>
                  Paid
                  {tabsCount.paid > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-xs font-medium text-green-800">
                      {tabsCount.paid}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="hostBooks"
                  onClick={() => setTabsValue('hostBooks')}
                >
                  Host Books
                  {tabsCount.hostBooks > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-xs font-medium text-green-800">
                      {tabsCount.hostBooks}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName="Vendor Rent"
            functions={allFunctions}
            access={{
              hasCreateAccess: hasCreateAccess,
              hasUpdateAccess: hasUpdateAccess,
            }}
            editOptions={['Edit']}
            hide={{
              add: !hasCreateAccess,
              upload: !hasCreateAccess,
              filter: false,
              hidden: false,
              download: false,
            }}
            colorCode={true}
            colorCodeLogic={(row, headcellId) => {
              if (headcellId === 'approverStatusName') {
                switch (row.approverStatusId) {
                  case 1:
                    return { backgroundColor: '#FEF9C3', color: '#92400E' };
                  case 2:
                    return { backgroundColor: '#FFEDD5', color: '#9A3412' };
                  case 7:
                    return { backgroundColor: '#EDE9FE', color: '#5B21B6' };
                  case 3:
                    return { backgroundColor: '#DCFCE7', color: '#065F46' };
                  case 4:
                    return { backgroundColor: '#FEE2E2', color: '#991B1B' };
                  case 8:
                    return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
                  default:
                    return { backgroundColor: '#F3F4F6', color: '#374151' };
                }
              }
              if (headcellId === 'approverDepositStatusName') {
                switch (row.approverDepositStatusId) {
                  case 1:
                    return { backgroundColor: '#FEF9C3', color: '#92400E' };
                  case 2:
                    return { backgroundColor: '#FFEDD5', color: '#9A3412' };
                  case 7:
                    return { backgroundColor: '#EDE9FE', color: '#5B21B6' };
                  case 3:
                    return { backgroundColor: '#DCFCE7', color: '#065F46' };
                  case 4:
                    return { backgroundColor: '#FEE2E2', color: '#991B1B' };
                  case 8:
                    return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
                  default:
                    return { backgroundColor: '#F3F4F6', color: '#374151' };
                }
              }
              if (headcellId === 'approverRentStatusName') {
                switch (row.approverRentStatusId) {
                  case 1:
                    return { backgroundColor: '#FEF9C3', color: '#92400E' };
                  case 2:
                    return { backgroundColor: '#FFEDD5', color: '#9A3412' };
                  case 7:
                    return { backgroundColor: '#EDE9FE', color: '#5B21B6' };
                  case 3:
                    return { backgroundColor: '#DCFCE7', color: '#065F46' };
                  case 4:
                    return { backgroundColor: '#FEE2E2', color: '#991B1B' };
                  case 8:
                    return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
                  default:
                    return { backgroundColor: '#F3F4F6', color: '#374151' };
                }
              }
              return undefined;
            }}
            includedDownloadColumns={includedDownloadColumns}
            customToolbarItems={{
              position: 'before',
              element: (
                <FormLinkGenerator
                  session={session}
                  formPath="vendor_expenditure/rentForm"
                  dialogTitle="Vendor rent Form"
                  dialogDescription="Anyone with this link can fill the rent form."
                  tooltipContent="Generate Vendor rent Form"
                />
              ),
            }}
            clickableColumn={clickableColumnList}
            onClick={handleLogPopup}
          />
        </section>
      )}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <CustomForm
              initialValues={formFields}
              submitFunction={(data) =>
                edit ? onUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={vendorRentFields
                .filter((f) => vendorAdvanceFieldNames.includes(f.name))
                .sort(
                  (a, b) =>
                    vendorAdvanceFieldNames.indexOf(a.name) -
                    vendorAdvanceFieldNames.indexOf(b.name),
                )}
              toBackend={toBackend}
              options={options}
              styles={formStyles}
              label={edit ? 'Update Rent Details' : 'Create New Rent'}
              buttonLabel={
                edit
                  ? toBackend
                    ? 'Updating'
                    : 'Update'
                  : toBackend
                    ? 'Submitting'
                    : 'Submit'
              }
            />
          </Modal>
        </div>
      )}

      {isExcelOpen && (
        <ExcelPreviewModal
          open={isExcelOpen}
          data={excelData}
          toBackend={toBackend}
          onClose={() => setIsExcelOpen(false)}
          onUpload={handleUploadExcel}
        />
      )}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal
            open={isApprovalModalOpen}
            onClose={() => setIsApprovalModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <CustomForm
              initialValues={{
                vendorRentId: selectedRow!.vendorRentId,
                approvedBy: session.userId,
                amountApproved:
                  selectedRentRecurrsion?.amountToPay ||
                  selectedRentRecurrsion?.approvedAmount,
                remarks: null,
              }}
              submitFunction={(data) =>
                isApproved ? handleApproval(data) : handleReject(data)
              }
              onClose={() => setIsApprovalModalOpen(false)}
              fields={approvalModalFields!}
              toBackend={toBackend}
              extraContent={<RentApprovalCard data={selectedRentRecurrsion!} />}
              options={{}}
              styles={formStyles}
              label={isApproved ? 'Approve Advance' : 'Reject Advance'}
              disableLabel
              buttonLabel={isApproved ? 'Approve' : 'Reject'}
            />
          </Modal>
        </div>
      )}
      {isLogOpen && (
        <LogPopup
          open={isLogOpen}
          onClose={handleCloseLog}
          pageName="Vendor Rent"
          row={logTableValue}
          headcells={logHeadcells}
          tabList={tabList}
          tabsValue={logTabsValue}
          onTabChange={(val: any) => handleLogsTabChange(val)}
        />
      )}
    </div>
  );
}
