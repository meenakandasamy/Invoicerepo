import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal, Tooltip } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { format, isValid, parseISO } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import debounce from 'lodash.debounce';
import { CustomForm } from '../form/customForm';
import { CustomTable } from '../table/customTable';
// import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import LogPopup from '../layout/LogPopup';
import { Button } from '../ui/button';
import { FormLinkGenerator } from '../form/FormLinkGenerator';
import { CustomScreen, CustomScreenForm, LogScreen } from '../layout/LogScreen';
// import {  } from '../layout/LogScreen';
import {
  calculateAmounts,
  distributeAdvanceConsumed,
  distributeAdvanceConsumedForExpense,
} from './expenseCalculation';
import ExpenseSplitTable from './ExpenseSplitTable';
import type { JSX } from 'react';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type {
  ExpenseApprovalType,
  ExpenseDTOType,
  ExpenseRejectionType,
  ExpenseUpdateDTOType,
} from '@/utils/Validators/schema/ExpeneseSchema';
import type { ExpenseSplit } from '@/types/expense';
import type { ExpenseSearch } from '@/utils/Validators/schema/SearchSchemas';
import type { vendorDropdownType } from '@/types/requestor';
import type { VendorAdvance } from '@/types/vendorAdvance';
import { useExpenses } from '@/hooks/data/useExpense';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useVendorDropdown } from '@/hooks/data/useVendor';
import { useApproverCategory } from '@/hooks/data/useApproverCategory';
import { useApproverStatus } from '@/hooks/data/useApproverStatus';
import { useSites } from '@/hooks/data/useSite';
import { invalidateQuery } from '@/utils/common/queryUtils';
import {
  ExpenseQueries,
  ExpenseServices,
} from '@/integrations/Services/expenseService';
import { useExpenseLogs } from '@/hooks/data/useExpenseLogs';
import { useApproverDetails } from '@/hooks/data/useApproverDetails';
import { useVendorAdvanceDropdown } from '@/hooks/data/useVendorAdvanceDropdown';
import { INTL_UTILS } from '@/utils/common/IntlUtils';
import { VendorAdvanceServices } from '@/integrations/Services/vendorAdvanceService';
import { useFormPageStore } from '@/stores/formPageStore';
import {
  APPROVER_CATEGORY,
  isPrimaryValidator,
  levelValidator,
} from '@/utils/common/permissions';
import Loader from '@/utils/common/components/loader';
import { useUserList } from '@/hooks/data/useUserList';
import { ConsolidatedDashboardQuery } from '@/integrations/Services/consolidatedService';
import { usePoDropdownByVendorId } from '@/hooks/data/usePoDropdownByVendorId';
import { usePoDocByPoId } from '@/hooks/data/usePoDocByPoId';
import { Decrypt, Encrypt } from '@/utils/auth/encryptor';

interface ExpensesProps extends BaseProps {
  search: ExpenseSearch;
}

export default function ExpensePage(props: ExpensesProps): JSX.Element {
  const { hasCreateAccess, hasUpdateAccess, session, search } = props;
  const navigate = useNavigate({
    from: '/vendor_expenditure/expenses',
  });

  // useEffect(() => {
  //   if (search.expenseId) {
  //     const data = getExpenseData(search.expenseId);
  //     console.log(data, 'testForLog');

  //     handleLogPopup(data);
  //   }
  //   async function getExpenseData(id: string | number) {
  //     const expenseData = await ExpenseServices.fetchExpenseById(id);
  //     return expenseData;
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [search.expenseId]);

  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalFields, setApprovalModalFields] =
    useState<Array<Field>>();

  //   Log States:
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [toApprovalBackend, setToApprovalBackend] = useState<boolean>(false);
  const [toRejectionBackend, setToRejectionBackend] = useState<boolean>(false);

  const [logTableValue, setLogTableValue] = useState<any>(null);
  const [logTabsValue, setLogTabsValue] = useState<any>('details');
  const [popupLoading, setPopupLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ExpenseDTOType | null>(null);
  const [selectedExpenseReqId, setSelectedExpenseReqId] = useState<
    number | null
  >(null);
  const [isValidVendorId, setIsValidVendorId] = useState<string | number>('');
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);

  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>(
    {},
  );

  console.log(logTableValue, 'popupLoading');

  const toggleExpand = (index: number) => {
    setExpandedFields((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const [categoryName, setCategoryName] = useState<string>('');

  enum METHOED {
    COST_IDS = 'COST_IDS',
    COST_IDS_ADMIN = 'COST_IDS_ADMIN',
    LEVEl_ID = 'LEVEL_ID',
    ALL = 'ALL',
    EXPENSE_ID = 'EXPENSE_ID',
    ORG_ID = 'ORG_ID',
  }

  // ! must call in all expense flow modules
  const { data: approverDetails } = useApproverDetails(session.userId);
  const isAccounts = isPrimaryValidator(APPROVER_CATEGORY.VENDOR_EXPENSES);
  // const isAccounts = true;

  const ExpenseQuery = useExpenses(
    session,
    isAccounts
      ? METHOED.ORG_ID
      : session.roleName.toLocaleLowerCase().includes('admin')
        ? METHOED.COST_IDS_ADMIN
        : METHOED.COST_IDS,
  );
  const expenseByIdQuery = useExpenses(
    session,
    METHOED.EXPENSE_ID,
    Number(search.expenseId),
  );

  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const VendorQuery = useVendorDropdown();
  const ApproverCategoryQuery = useApproverCategory();
  const ApproverStatusQuery = useApproverStatus();
  const SiteQuery = useSites(session);
  const logsQuery = useExpenseLogs(selectedExpenseReqId, session);
  const vendorId = selectedRow ? selectedRow.vendorId : null;
  const AdvanceDropDownQuery = useVendorAdvanceDropdown(vendorId);
  const userQuery = useUserList(session);
  const poDropdownQuery = usePoDropdownByVendorId(isValidVendorId);
  const fetchPoDocQuery = usePoDocByPoId(selectedPoId);

  const allExpense = useMemo(
    () =>
      (ExpenseQuery.data ?? []).sort(
        (a, b) =>
          new Date(b.lastUpdatedDate as string).getTime() -
          new Date(a.lastUpdatedDate as string).getTime(),
      ),
    [ExpenseQuery.data],
  );

  useEffect(() => {
    if (search.expenseId && expenseByIdQuery.data) {
      // console.log('searchFetch', search.expenseId, expenseByIdQuery);

      handleLogPopup(expenseByIdQuery.data);
    }
  }, [search.expenseId, expenseByIdQuery.data]);

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
  console.log(categoryDropdown);
  
  const statusDropdown = useMemo(
    () => ApproverStatusQuery.data ?? [],
    [ApproverStatusQuery.data],
  );
  const siteDropdown = useMemo(() => SiteQuery.data ?? [], [SiteQuery.data]);
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

  const advanceDropdown = useMemo(
    () => AdvanceDropDownQuery.data ?? [],
    [AdvanceDropDownQuery.data],
  );
  const userDropdown = useMemo(() => userQuery.data ?? [], [userQuery.data]);

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

  const poDropdown = useMemo(
    () => poDropdownQuery.data ?? [],
    [poDropdownQuery.data],
  );
  const poDocUrl = useMemo(
    () => fetchPoDocQuery.data ?? [],
    [fetchPoDocQuery.data],
  );

  const expenseFieldNames = [
    'vendorName',
    'selectedVendorName',
    'poNumber',
    'categoryName',
    'invoiceNo',
    'invoiceDate',
    'totalAmmountNoGst',
    'gstPercentage',
    // 'totalValue',
    'advancePaid',
    // 'amountPayable',
    'description',
    'invoiceFilePath',
    'invoiceFileType',
    'poLoiFilePath',
    'poLoiFileType',
    'wcrFilePath',
    'wcrFileType',
    'ticketReportFilePath',
    'ticketReportFileType',
    'action',
  ];

  const expenseViewForm = [
    'expenseReqCode',
    'createdByName',
    'createdDate',
    'vendorName',
    // 'vendorPocName',
    // 'vendorCode',
    'vendorEmail',
    'gstStatus',
    'categoryName',
    'invoiceNo',
    'invoiceDate',
    'description',
    'remarks',
    'invoiceFilePath',
    'invoiceFileType',
    'poLoiFilePath',
    'poLoiFileType',
    'wcrFilePath',
    'wcrFileType',
    'ticketReportFilePath',
    'ticketReportFileType',
    'totalAmmountNoGst',
    'gstPercentage',
    'gstAmount',
    'totalValue',
    'advancePaid',
    'costCentreNames',
    'costHeaderNames',
    'tdsPercentage',
    'tdsAmount',
    'amountWithTds',
    'vendorAdvanceCode',
    'advanceConsumed',
    'approverStatusName',
    'visualLevelId',
    'amountApproved',
    'amountPayable',
    'toBeInvoiced',
    'lastUpdatedByName',
    'lastUpdatedDate',
    'amountPaid',
    'paymentDate',
    'transactionRef',
  ];

  function handleLogsTabChange(value: string) {
    setLogTabsValue(value);
    if (value === 'logs') {
      const sortedLogs = sortByOccurredOnAsc(logs);
      setLogTableValue(sortedLogs);
      console.log(logs, 'sortedLogs');
    } else if (value === 'details') {
      setLogTableValue(selectedRow);
    }
  }

  const [tableValue, setTableValue] = useState<Array<Row>>(allExpense);
  const [tabsValue, setTabsValue] = useState<string>('all');

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

  useEffect(() => {
    switch (tabsValue) {
      case 'all':
        setTableValue(allExpense);
        break;
      case 'pending':
        setTableValue(() => {
          return allExpense.filter(
            (expense) =>
              expense.approverStatusId === ApproverStatus.Pending ||
              expense.approverStatusId === ApproverStatus.InProgress ||
              expense.approverStatusId === ApproverStatus.Hold,
          );
        });
        break;
      case 'approved':
        setTableValue(() => {
          return allExpense.filter(
            (expense) =>
              expense.approverStatusId === ApproverStatus.Approved &&
              !expense.isPaid,
          );
        });
        break;
      case 'partiallyApproved':
        setTableValue(() => {
          return allExpense.filter(
            (expense) =>
              expense.approverStatusId === ApproverStatus.PartiallyApproved,
          );
        });
        break;
      case 'rejected':
        setTableValue(() => {
          return allExpense.filter(
            (expense) => expense.approverStatusId === ApproverStatus.Rejected,
          );
        });
        break;
      case 'paid':
        setTableValue(() => {
          return allExpense.filter((expense) => expense.isPaid);
        });
        break;
      case 'hostBooks':
        setTableValue(() => {
          return allExpense.filter(
            (expense) =>
              expense.hostBooks === 'Yes' || expense.hostBooks === true,
          );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsValue, allExpense]);

  const tabsCount = useMemo(() => {
    const all = allExpense.length;

    const pending = allExpense.filter(
      (item) =>
        item.approverStatusId === ApproverStatus.Pending ||
        item.approverStatusId === ApproverStatus.InProgress ||
        item.approverStatusId === ApproverStatus.Hold,
    ).length;

    const approved = allExpense.filter(
      (item) =>
        item.approverStatusId === ApproverStatus.Approved && !item.isPaid,
    ).length;

    const partiallyApproved = allExpense.filter(
      (item) => item.approverStatusId === ApproverStatus.PartiallyApproved,
    ).length;

    const rejected = allExpense.filter(
      (item) => item.approverStatusId === ApproverStatus.Rejected,
    ).length;

    const paid = allExpense.filter((item) => item.isPaid).length;

    const hostBooks = allExpense.filter(
      (item) => item.hostBooks === 'Yes' || item.hostBooks === true,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allExpense]);

  const headCells: Array<HeadCell> = [
    // 1. Vendor Expense Code
    {
      id: 'expenseReqCode',
      label: 'Vendor Expense Code',
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
    // 4. Vendor Company Name
    {
      id: 'vendorName',
      label: 'Vendor Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorDropdown.map((v) => v.vendorName),
    },
    // 5. Vendor POC Name
    {
      id: 'vendorPocName',
      label: 'Vendor POC Name',
      defaultView: false,
      view: false,
      filterable: false,
    },
    // 6. Vendor Code
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      defaultView: true,
      view: true,
      filterable: true,
    },
     {
      id: 'poNumber',
      label: 'Po Number',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 7. Vendor Email
    {
      id: 'vendorEmail',
      label: 'Vendor Email',
      defaultView: false,
      view: false,
      filterable: false,
    },
    // 8. GST Status
    {
      id: 'gstStatus',
      label: 'GST Status',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 9. Category
    {
      id: 'categoryName',
      label: 'Category',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: categoryDropdown.map((c) => c.categoryName),
    },
    // 10. Invoice Number
    {
      id: 'invoiceNo',
      label: 'Invoice Number',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 11. Invoice Date
    {
      id: 'invoiceDate',
      label: 'Invoice Date',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 12. Description
    {
      id: 'description',
      label: 'Description',
      defaultView: false,
      view: false,
      filterable: false,
      visualFormat: (value: string) => {
        if (!value) return '';

        const words = value.trim().split(/\s+/);
        const showTooltip = value.length > 20;

        return showTooltip ? (
          <Tooltip title={value} arrow>
            <span
              style={{
                display: 'inline-block',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {value}
            </span>
          </Tooltip>
        ) : (
          value
        );
      },
    },
    // 13. Total Amount (excl. GST)
    {
      id: 'totalAmmountNoGst',
      label: 'Taxable Amt',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 14. GST Slab
    // {
    //   id: 'gstPercentage',
    //   label: 'GST Slab (%)',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    //   filterType: 'range',
    // },
    // (Optional: GST Amount - kept for logic completeness, remove if strictly not needed)
    {
      id: 'gstAmount',
      label: 'GST Amt',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 15. Total Amount (incl. GST)
    {
      id: 'totalValue',
      label: 'Total Amt',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 16. Advance Paid (by Inspire)
    {
      id: 'advancePaid',
      label: 'Advance Paid (by Inspire)',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 17. Cost Centre
    {
      id: 'costCentreNames',
      label: 'Cost Centre',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: costCentersDropdown.map((c) => c.costCentreName),
    },
    // 18. Cost Header
    {
      id: 'costHeaderNames',
      label: 'Cost Header',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: costHeadersDropdown.map((c) => c.costHeaderName),
    },
    // 19. TDS%
    {
      id: 'tdsPercentage',
      label: 'TDS%',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    // 20. TDS Amount
    {
      id: 'tdsAmount',
      label: 'TDS Amt',
      defaultView: true,
      view: true,
      filterable: true,
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
      filterType: 'range',
    },
    // 21. Total Amount (Amount with TDS)
    {
      id: 'amountWithTds',
      label: 'Total Amt (incl. TDS)',
      defaultView: true,
      view: true,
      filterable: true,
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
      filterType: 'range',
    },
    // 22. Vendor Advance Code
    {
      id: 'vendorAdvanceCode',
      label: 'Vendor Advance Code',
      defaultView: false,
      view: false,
      filterable: false,
    },
    // 23. Advance Consumed
    {
      id: 'advanceConsumed',
      label: 'Advance Consumed',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 24. Approval Status
    {
      id: 'approverStatusName',
      label: 'Approval Status',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: statusDropdown.map((s) => s.approveStatusName),
    },
    // (Internal Field: Current Level - usually kept near Status)
    {
      id: 'visualLevelId',
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
    // 25. Amount Approved
    {
      id: 'amountApproved',
      label: 'Amt Approved (excl. GST)',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 26. Amount Payable
    {
      id: 'amountPayable',
      label: 'Amt Payable',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 27. Remarks (by Inspire)
    // {
    //     id: 'remarks',
    //     label: 'Remarks (by Inspire)',
    //     defaultView: true,
    //     view: true,
    //     filterable: true,
    // },
    // 28. To be invoiced
    {
      id: 'toBeInvoiced',
      label: 'To be invoiced',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 29. Updated By
    {
      id: 'lastUpdatedByName',
      label: 'Updated By',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // Approvers Remark
    {
      id: 'remarks',
      label: 'Remarks',
      defaultView: true,
      view: true,
      filterable: true,
      visualFormat: (value: string) => {
        if (!value) return '';

        const words = value.trim().split(/\s+/);
        const showTooltip = words.length > 3;

        return showTooltip ? (
          <Tooltip title={value} arrow>
            <span
              style={{
                display: 'inline-block',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {value}
            </span>
          </Tooltip>
        ) : (
          value
        );
      },
    },
    // 30. Updated Timestamp
    {
      id: 'lastUpdatedDate',
      label: 'Last Updated On',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 31. Amount Paid
    {
      id: 'amountPaid',
      label: 'Amount Paid',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 32. Date of Payment
    {
      id: 'paymentDate',
      label: 'Date of Payment',
      defaultView: false,
      view: false,
      filterable: false,
    },
    // 33. IMPS / NEFT Transfer Reference #
    {
      id: 'transactionRef',
      label: 'IMPS / NEFT Transfer Reference #',
      defaultView: false,
      view: false,
      filterable: true,
    },

    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
    },
  ];
  const includedDownloadColumns = headCells
    .filter((headcell) => headcell.view === true)
    .map((headcell) => headcell.id);

  const isValidFile = (value?: string | null) => {
    if (!value || value.trim() === '') return true;

    if (
      value.startsWith('JVBERi0x') || // PDF
      value.startsWith('/9j/') || // JPG
      value.startsWith('iVBORw0KG') // PNG
    ) {
      return true;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = value.split('.').pop()?.toLowerCase();

    return allowedExtensions.includes(ext || '');
  };

  const logHeadcells = useMemo(() => {
    if (!logTableValue) return [];
    if (logTabsValue === 'logs') {
      return [
        { id: 'action', label: 'Action' },
        { id: 'changes', label: 'Changes' },
        { id: 'occuredOn', label: 'Occured On' },
        { id: 'updatedByName', label: 'Updated By' },
      ];
    }

    const isNotEmpty = (v: any) => {
      if (v == null) return false;

      if (v === '') return false;

      if (Array.isArray(v)) {
        return v.some((item) => item != null && item !== '');
      }

      if (typeof v === 'object') {
        return Object.keys(v).length > 0;
      }

      return true;
    };

    return Object.keys(logTableValue)
      .filter((key) => isNotEmpty(logTableValue[key]))
      .map((key) => ({
        id: key,
        label: headCells.find((hc) => hc.id === key)?.label || key,
      }))
      .filter((item) => expenseViewForm.includes(item.id))
  //     .sort((a, b) => {
  //       const ModifiedFieldNames = [
  //         'expenseReqCode',
  //         'createdByName',
  //         'createdDate',
  //          'vendorCode',
  //         'vendorName',
  //         'vendorPocName',
  //         'vendorEmail',
  //         'gstStatus',
  //         'categoryName',
  //         'invoiceNo',
  //         'description',
  //         'invoiceDate',
  //         'remarks',
  //         'invoiceFilePath',
  //         'invoiceFileType',
  //         'poLoiFilePath',
  //         'poLoiFileType',
  //         'wcrFilePath',
  //         'wcrFileType',
  //         'ticketReportFilePath',
  //         'ticketReportFileType',
  //         'totalAmmountNoGst',
  //         'gstPercentage',
  //         'gstAmount',
  //         'totalValue',
  //         'advancePaid',
  //         'costCentreNames',
  //         'costHeaderNames',
  //         'tdsPercentage',
  //         'tdsAmount',
  //         'amountWithTds',
  //         'vendorAdvanceCode',
  //         'advanceConsumed',
  //         'approverStatusName',
  //         'visualLevelId',
  //         'amountApproved',
  //         'amountPayable',
  //         'toBeInvoiced',
  //         'lastUpdatedByName',
  //         'lastUpdatedDate',
  //         'amountPaid',
  //         'paymentDate',
  //         'transactionRef',
  //       ];
  //        const indexA = ModifiedFieldNames.indexOf(a.id);
  // const indexB = ModifiedFieldNames.indexOf(b.id);

  // // ✅ If both not found → keep original order
  // if (indexA === -1 && indexB === -1) return 0;

  // // ✅ If only A not found → push A down
  // if (indexA === -1) return 1;

  // // ✅ If only B not found → push B down
  // if (indexB === -1) return -1;

  // // ✅ Normal sorting
  // return indexA - indexB;
  //     }
  //   );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logTableValue, logTabsValue]);
console.log(logHeadcells, 'logHeadcells');
  // Form variables, states, functions and declarations
  const defaultValues = {
    createdDate: '',
    lastUpdatedDate: '',

    expenseId: 0,
    expenseReqCode: '',

    // -- Audit Names --
    createdByName: '',
    updatedByName: '',

    // -- Vendor Details --
    vendorId: 0,
    vendorName: '',
    vendorCode: '',
    vendorPocName: '',
    vendorEmail: '',
    gstStatus: '',

    categoryId: 0,
    categoryName: '',

    remarks: '',
    description: '',

    totalAmmountNoGst: 0,
    gstPercentage: 0,
    gstAmount: 0,
    totalValue: 0,
    advancePaid: 0,

    costCentreIds: [],
    costCentreNames: [],

    costHeaderIds: [],
    costHeaderNames: [],

    siteIds: [],
    siteNames: [],

    invoiceFilePath: null,
    poLoiFilePath: null,
    wcrFilePath: null,
    ticketReportFilePath: null,

    approverStatusId: 0,
    approverStatusName: null,

    createdBy: 0,
    lastUpdatedBy: null,

    invoiceNo: '',
    invoiceDate: '',
    toBeInvoiced: '',

    tdsPercentage: null,
    tdsAmount: null,
    amountWithTds: null,

    advanceId: null,
    advanceConsumed: null,
    sourceAdvance: null,
    advanceCode: '',

    amountApproved: 0,
    amountPayable: 0,

    // -- Payment / Transaction Details --
    amountPaid: 0,
    paymentDate: '',
    transactionRef: '',

    invoice_fileType: null,
    po_loi_fileType: null,
    wcr_fileType: null,
    ticket_report_fileType: null,

    invoiceFileType: null,
    poLoiFileType: null,
    wcrFileType: null,
    ticketReportFileType: null,
    finalAmount: null,
    levelId: null,
    visualLevelId: null,
    isPaid: false,

    fpNftReference: '',
    hostBooks: 'No',

    expenseSplits: [
      {
        expenseId: 0,
        totalAmmountNogst: null,
        gstPercentage: null,
        amount: null,
        costCentreId: 0,
        costCentreName: '',
        amountApproved: null,
        advanceConsumed: null,
        costHeaderId: 0,
        costHeaderName: '',
        approverStatusId: null,
        approverStatusName: null,
        createdBy: session.userId,
        lastUpdatedBy: session.userId,
        splitPercent: null,
        toBeInvoiced: 'No',
      },
    ],
  };
  const [formFields, setFormFields] = useState<ExpenseDTOType>(defaultValues);

  const computeTotals = (form: any) => {
    const totalNoGst = Number(form.getFieldValue('totalAmmountNoGst') || 0);
    const gst = Number(form.getFieldValue('gstPercentage') || 0);
    const gstAmount = Number((totalNoGst * gst) / 100);
    const advancePaid = Number(form.getFieldValue('advancePaid') || 0);

    form.setFieldValue('totalValue', (totalNoGst + gstAmount).toFixed(2));
    form.setFieldValue(
      'amountPayable',
      (totalNoGst - advancePaid + gstAmount).toFixed(2),
    );
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

      const isExpense =
        vendorExists?.vendorType.includes('Product') ||
        vendorExists?.vendorType.includes('Service') ||
        false;
      const isExpenseApproved =
        vendorExists?.approverStatusId === ApproverStatus.Approved;

      if (!vendorExists) {
        toast.error('Vendor does not exist or not verified yet.');
        setState(false);
        return;
      }
      if (!isExpense) {
        toast.error('Vendor Type is not a Product or Service.');
        setState(false);
        return;
      }
      if (!isExpenseApproved) {
        toast.error('Vendor is not approved yet.');
        setState(false);
        return;
      }
      setState(!!vendorExists);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      setVendorHasGST(vendorExists.gstNo !== null && vendorExists.gstNo !== '');
      setIsValidVendorId(vendorExists.vendorId);
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

  const [isValidPoNumber, setIsValidPoNumber] = useState(false);
  const [validPoId, setValidPoId] = useState<number | null>(null);
  const validatePoNumber = debounce(
    (value: string, form: any, pd: any, setState: (v: boolean) => void) => {
      const poExists = pd.find((p) => p.poNumber === value);

      if (!poExists) {
        toast.error('PO Number does not exist.');
        setState(false);
        return;
      }
      setState(!!poExists);
      setValidPoId(poExists.poId);
      const updatedValues = {
        ...form.store.state.values,
        selectedPoNumber: poExists?.poNumber || null,
      };

      form.setFieldValue('selectedPoNumber', poExists?.poNumber || null);
      setFormFields(updatedValues);
    },
    1000, // 1s delay
  );

  console.log(isValidPoNumber, validPoId, 'poValidation');

  const shouldBeTrue = useMemo(() => {
    const isNonAccounts = !isAccounts;
    const levelMismatch = !(
      selectedRow &&
      selectedRow.levelId &&
      levelValidator(
        APPROVER_CATEGORY.VENDOR_EXPENSES,
        +selectedRow.levelId - 1,
        {
          costCentreIds: selectedRow.costCentreIds || [],
          costHeaderIds: selectedRow.costHeaderIds || [],
        },
      )
    );
    const isPending = selectedRow?.approverStatusId === +ApproverStatus.Pending;

    return (isNonAccounts && levelMismatch) || (isAccounts && !isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRow, isAccounts]);

  const statusId = +(selectedRow?.approverStatusId ?? -1);

  const disableApprovalFlow =
    [
      ApproverStatus.Approved,
      ApproverStatus.Rejected,
      ApproverStatus.PartiallyApproved,
    ].includes(statusId) ||
    shouldBeTrue ||
    toBackend ||
    toRejectionBackend ||
    toApprovalBackend;

  const expenseFields: Array<Field> = [
    {
      name: 'vendorName',
      label: 'Vendor Email / Code',
      type: 'text',
      placeholder: 'Enter Vendor Email / Code',
      required: true,
      disabled: edit || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('vendorName', value);
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
      label: 'Vendor Name',
      type: 'text',
      placeholder: 'Vendor Name',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'poNumber',
      label: 'PO Number',
      type: 'text',
      placeholder: 'Select PO Number',
      disabled: !isValidVendor || toBackend,
      // required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('poNumber', value);
        validatePoNumber(value, form, poDropdown, setIsValidPoNumber);
        const selectedPoId = poDropdown.find((p) => p.poNumber === value)?.poId;
        setSelectedPoId(selectedPoId);
        console.log('logTest');
      },
    },
    {
      name: 'categoryName',
      label: 'Category',
      type: 'select',
      placeholder: 'Select Category',
      required: true,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('categoryName', value);
        form.setFieldValue(
          'categoryId',
          categoryDropdown.find((c) => c.categoryName === value)?.categoryId,
        );
        setCategoryName(value);
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
      placeholder: 'Enter description',
      required: true,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
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
      name: 'totalAmmountNoGst',
      label: 'Total Amount (excl. GST)',
      type: 'text',
      placeholder: 'Enter total amount without GST',
      required: true,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('totalAmmountNoGst', value);
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // {
    //   name: 'gstPercentage',
    //   label: 'GST %',
    //   type: 'select',
    //   placeholder: 'Enter GST %',
    //   required: true,
    //   disabled: !isValidVendor || !vendorHasGST || toBackend,
    //   onChange: (_name: string, value: any, form: any) => {
    //     form.setFieldValue('gstPercentage', value);
    //     computeTotals(form);
    //   },
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-500',
    //     input:
    //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    //   },
    // },
    // {
    //   name: 'totalValue',
    //   label: 'Total Value',
    //   type: 'number',
    //   placeholder: 'Enter total value',
    //   required: true,
    //   disabled: true,
    //   onChange: (_name: string, value: any, form: any) => {
    //     form.setFieldValue('totalValue', value);
    //   },
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-500',
    //     input:
    //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    //   },
    // },
    {
      name: 'advancePaid',
      label: 'Advance Paid',
      type: 'text',
      placeholder: 'Enter advance paid',
      // required: true,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('advancePaid', value);
        computeTotals(form);
      },
    },
    {
      name: 'amountPayable',
      label: 'Amount Payable',
      type: 'text',
      placeholder: 'Enter total value',
      required: true,
      disabled: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('amountPayable', value);
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
      type: 'multiSelect',
      placeholder: 'Select Cost Centres',
      required: true,
      disabled: !isValidVendor || toBackend,
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
      type: 'multiSelect',
      placeholder: 'Select Cost Headers',
      required: true,
      disabled: !isValidVendor || toBackend,
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
      name: 'siteNames',
      label: 'Sites',
      type: 'multiSelect',
      placeholder: 'Select Sites',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('siteNames', value);
        form.setFieldValue(
          'siteIds',
          siteDropdown
            .filter((site: any) => value.includes(site.siteName))
            .map((site: any) => site.siteId),
        );
      },
      value: formFields.siteNames || [],
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'invoiceFilePath',
      label: 'Invoice (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      hidden: edit,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'invoiceFilePath', 'invoiceFileType');
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    // {
    //   name: 'poLoiFilePath',
    //   label: 'PO/LOI (PDF, JPG, PNG)',
    //   type: 'file',
    //   placeholder: 'Choose File',
    //   acceptTypes: '.pdf,.jpg,.jpeg,.png',
    //   required: true,
    //   disabled: !isValidVendor || toBackend,
    //   hidden: edit,
    //   onChange: (_name: string, value: any, form: any) => {
    //     handleFileChange(value, form, 'poLoiFilePath', 'poLoiFileType');
    //   },

    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-600',
    //   },
    // },
    {
      name: 'wcrFilePath',
      label: 'Work Completion / Signed Report (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      hidden: edit,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'wcrFilePath', 'wcrFileType');
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    {
      name: 'ticketReportFilePath',
      label: 'Ticket Closure Report (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: false,
      hidden: edit,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(
          value,
          form,
          'ticketReportFilePath',
          'ticketReportFileType',
        );
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    {
      name: 'invoiceNo',
      label: 'Invoice No',
      type: 'text',
      placeholder: 'Enter Invoice Number',
      required: true,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'invoiceDate',
      label: 'Invoice Date',
      type: 'date',
      futureDate: false,
      placeholder: 'Select Invoice Date',
      required: true,
      disabled: !isValidVendor || !isValidPoNumber || toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    {
      name: 'tdsAmount',
      label: 'TDS Amount',
      type: 'number',
      placeholder: 'Enter TDS Amount',
      required: false,
      disabled: true,
      styles: {
        wrapper: 'flex flex-col ',
        label: 'text-sm font-medium text-gray-500',
        input:
          ' h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'hostBooks',
      label: 'Host Book',
      type: 'checkbox',
      disabled:
        (selectedRow?.approverStatusId !== ApproverStatus.Rejected &&
          !isAccounts) ||
        toBackend,
    },
    {
      name: 'gstreflecting',
      label: 'GST Reflecting',
      type: 'checkbox',
      disabled:
        (selectedRow?.approverStatusId !== ApproverStatus.Rejected &&
          !isAccounts) ||
        toBackend,
    },
    {
      name: 'tdsbook',
      label: 'TDS Book',
      type: 'checkbox',
      disabled:
        (selectedRow?.approverStatusId !== ApproverStatus.Rejected &&
          !isAccounts) ||
        toBackend,
    },
    {
      name: 'tbibook',
      label: 'TBI Book',
      type: 'checkbox',
      disabled:
        (selectedRow?.approverStatusId !== ApproverStatus.Rejected &&
          !isAccounts) ||
        toBackend,
    },
    {
      name: 'advanceCode',
      label: 'Advance ID',
      type: 'select',
      placeholder: 'Advance ID',
      required: false,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      disabled:
        !isValidVendor ||
        !isAccounts ||
        (isAccounts &&
          selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
        toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('advanceId', value);
        form.setFieldValue(
          'advancePaid',
          advanceDropdown
            .filter((advance) => value.includes(advance.label))
            .map((advance) => advance.amountApproved)
            .reduce((a, b) => a + b, 0),
        );
        form.setFieldValue(
          'advanceConsumed',
          advanceDropdown
            .filter((advance) => value.includes(advance.label))
            .map((advance) => advance.amountApproved)
            .reduce((a, b) => a + b, 0),
        );
        form.setFieldValue(
          'sourceAdvance',
          advanceDropdown
            .filter((advance) => value.includes(advance.label))
            .map((advance) => advance.amountApproved)
            .reduce((a, b) => a + b, 0),
        );
        const updatedSplit = distributeAdvanceConsumed(form);
        // form.setFieldValue("advanceConsumed", Number(updatedSplit.advanceConsumed.toFixed(2)));
        form.setFieldValue('expenseSplits', updatedSplit.splits);
        computeTotals(form);
      },
    },
    {
      name: 'advanceConsumed',
      label: 'Advance Consumed',
      type: 'text',
      placeholder: 'Enter advance consumed',
      onChange(name, value, form) {
        form.setFieldValue(name, value);
        const updatedSplit = distributeAdvanceConsumed(form);
        // form.setFieldValue("advanceConsumed", Number(updatedSplit.advanceConsumed.toFixed(2)));
        form.setFieldValue('expenseSplits', updatedSplit.splits);
      },
      // required: formFields.advanceId ? true : false,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      disabled:
        !isValidVendor ||
        !isAccounts ||
        (isAccounts &&
          selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
        toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'amountPayable',
      label: 'Total Amount (incl. GST and TDS)',
      type: 'number',
      placeholder: 'Enter total amount (incl. GST and TDS)',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // {
    //     name: 'amountApproved',
    //     label: 'Amount Approved',
    //     type: 'number',
    //     placeholder: 'Enter amount approved',
    //     required: true,
    //     styles: {
    //         wrapper: 'flex flex-col gap-1',
    //         label: 'text-sm font-medium text-gray-500',
    //         input:
    //             'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    //     },
    // },
    {
      name: 'expenseSplits',
      label: 'Expense Split',
      type: 'multiItems',
      // required: true,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ButtonDisabled:
        !isAccounts ||
        (isAccounts &&
          selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
        toBackend,
      itemFields: [
        // {
        //   name: 'splitPercent',
        //   label: 'Split in %',
        //   type: 'number',
        //   placeholder: 'Enter Split %',
        //   // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        //   disabled:
        //     !isAccounts ||
        //     (isAccounts &&
        //       selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
        //     toBackend,
        // },
        {
          name: 'itemDetails',
          label: 'Item Details',
          type: 'select',
          placeholder: 'Select Item',

          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          placeholder: 'Enter Description',
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'quantity',
          label: 'Qty',
          type: 'number',
          placeholder: 'Enter Quantity',
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'unitPrice',
          label: 'Unit Price',
          type: 'currency',
          placeholder: 'Enter Unit Price',
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'totalAmmountNogst',
          label: 'Total Amount(excl. GST)',
          type: 'currency',
          placeholder: 'Enter Amount',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'gstPercentage',
          label: 'GST %',
          type: 'select',
          placeholder: 'Select GST %',
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            !vendorHasGST ||
            toBackend,
        },
        {
          name: 'tdsPercentage',
          label: 'TDS %',
          type: 'select',
          placeholder: 'Enter TDS %',
          disabled:
            !isValidVendor ||
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'costCentreName',
          label: 'Cost Center',
          type: 'select',
          placeholder: 'Select Center',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'costHeaderName',
          label: 'Cost Header',
          type: 'select',
          placeholder: 'Select Header',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },

        // {
        //   name: 'advanceConsumed',
        //   label: 'Advance Consumed',
        //   type: 'currency',
        //   placeholder: 'Enter advance consumed',
        //   disabled:
        //     !isAccounts ||
        //     (isAccounts &&
        //       selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
        //     toBackend,
        // },
        {
          name: 'amountApproved',
          label: 'Amount Approved (excl. GST)',
          type: 'currency',
          placeholder: 'Enter amount approved',
          disabled: disableApprovalFlow || toBackend,
        },
        // {
        //   name: 'gstAmount',
        //   label: 'GST amount ',
        //   type: 'currency',
        //   placeholder: 'GST amount',
        //   disabled: true,
        // },
        // {
        //   name: 'totalAmountWithGst',
        //   label: 'Total Amount (incl. GST)',
        //   type: 'currency',
        //   placeholder: 'Total Amount (incl. GST)',
        //   disabled: true,
        // },
        {
          name: 'remarks',
          label: 'Remarks',
          type: 'text',
          placeholder: 'Enter Remarks',
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
        {
          name: 'toBeInvoiced',
          label: 'TBI',
          type: 'checkbox',
          referValue: 'toBeInvoiced',
          placeholder: 'Yes or No',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled:
            !isAccounts ||
            (isAccounts &&
              selectedRow?.approverStatusId !== ApproverStatus.Pending) ||
            toBackend,
        },
      ],
      onChange(
        _name,
        value,
        form,
        editingField: 'splitPercent' | 'totalAmmountNogst',
      ) {
        const parentTotal = Number(form.state.values.totalAmmountNoGst) || 0;
        const combos = new Set<string>();
        let runningTotal = 0;

        const updatedArray = value.map((item: ExpenseSplit) => {
          const updated = { ...item };
          const key = `${item.costCentreName}::${item.costHeaderName}`;

          // Duplicate CC + CH combination
          // if (item.costCentreName && item.costHeaderName && combos.has(key)) {
          //   toast.error(
          //     'Duplicate combination removed. Please select a different Cost Centre or Cost Header.',
          //   );
          //   updated.costCentreId = 0;
          //   updated.costCentreName = '';
          //   updated.costHeaderId = 0;
          //   updated.costHeaderName = '';
          // } else {
          combos.add(key);
          // }

          const enteredPercent =
            item.splitPercent != null ? Number(item.splitPercent) : null;
          const enteredAmount =
            item.totalAmmountNogst != null
              ? Number(item.totalAmmountNogst)
              : null;

          if (editingField === 'splitPercent' && enteredPercent != null) {
            // User is editing split, calculate amount from split
            updated.totalAmmountNogst = Number(
              ((parentTotal * enteredPercent) / 100).toFixed(2),
            );
          } else if (
            editingField === 'totalAmmountNogst' &&
            enteredAmount != null
          ) {
            // User is editing amount, calculate split from amount
            updated.splitPercent = Number(
              (parentTotal > 0
                ? (enteredAmount / parentTotal) * 100
                : 0
              ).toFixed(2),
            );
          } else if (enteredPercent != null) {
            // fallback: only split is available
            updated.totalAmmountNogst = Number(
              ((parentTotal * enteredPercent) / 100).toFixed(2),
            );
          } else if (enteredAmount != null) {
            // fallback: only amount is available
            updated.splitPercent = Number(
              (parentTotal > 0
                ? (enteredAmount / parentTotal) * 100
                : 0
              ).toFixed(2),
            );
          }

          // Overflow check
          let newRunningTotal =
            runningTotal + Number(updated.totalAmmountNogst || 0);
          if (newRunningTotal > parentTotal) {
            toast.error('Total split amount exceeds parent total amount.');
            updated.totalAmmountNogst = 0;
            updated.splitPercent = 0;
            newRunningTotal = runningTotal;
          }
          runningTotal = newRunningTotal;

          const recalculateGst = (cal: ExpenseSplit) => {
            const total = Number(cal.amountApproved || 0);
            const gstPercent = Number(cal.gstPercentage || 0);

            const gstAmount = Number(((total * gstPercent) / 100).toFixed(2));
            const totalWithGst = Number((total + gstAmount).toFixed(2));

            return {
              ...cal,
              gstAmount,
              totalAmountWithGst: totalWithGst,
            };
          };

          const recalculateAdvance = (cal: ExpenseSplit) => {
            const quantity = Number(cal.quantity || 0);
            const unitPrice = Number(cal.unitPrice || 0);

            const totalofexpense = Number((quantity * unitPrice).toFixed(2));

            return {
              ...cal,
              totalAmmountNogst: totalofexpense,
            };
          };

          // GST calculation
          // if (updated.gstPercentage && updated.gstPercentage > 0) {
          //   const total = Number(updated.amountApproved || 0);
          //   const gst = Number(updated.gstPercentage);
          //   updated.gstAmount = Number(((total * gst) / 100).toFixed(2));
          //   updated.totalAmountWithGst = Number(
          //     (total + updated.gstAmount).toFixed(2),
          //   );
          // }

          if (updated.amountApproved || updated.gstPercentage) {
            Object.assign(updated, recalculateGst(updated));
          }

          if (updated.quantity || updated.unitPrice) {
            Object.assign(updated, recalculateAdvance(updated));
          }

          return updated;
        });
        const finalUpdated = distributeAdvanceConsumed(form, updatedArray);
        // form.setFieldValue("advanceConsumed", Number(finalUpdated.advanceConsumed.toFixed(2)));
        form.setFieldValue('expenseSplits', finalUpdated.splits);
      },
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
        approverDetails?.costHeaderIds?.includes(item.costHeaderId),
      )
      .map((item: any) => item.costHeaderName),

    costCentreNames: costCentersDropdown
      .filter((item: any) =>
        approverDetails?.costCentreIds?.includes(item.costCentreId),
      )
      .map((item: any) => item.costCentreName),

    costHeaderName: costHeadersDropdown
      .filter((item: any) =>
        isAccounts || session.roleName.toLocaleLowerCase().includes('admin')
          ? true
          : approverDetails?.costHeaderIds?.includes(item.costHeaderId),
      )
      .map((item: any) => item.costHeaderName),

    costCentreName: costCentersDropdown
      .filter((item: any) =>
        isAccounts || session.roleName.toLocaleLowerCase().includes('admin')
          ? true
          : approverDetails?.costCentreIds?.includes(item.costCentreId),
      )
      .map((item: any) => item.costCentreName),

    siteNames: siteDropdown.map((item: any) => item.siteName),
    vendorName: vendorDropdown.map((item: any) => item.vendorName),
    categoryName: categoryDropdown
      .filter(
        (item: any) =>
          item.categoryName?.toLowerCase().includes('product') ||
          item.categoryName?.toLowerCase().includes('service'),
      )
      .map((item: any) => item.categoryName),
    gstPercentage: ['0', 2.5, 5, 12, 18, 40],
    tdsPercentage: ['0', 0.1, 1, 2, 5, 10, 12.5, 20, 30, 35, 40],
    toBeInvoiced: ['No', 'Yes'],
    hostBooks: ['No', 'Yes'],
    advanceCode: advanceDropdown.map((item: VendorAdvance) => item.label),
    itemDetails: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    poNumber: poDropdown.map((item: any) => item.poNumber),
    //  ||
    // ['PO_001', 'PO_002', 'PO_003'],
  };

  const handleOpen = () => {
    setFormFields(defaultValues);
    setEdit(false);
    setIsOpen(true);
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

  const handleFileChange = (
    value: any,
    form: any,
    filePathKey: string,
    fileTypeKey: string,
  ) => {
    const file = value?.[0]?.file;
    if (!file) return;

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext || '')) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    form.setFieldValue(filePathKey, file.name);
    form.setFieldValue(fileTypeKey, ext);
  };
  // console.log(formFields, edit, 'rowTest');

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
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

      // console.log(row, 'final payload for update');
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

  const formStyles = {
    pageName: 'Expenses',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[70%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const createExpenseMutation = useMutation({
    mutationKey: [ExpenseQueries.CREATE_EXPENSE],
    mutationFn: async (data: any) => {
      setToBackend(true);
      return await ExpenseServices.createExpense(data);
    },
    onSuccess: async (data) => {
      toast.success('Expense added successfully');
      setToBackend(false);
      // const response = await ExpenseServices.fetchExpensesByOrgId(
      //   data.organizationId,
      // );
      // setTableValue(response);
      // invalidateQuery(ExpenseQueries.GET_EXPENSE_BY_ORG_ID);
      invalidateQuery(ExpenseQueries.GET_LOGS_BY_ID);
      handleClose();
      window.location.reload();
    },
    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to add expense`);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationKey: [ExpenseQueries.UPDATE_EXPENSE],
    mutationFn: async (data: ExpenseUpdateDTOType) => {
      setToBackend(true);
      const response = await ExpenseServices.updateExpense(
        data.expenseId as number,
        data,
      );
      // setIsLogOpen(false);
      return response;
    },
    onSuccess: async (_response, variables) => {
      if (!edit) {
        const { expenseId: id } = variables;
        const expenseData = await ExpenseServices.fetchExpenseById(id!);
        handleLogPopup(expenseData);
      } else {
        handleClose();
        setEdit(false);
        toast.success('Expense updated successfully');
      }
      if (!search.expenseId) {
        invalidateQuery(ExpenseQueries.GET_EXPENSE);
      }
      invalidateQuery(ExpenseQueries.GET_LOGS_BY_ID);
      setToBackend(false);
    },
    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to update expense`);
    },
  });

  const expenseApproveMutation = useMutation({
    mutationKey: [ExpenseQueries.APPROVE_EXPENSE],
    mutationFn: async (data: any) => {
      setToApprovalBackend(true);
      return await ExpenseServices.approveExpense(data);
    },
    onSuccess: () => {
      setToApprovalBackend(false);
      if (search.expenseId) {
        invalidateQuery(ConsolidatedDashboardQuery.GET_CONSOLIDATED_DASHBOARD);
      } else {
        invalidateQuery(ExpenseQueries.GET_EXPENSE);
      }
      handleCloseAll();
      handleApprovalModalClose();
    },
    onError: (error: any) => {
      console.error(error);
      setToApprovalBackend(false);
      toast.error(
        `Failed to approve expense ${error.response.data || error.message}`,
      );
    },
  });

  const expenseRejectMutation = useMutation({
    mutationKey: [ExpenseQueries.REJECT_EXPENSE],
    mutationFn: async (data: any) => {
      setToRejectionBackend(true);
      return await ExpenseServices.rejectExpense(data);
    },
    onSuccess: () => {
      setToRejectionBackend(false);
      invalidateQuery(ExpenseQueries.GET_EXPENSE);
      handleCloseAll();
    },
    onError: (error: any) => {
      console.error(error);
      setToRejectionBackend(false);
      toast.error(`Failed to reject expense`);
    },
  });

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
          .map(([key, value]) => [key, deepClean(value)])
          .filter(
            ([_, value]) =>
              value !== null &&
              value !== undefined &&
              value !== '' &&
              value !== 0 &&
              !(Array.isArray(value) && value.length === 0) &&
              !(typeof value === 'object' && Object.keys(value).length === 0),
          ),
      );
      return cleanedObj;
    }

    return obj;
  }
  const validateAdvanceAmount = (data: ExpenseDTOType) => {
    const total = Number(data.totalAmmountNoGst || 0);
    const advance = Number(data.advancePaid || 0);

    if (advance > total) {
      toast.error('Advance Paid cannot be greater than Total Amount');
      return false;
    }

    return true;
  };

  async function onSubmit(data: ExpenseDTOType) {
    if (!validateAdvanceAmount(data)) return;
    if (
      !isValidFile(data.invoiceFilePath) ||
      !isValidFile(data.poLoiFilePath) ||
      !isValidFile(data.wcrFilePath) ||
      !isValidFile(data.ticketReportFilePath)
    ) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }
    const vendor = vendorDropdown.find(
      (v) =>
        v.emailId === data.vendorName ||
        v.vendorName === data.vendorName ||
        v.vendorCode === data.vendorName,
    );

    if (!vendor) {
      toast.error('Vendor not found or unverified');
      return;
    }
    const payload: ExpenseDTOType = {
      ...data,
      vendorId: vendor.vendorId,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      invoiceDate: format(data.invoiceDate, "yyyy-MM-dd'T'HH:mm:ss"),
      hostBooks: data.hostBooks === 'Yes' ? 'true' : 'false',
      description: data.description,
      companyId: session.companyId,
      customerId: session.customerId,
      organizationId: Number(sessionStorage.getItem('organizationId')) || 1,
      // poDocUrl: poDocUrl,
      poLoiFileType: poDocUrl
        ? poDocUrl.split('.').pop()?.toLowerCase()
        : data.poLoiFileType
          ? data.poLoiFileType
          : undefined,
      poLoiFilePath: poDocUrl
        ? poDocUrl
        : data.poLoiFilePath
          ? data.poLoiFilePath
          : undefined,
    };

    delete payload.expenseSplits;
    delete payload.remarks;

    const filteredPayload = deepClean(payload);
    console.log({
      invoice: data.invoiceFilePath,
      po: data.poLoiFilePath,
      wcr: data.wcrFilePath,
      ticket: data.ticketReportFilePath,
    });

    console.log(filteredPayload, data, 'filteredPayload and data');
    await createExpenseMutation.mutateAsync(filteredPayload);
  }

  async function onEditUpdate(data: ExpenseUpdateDTOType) {
    if (!validateAdvanceAmount(data)) return;
    const payload = {
      ...data,
      lastUpdatedBy: session.userId,
      vendorName: data.selectedVendorName,
      expenseId: data.expenseId,
      poNumber: data.poNumber,
      categoryId: categoryDropdown.find(
        (c) => c.categoryName === data.categoryName,
      )?.categoryId,
      invoiceNo: data.invoiceNo,
      totalAmmountNoGst: data.totalAmmountNoGst,
      gstPercentage: data.gstPercentage,
      invoiceDate: data.invoiceDate
        ? format(data.invoiceDate, "yyyy-MM-dd'T'HH:mm:ss")
        : null,
      advancePaid: data.advancePaid,
      expenseSplits: data.expenseSplits?.map((split) => ({
        ...split,
        toBeInvoiced: split.toBeInvoiced === 'Yes',
      })),
    };
    console.log(payload, 'payload before cleaning');
    await updateExpenseMutation.mutateAsync(payload);

    // console.log(payload, 'final payload for update');
  }

  async function onUpdate(data: ExpenseUpdateDTOType) {
    console.log(data, 'update data');
    // if (
    //   !isValidFile(data.invoiceFilePath) ||
    //   !isValidFile(data.poLoiFilePath) ||
    //   !isValidFile(data.wcrFilePath) ||
    //   !isValidFile(data.ticketReportFilePath)
    // ) {
    //   toast.error('Only PDF, JPG, and PNG files are allowed');
    //   return;
    // }

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

    // if (!data.advanceId) {
    //   data.advancePaid = 0;
    // }

    const payload: ExpenseUpdateDTOType = {
      ...data,
      vendorId: vendor.vendorId,

      costCentreNames:
        data.expenseSplits
          ?.map(
            (e) =>
              costCentersDropdown.find(
                (c) => c.costCentreName === e.costCentreName,
              )?.costCentreName,
          )
          .filter((name): name is string => name !== undefined) ?? [],

      costCentreIds:
        data.expenseSplits
          ?.map(
            (e) =>
              costCentersDropdown.find(
                (c) => c.costCentreName === e.costCentreName,
              )?.costCentreId,
          )
          .filter((id): id is number => id !== undefined) ?? [],

      costHeaderNames:
        data.expenseSplits
          ?.map(
            (e) =>
              costHeadersDropdown.find(
                (c) => c.costHeaderName === e.costHeaderName,
              )?.costHeaderName,
          )
          .filter((name): name is string => name !== undefined) ?? [],

      costHeaderIds:
        data.expenseSplits
          ?.map(
            (e) =>
              costHeadersDropdown.find(
                (c) => c.costHeaderName === e.costHeaderName,
              )?.costHeaderId,
          )
          .filter((id): id is number => id !== undefined) ?? [],

      lastUpdatedBy: session.userId,

      advanceId: advanceDropdown.find(
        (a: VendorAdvance) => a.label === data.advanceCode,
      )?.vendorAdvanceId,

      invoiceDate: format(data.invoiceDate!, "yyyy-MM-dd'T'HH:mm:ss"),
      gstStatus:
        data.gstStatus === 'Registered' || data.gstStatus == '1' ? '1' : '0',
      amountApproved:
        data.expenseSplits?.reduce(
          (acc, item) => acc + (Number(item.amountApproved) || 0),
          0,
        ) || 0,
      // gstPercentage: data.expenseSplits?.[0]?.gstPercentage || 0,
    };
    console.log(payload, 'payload before cleaning');
    if (payload.expenseSplits && payload.expenseSplits.length > 0) {
      // Enrich split items
      payload.expenseSplits = payload.expenseSplits.map(
        (item: ExpenseSplit) => {
          // Cost Centre
          const cc = costCentersDropdown.find(
            (e: costCentreDropdownTypes) =>
              item.costCentreName && e.costCentreName === item.costCentreName,
          );
          item.costCentreId = cc ? cc.costCentreId : null;

          // Cost Header
          const ch = costHeadersDropdown.find(
            (e: costHeaderDropdownTypes) =>
              item.costHeaderName && e.costHeaderName === item.costHeaderName,
          );
          item.costHeaderId = ch ? ch.costHeaderId : null;

          item.lastUpdatedBy = session.userId;
          item.approverStatusId =
            item.approverStatusId && !isNaN(item.approverStatusId)
              ? item.approverStatusId
              : 1;

          item.toBeInvoiced = item.toBeInvoiced === 'Yes' ? 'true' : 'false';

          // Partial approval logic at split level
          const totalNoGst = Number(item.totalAmmountNogst || 0);
          const approved = Number(item.amountApproved || 0);

          if (approved > 0 && approved < totalNoGst) {
            item.approverStatusId =
              statusDropdown.find(
                (s) =>
                  s.approveStatusName.toLocaleLowerCase() ===
                  'partiallyapproved',
              )?.approverStatusId || 8;
          } else {
            item.approverStatusId =
              statusDropdown.find(
                (s) => s.approveStatusName.toLocaleLowerCase() === 'approved',
              )?.approverStatusId || 3;
          }

          return item;
        },
      );

      // Remove invalid splits
      // payload.expenseSplits = payload.expenseSplits.filter(
      //   (item) =>
      //     !(
      //       (item.costCentreId === null && item.costHeaderId === null) ||
      //       item.totalAmmountNogst === 0
      //     ),
      // );
    }

    const filteredPayload: ExpenseDTOType = deepClean(payload);

    // Ensure mandatory cost centres & headers exist

    const parentTotal = Number(filteredPayload.totalAmmountNoGst) || 0;

    const splitSum =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.totalAmmountNogst) || 0),
        0,
      ) || 0;
    0;
    // console.log(
    //   'parentTotal:',
    //   Number(splitSum.toFixed(2)) !== Number(parentTotal.toFixed(2)),
    // );

    // --------------------------------------------
    // RULE #1 — Splits cannot exceed parent amount
    // --------------------------------------------
    // console.log('Split Sum:', splitSum, 'Parent Total:', parentTotal);

    if (Number(splitSum.toFixed(2)) !== Number(parentTotal.toFixed(2))) {
      toast.error(
        `Split amounts (₹${splitSum}) must be equal to parent amount (₹${parentTotal}).`,
      );
      return; // STOP update
    }

    if (
      filteredPayload.expenseSplits?.some(
        (item) => !item.costCentreId || !item.costHeaderId,
      )
    ) {
      toast.error(
        'Please select cost centre and cost header for all split items.',
      );
      return;
    }

    if (filteredPayload.expenseSplits?.some((item) => !item.amountApproved)) {
      toast.error(
        'Please enter amount approved (excl GST) for all split items.',
      );
      return;
    }
    // --------------------------------------------
    // RULE #2 — CC + CH count must match or be ≤ splits
    // --------------------------------------------
    const numberOfSplits = filteredPayload.expenseSplits?.length || 0;

    if (
      filteredPayload.costCentreIds.length > numberOfSplits ||
      filteredPayload.costHeaderIds.length > numberOfSplits
    ) {
      toast.error(
        'Cost centre and header ID combinations must match or be less than number of split items.',
      );
      return; // STOP update
    }

    // ---------------------------------------------------------
    // RULE #3 — Sum of split advanceConsumed cannot exceed sum of approved amounts
    // ---------------------------------------------------------
    const totalApprovedFromSplits =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.amountApproved) || 0),
        0,
      ) || 0;

    const totalAdvanceFromSplits =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.advanceConsumed) || 0),
        0,
      ) || 0;

    if (
      Number(totalAdvanceFromSplits.toFixed(2)) >
        Number(totalApprovedFromSplits.toFixed(2)) &&
      totalApprovedFromSplits > 0
    ) {
      toast.error(
        `Sum of advance consumed (${INTL_UTILS.formatCurrency({ value: totalAdvanceFromSplits })}) cannot exceed total approved (${INTL_UTILS.formatCurrency({ value: totalApprovedFromSplits })}).`,
      );
      return; // STOP update
    }

    // If split < parent → mark as Partially Approved
    if (Number(splitSum) < parentTotal) {
      payload.approverStatusId =
        statusDropdown.find(
          (s) =>
            s.approveStatusName.toLocaleLowerCase() === 'partiallyapproved',
        )?.approverStatusId || 8;

      payload.expenseSplits = payload.expenseSplits?.map(
        (item: ExpenseSplit) => {
          item.approverStatusId = payload.approverStatusId || 8;
          return item;
        },
      );
    } else {
      payload.approverStatusId =
        statusDropdown.find(
          (s) => s.approveStatusName.toLocaleLowerCase() === 'approved',
        )?.approverStatusId || 3;

      payload.expenseSplits = payload.expenseSplits?.map(
        (item: ExpenseSplit) => {
          item.approverStatusId = payload.approverStatusId || 3;
          return item;
        },
      );
    }

    filteredPayload.costCentreIds = [...new Set(filteredPayload.costCentreIds)];
    filteredPayload.costCentreNames = [
      ...new Set(filteredPayload.costCentreNames),
    ];
    filteredPayload.costHeaderIds = [...new Set(filteredPayload.costHeaderIds)];
    filteredPayload.costHeaderNames = [
      ...new Set(filteredPayload.costHeaderNames),
    ];

    const advanceAvailable = advanceDropdown.find(
      (a) => a.vendorAdvanceId === filteredPayload.advanceId,
    );
    const advanceConsumed =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + Number(item.advanceConsumed || 0),
        0,
      ) || 0;

    if (
      filteredPayload.advanceConsumed &&
      filteredPayload.advanceConsumed > 0 &&
      advanceAvailable &&
      Number(filteredPayload.amountPayable) > 0 &&
      advanceAvailable.totalAmount > 0 &&
      advanceAvailable.totalAmount > 0
    ) {
      // console.log({
      //     advanceAvailable: advanceAvailable.amountApproved,
      //     advanceConsumed: filteredPayload.advanceConsumed,
      //     amountPayable: filteredPayload.amountPayable,
      //     splitAdvanceConsumed: advanceConsumed
      // });

      if (advanceAvailable.totalAmount < filteredPayload.advanceConsumed) {
        toast.error(
          'Advance consumed should be less than or equal to advance approved',
        );
        return;
      }

      if (
        filteredPayload.advanceConsumed > Number(advanceAvailable.totalAmount)
      ) {
        toast.error(
          'Advance consumed should be less than or equal to advance approved',
        );
        return;
      }
    }

    const calculateValues = calculateAmounts(filteredPayload);
    // console.log(filteredPayload, calculateValues, 'final payload for update');

    const sumOfApprovedSplits =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.amountApproved) || 0),
        0,
      ) || 0;

    filteredPayload.finalAmount = calculateValues.finalAmount;
    filteredPayload.totalValue =
      calculateValues.sourceAmount + calculateValues.separteGSTAmountSum;
    filteredPayload.tdsAmount = calculateValues.tdsAmount;
    filteredPayload.amountPayable = calculateValues.amountPayable;
    filteredPayload.amountApproved = sumOfApprovedSplits;
    filteredPayload.hostBooks =
      filteredPayload.hostBooks === 'Yes' ? 'true' : 'false';

    if (filteredPayload.totalAmmountNoGst < filteredPayload.amountApproved) {
      toast.error(
        'Amount approved cannot be greater than total amount excluding GST',
      );
      return;
    }
    if (
      filteredPayload.advanceConsumed &&
      filteredPayload.advanceConsumed > 0 &&
      advanceAvailable &&
      filteredPayload.amountPayable > 0 &&
      advanceAvailable.amountApproved > 0 &&
      advanceAvailable.amountApproved > 0
    ) {
      // console.log({
      //     advanceAvailable: advanceAvailable.amountApproved,
      //     advanceConsumed: filteredPayload.advanceConsumed,
      //     amountPayable: filteredPayload.amountPayable,
      //     splitAdvanceConsumed: advanceConsumed
      // });

      if (
        filteredPayload.amountApproved > 0 &&
        filteredPayload.advanceConsumed > Number(filteredPayload.amountApproved)
      ) {
        toast.error(
          'Advance consumed should be less than or equal to amount approved',
        );
        return;
      }

      if (filteredPayload.advanceConsumed > advanceConsumed) {
        toast.error(
          'sum of advance consumed should be less than or equal to parent advance consumed',
        );
        return;
      }
    }

    console.log(filteredPayload, 'filteredPayload');
    // console.log(data, 'testForPayload');

    // Update
    await updateExpenseMutation.mutateAsync(filteredPayload);
  }

  function handleApprovalModalClose() {
    setIsApprovalModalOpen(false);
    setApprovalModalFields([]);
  }

  function generateApprovalDTO(
    input: ExpenseDTOType,
    sessionData: Session,
    remarks: string,
  ): ExpenseApprovalType {
    return {
      expenseId: input.expenseId!,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      amountApproved: input.amountApproved ?? 0,
      advanceConsumed: input.advanceConsumed!,
      approvedSplitExpenditureDTO: input.expenseSplits?.map((split) => ({
        expenseSplitId: split.expenseSplitId!,
        amountApproved: split.amountApproved ?? 0,
        approverStatusId: split.approverStatusId!,
      })),
      approvedBy: sessionData.userId,
      remarks: remarks,
      isAccounts: isAccounts,
    };
  }

  const handleApproval = async (Approvedata: ExpenseDTOType) => {
    const data = formFields;

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

    const Updatepayload: ExpenseUpdateDTOType = {
      ...data,
      vendorId: vendor.vendorId,

      costCentreNames:
        data.expenseSplits
          ?.map(
            (e) =>
              costCentersDropdown.find(
                (c) => c.costCentreName === e.costCentreName,
              )?.costCentreName,
          )
          .filter((name): name is string => name !== undefined) ?? [],

      costCentreIds:
        data.expenseSplits
          ?.map(
            (e) =>
              costCentersDropdown.find(
                (c) => c.costCentreName === e.costCentreName,
              )?.costCentreId,
          )
          .filter((id): id is number => id !== undefined) ?? [],

      costHeaderNames:
        data.expenseSplits
          ?.map(
            (e) =>
              costHeadersDropdown.find(
                (c) => c.costHeaderName === e.costHeaderName,
              )?.costHeaderName,
          )
          .filter((name): name is string => name !== undefined) ?? [],

      costHeaderIds:
        data.expenseSplits
          ?.map(
            (e) =>
              costHeadersDropdown.find(
                (c) => c.costHeaderName === e.costHeaderName,
              )?.costHeaderId,
          )
          .filter((id): id is number => id !== undefined) ?? [],

      lastUpdatedBy: session.userId,

      advanceId: advanceDropdown.find(
        (a: VendorAdvance) => a.label === data.advanceCode,
      )?.vendorAdvanceId,

      invoiceDate: format(data.invoiceDate, "yyyy-MM-dd'T'HH:mm:ss"),
    };

    if (Updatepayload.expenseSplits && Updatepayload.expenseSplits.length > 0) {
      // Enrich split items
      Updatepayload.expenseSplits = Updatepayload.expenseSplits.map(
        (item: ExpenseSplit) => {
          // Cost Centre
          const cc = costCentersDropdown.find(
            (e: costCentreDropdownTypes) =>
              item.costCentreName && e.costCentreName === item.costCentreName,
          );
          item.costCentreId = cc ? cc.costCentreId : null;

          // Cost Header
          const ch = costHeadersDropdown.find(
            (e: costHeaderDropdownTypes) =>
              item.costHeaderName && e.costHeaderName === item.costHeaderName,
          );
          item.costHeaderId = ch ? ch.costHeaderId : null;

          item.lastUpdatedBy = session.userId;
          item.approverStatusId =
            item.approverStatusId && !isNaN(item.approverStatusId)
              ? item.approverStatusId
              : 1;

          item.toBeInvoiced = item.toBeInvoiced === 'Yes' ? 'true' : 'false';

          // Partial approval logic at split level
          const totalNoGst = Number(item.totalAmmountNogst || 0);
          const approved = Number(item.amountApproved || 0);

          if (approved > 0 && approved < totalNoGst) {
            item.approverStatusId =
              statusDropdown.find(
                (s) =>
                  s.approveStatusName.toLocaleLowerCase() ===
                  'partiallyapproved',
              )?.approverStatusId || 8;
          } else {
            item.approverStatusId =
              statusDropdown.find(
                (s) => s.approveStatusName.toLocaleLowerCase() === 'approved',
              )?.approverStatusId || 3;
          }

          return item;
        },
      );

      // Remove invalid splits
      Updatepayload.expenseSplits = Updatepayload.expenseSplits.filter(
        (item) =>
          !(
            (item.costCentreId === null && item.costHeaderId === null) ||
            item.totalAmmountNogst === 0
          ),
      );
    }

    const filteredPayload: ExpenseDTOType = deepClean(Updatepayload);

    // Ensure mandatory cost centres & headers exist
    if (
      !filteredPayload.costCentreIds?.length ||
      !filteredPayload.costHeaderIds?.length
    ) {
      toast.error(
        'Please select cost centre and cost header for all split items.',
      );
      return;
    }

    const parentTotal = Number(filteredPayload.totalAmmountNoGst) || 0;

    const splitSum =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.totalAmmountNogst) || 0),
        0,
      ) || 0;

    // --------------------------------------------
    // RULE #1 — Splits cannot exceed parent amount
    // --------------------------------------------
    if (Number(splitSum.toFixed(2)) > Number(parentTotal.toFixed(2))) {
      toast.error(
        `Split amounts (₹${splitSum}) must be less than parent amount (₹${parentTotal}).`,
      );
      return; // STOP update
    }

    // --------------------------------------------
    // RULE #2 — CC + CH count must match or be ≤ splits
    // --------------------------------------------
    const numberOfSplits = filteredPayload.expenseSplits?.length || 0;

    if (
      filteredPayload.costCentreIds.length > numberOfSplits ||
      filteredPayload.costHeaderIds.length > numberOfSplits
    ) {
      toast.error(
        'Cost centre and header ID combinations must match or be less than number of split items.',
      );
      return; // STOP update
    }

    // ---------------------------------------------------------
    // RULE #3 — Sum of split advanceConsumed cannot exceed sum of approved amounts
    // ---------------------------------------------------------
    const totalApprovedFromSplits =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.amountApproved) || 0),
        0,
      ) || 0;

    const totalAdvanceFromSplits =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.advanceConsumed) || 0),
        0,
      ) || 0;

    if (
      Number(totalAdvanceFromSplits.toFixed(2)) >
      Number(totalApprovedFromSplits.toFixed(2))
    ) {
      toast.error(
        `Sum of advance consumed (${INTL_UTILS.formatCurrency({ value: totalAdvanceFromSplits })}) cannot exceed total approved (${INTL_UTILS.formatCurrency({ value: totalApprovedFromSplits })}).`,
      );
      return; // STOP update
    }

    // If split < parent → mark as Partially Approved
    if (Number(splitSum) < parentTotal) {
      Updatepayload.approverStatusId =
        statusDropdown.find(
          (s) =>
            s.approveStatusName.toLocaleLowerCase() === 'partiallyapproved',
        )?.approverStatusId || 8;

      Updatepayload.expenseSplits = Updatepayload.expenseSplits?.map(
        (item: ExpenseSplit) => {
          item.approverStatusId = Updatepayload.approverStatusId || 8;
          return item;
        },
      );
    } else {
      Updatepayload.approverStatusId =
        statusDropdown.find(
          (s) => s.approveStatusName.toLocaleLowerCase() === 'approved',
        )?.approverStatusId || 3;

      Updatepayload.expenseSplits = Updatepayload.expenseSplits?.map(
        (item: ExpenseSplit) => {
          item.approverStatusId = Updatepayload.approverStatusId || 3;
          return item;
        },
      );
    }

    filteredPayload.costCentreIds = [...new Set(filteredPayload.costCentreIds)];
    filteredPayload.costCentreNames = [
      ...new Set(filteredPayload.costCentreNames),
    ];
    filteredPayload.costHeaderIds = [...new Set(filteredPayload.costHeaderIds)];
    filteredPayload.costHeaderNames = [
      ...new Set(filteredPayload.costHeaderNames),
    ];

    const advanceAvailable = advanceDropdown.find(
      (a) => a.vendorAdvanceId === filteredPayload.advanceId,
    );
    const advanceConsumed =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + Number(item.advanceConsumed || 0),
        0,
      ) || 0;

    if (
      filteredPayload.advanceConsumed &&
      filteredPayload.advanceConsumed > 0 &&
      advanceAvailable &&
      Number(filteredPayload.amountPayable) > 0 &&
      advanceAvailable.totalAmount > 0 &&
      advanceAvailable.totalAmount > 0
    ) {
      // console.log({
      //     advanceAvailable: advanceAvailable.amountApproved,
      //     advanceConsumed: filteredPayload.advanceConsumed,
      //     amountPayable: filteredPayload.amountPayable,
      //     splitAdvanceConsumed: advanceConsumed
      // });

      if (advanceAvailable.totalAmount < filteredPayload.advanceConsumed) {
        toast.error(
          'Advance consumed should be less than or equal to advance approved',
        );
        return;
      }

      if (
        filteredPayload.advanceConsumed > Number(advanceAvailable.totalAmount)
      ) {
        toast.error(
          'Advance consumed should be less than or equal to advance approved',
        );
        return;
      }
    }

    const calculateValues = calculateAmounts(filteredPayload);
    const sumOfApprovedSplits =
      filteredPayload.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.amountApproved) || 0),
        0,
      ) || 0;

    filteredPayload.finalAmount = calculateValues.finalAmount;
    filteredPayload.totalValue =
      calculateValues.sourceAmount + calculateValues.separteGSTAmountSum;
    filteredPayload.tdsAmount = calculateValues.tdsAmount;
    filteredPayload.amountPayable = calculateValues.amountPayable;
    filteredPayload.amountApproved = sumOfApprovedSplits;
    // console.log(filteredPayload, 'testForPayload');

    if (
      filteredPayload.advanceConsumed &&
      filteredPayload.advanceConsumed > 0 &&
      advanceAvailable &&
      filteredPayload.amountPayable > 0 &&
      advanceAvailable.amountApproved > 0 &&
      advanceAvailable.amountApproved > 0
    ) {
      // console.log({
      //     advanceAvailable: advanceAvailable.amountApproved,
      //     advanceConsumed: filteredPayload.advanceConsumed,
      //     amountPayable: filteredPayload.amountPayable,
      //     splitAdvanceConsumed: advanceConsumed
      // });

      if (
        filteredPayload.advanceConsumed > Number(filteredPayload.amountApproved)
      ) {
        toast.error(
          'Advance consumed should be less than or equal to amount approved',
        );
        return;
      }

      if (filteredPayload.advanceConsumed > advanceConsumed) {
        toast.error(
          'sum of advance consumed should be less than or equal to parent advance consumed',
        );
        return;
      }
    }

    let remarkToSend = Approvedata.remarks;

    if (!remarkToSend || remarkToSend.trim() === '') {
      remarkToSend = selectedRow?.remarks || 'Accounts Verified';
    }

    const payload = generateApprovalDTO(filteredPayload, session, remarkToSend);
    // console.log(payload);

    const partiallyApproved = payload.approvedSplitExpenditureDTO?.some(
      (split) => split.approverStatusId === 8,
    );
    if (
      partiallyApproved &&
      (payload.remarks === '' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        payload.remarks === null ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        payload.remarks === undefined)
    ) {
      toast.error('Please add Description for partially approved splits');
      return;
    }

    const NoApproveAmount = payload.approvedSplitExpenditureDTO?.some(
      (split) => split.amountApproved === 0,
    );
    if (
      NoApproveAmount &&
      (payload.remarks === '' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        payload.remarks === null ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        payload.remarks === undefined)
    ) {
      toast.error('Please add Description and zero amount approved for splits');
      return;
    }

    filteredPayload.hostBooks =
      filteredPayload.hostBooks === 'Yes' ? 'true' : 'false';
    try {
      await updateExpenseMutation.mutateAsync(filteredPayload);
      // await ExpenseServices.updateExpense(
      //   filteredPayload.expenseId as number,
      //   filteredPayload,
      // );
      console.log('payload0000', payload);
      expenseApproveMutation.mutate(payload);
      // if (search.expenseId) {
      //   window.location.reload();
      // }
      // handleApprovalModalClose();
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to APPROVE expense', e.message);
    } finally {
      search.expenseId &&
        navigate({
          to: '/po/consolidatedDashboard',
          replace: true,
        });
    }
  };

  const handleReject = (data: ExpenseDTOType) => {
    if (!selectedRow) return;
    const payload: ExpenseRejectionType = {
      expenseId: selectedRow.expenseId!,
      rejectedBy: session.userId,
      levelId: +sessionStorage.getItem('levelId')!,
      advanceConsumed: selectedRow.advanceConsumed!,
      remarks: data.remarks,
    };
    expenseRejectMutation.mutate(payload);
    handleApprovalModalClose();
  };

  const handleApprovalModal = async (approveStatus: boolean) => {
    if (
      formFields.costCentreNames &&
      formFields.costCentreNames.length === 0 &&
      formFields.costHeaderNames &&
      formFields.costHeaderNames.length === 0
    ) {
      toast.error('Please add at least one cost centre or cost header');
      return;
    }

    const expensePop: ExpenseDTOType = useFormPageStore
      .getState()
      .getPage('expense_pop');

    const approvedSplits = (
      expensePop.expenseSplits as Array<ExpenseSplit>
    ).filter(
      (s) =>
        s.amountApproved != null &&
        `${s.amountApproved}` !== '' &&
        s.amountApproved > 0,
    );

    const sumOfApprovedSplits = approvedSplits.reduce(
      (acc, item) => acc + (Number(item.amountApproved) || 0),
      0,
    );
    if (
      (approvedSplits.length === 0 || sumOfApprovedSplits === 0) &&
      !isAccounts
    ) {
      toast.error('Please add at least one approved amount');
      return;
    }

    const finalRow = distributeAdvanceConsumedForExpense(expensePop);

    const calculateValues = calculateAmounts(finalRow);

    const sumOfSplitAmountNogst =
      finalRow.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.totalAmmountNogst) || 0),
        0,
      ) ?? 0;

    finalRow.finalAmount = calculateValues.finalAmount;
    finalRow.totalValue = calculateValues.separteGSTAmountSum;
    finalRow.tdsAmount = calculateValues.tdsAmount;
    finalRow.amountPayable = calculateValues.amountPayable;
    finalRow.amountApproved = sumOfApprovedSplits;

    if (finalRow.amountApproved > sumOfSplitAmountNogst) {
      toast.error(
        'Approved amount should be less than or equal to total payable amount',
      );
      return;
    }

    const parentTotal = Number(finalRow.totalAmmountNoGst) || 0;

    const splitSum =
      finalRow.expenseSplits?.reduce(
        (acc, item) => acc + (Number(item.totalAmmountNogst) || 0),
        0,
      ) || 0;

    // If split < parent → mark as Partially Approved
    if (Number(splitSum) < parentTotal) {
      finalRow.approverStatusId =
        statusDropdown.find((s) => s.approveStatusName === 'PartiallyApproved')
          ?.approverStatusId || 8;

      finalRow.expenseSplits = finalRow.expenseSplits?.map(
        (item: ExpenseSplit) => {
          item.approverStatusId = finalRow.approverStatusId || 8;
          return item;
        },
      );
    }

    if (sessionStorage.getItem('levelId') === '0' && approveStatus) {
      const payload = generateApprovalDTO(
        finalRow,
        session,
        'Accounts Verified',
      );
      payload.isAccounts = false;
      console.log(payload, 'payload0');
      await expenseApproveMutation.mutate(payload);
      return;
    }

    setSelectedRow(finalRow);
    setFormFields(finalRow);

    setIsApproved(approveStatus);
    setIsApprovalModalOpen(true);

    if (approveStatus) {
      setApprovalModalFields([
        {
          name: 'amountApproved',
          label: 'Amount Approved (excl. GST)',
          type: 'number',
          defaultValue: `${sumOfApprovedSplits}`,
          onChange: (_name: string, value: any, form: any) => {
            form.setFieldValue('amountApproved', value);
          },
          // disabled: sessionStorage.getItem('levelId') === '0',
          disabled: true,
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
        {
          name: 'remarks',
          label: 'Description',
          type: 'text',
          // required: true,
          disabled: sessionStorage.getItem('levelId') === '0' || toBackend,
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

  const clickableColumnList = 'expenseReqCode';
  const handleLogPopup = async (row: Row | Promise<Row>) => {
    const encryptedUrl = Encrypt({
      string: JSON.stringify({
        expenseReqCode: row.expenseReqCode,
        expenseId: row.expenseId,
      }),
      key: import.meta.env.VITE_AES_SECRET_KEY,
      iv: import.meta.env.VITE_AES_IV,
    });
    const encodedKey = encodeURIComponent(encryptedUrl);

    const baseUrl = import.meta.env.VITE_BASE_URL;
    console.log('handle Logpopup works', encryptedUrl);
    const url = `${window.location.origin}${baseUrl}/#/vendor_expenditure/expense_overview?exKey=${encodedKey}`;
    window.open(url, '_blank');
    const decryptedUrl = Decrypt({
      encryptedString: encryptedUrl,
      key: import.meta.env.VITE_AES_SECRET_KEY,
      iv: import.meta.env.VITE_AES_IV,
    });
    console.log('handle Logpopup works', decryptedUrl);

    // setIsLogOpen(true);
    // setPopupLoading(true);
    // const resolvedRow = (await Promise.resolve(row)) as ExpenseDTOType;
    // const advanceDetails: Array<VendorAdvance> =
    //   await VendorAdvanceServices.fetchVendorAdvanceDropDownByVendorId(
    //     resolvedRow.vendorId,
    //   );
    // const splits: Array<ExpenseSplit> =
    //   await ExpenseServices.fetchExpenseSplitById(resolvedRow.expenseId!);
    // // console.log(splits, resolvedRow, row, 'splits, resolvedRow, row');
    // const getSplitGst = (split: any) =>
    //   Number(
    //     split.gstAmount ??
    //       (split.amountApproved && split.gstPercentage
    //         ? (split.amountApproved * split.gstPercentage) / 100
    //         : 0),
    //   );
    // const overallGstAmount = splits.reduce(
    //   (sum: number, split: any) => sum + getSplitGst(split),
    //   0,
    // );
    // setIsValidVendor(true);
    // setVendorHasGST(
    //   resolvedRow.gstStatus === 'Registered' || resolvedRow.gstStatus === '1',
    // );
    // const reConsultedRow = {
    //   ...resolvedRow,
    //   advanceCode: advanceDetails.filter(
    //     (advance) => advance.vendorAdvanceId === resolvedRow.advanceId,
    //   )[0]?.label,
    //   sourceAdvance: advanceDetails.filter(
    //     (advance) => advance.vendorAdvanceId === resolvedRow.advanceId,
    //   )[0]?.amountApproved,
    //   createdByName: userDropdown.find(
    //     (u) => u.userId === resolvedRow.createdBy,
    //   )?.firstName,
    //   lastUpdatedByName: userDropdown.find(
    //     (u) => u.userId === resolvedRow.lastUpdatedBy,
    //   )?.firstName,
    //   hostBooks: resolvedRow.hostBooks ? 'Yes' : 'No',
    //   // gstAmount: overallGstAmount,
    //   expenseSplits:
    //     splits.length > 0
    //       ? splits.map((split) => ({
    //           ...split,
    //           splitPercent: Number(
    //             (resolvedRow.totalAmmountNoGst > 0
    //               ? ((split.totalAmmountNogst || 0) /
    //                   resolvedRow.totalAmmountNoGst) *
    //                 100
    //               : 0
    //             ).toFixed(2),
    //           ),
    //           gstPercentage: split.gstPercentage?.toString() || '',
    //           gstAmount:
    //             getSplitGst(split).toFixed(2) ||
    //             split.gstAmount?.toFixed(2) ||
    //             '',

    //           toBeInvoiced: split.toBeInvoiced ? 'Yes' : 'No',
    //           totalAmountWithGst:
    //             (Number(split.amountApproved) + getSplitGst(split)).toFixed(
    //               2,
    //             ) || '',
    //           approverStatusName:
    //             statusDropdown.find(
    //               (s) => s.approverStatusId === split.approverStatusId,
    //             )?.approveStatusName ?? null,

    //           costCentreName:
    //             costCentersDropdown.find(
    //               (c) => c.costCentreId === split.costCentreId,
    //             )?.costCentreName ?? null,

    //           costHeaderName:
    //             costHeadersDropdown.find(
    //               (h) => h.costHeaderId === split.costHeaderId,
    //             )?.costHeaderName ?? null,
    //         }))
    //       : resolvedRow.expenseSplits && resolvedRow.expenseSplits.length > 0
    //         ? resolvedRow.expenseSplits
    //         : [
    //             {
    //               amount: 0,
    //               approverStatusId: 1,
    //               costCentreId: null,
    //               costHeaderId: null,
    //               createdBy: session.userId,
    //               lastUpdatedBy: session.userId,
    //               gstPercentage: resolvedRow.gstPercentage,
    //               gstAmount: 0,
    //               totalAmmountNogst: 0,
    //               expenseId: resolvedRow.expenseId,
    //             },
    //           ],
    // } as ExpenseDTOType;
    // // console.log(reConsultedRow, 'reConsultedRow');

    // const finalRow = distributeAdvanceConsumedForExpense(reConsultedRow);
    // setSelectedRow(finalRow);
    // setFormFields(finalRow);

    // setLogTableValue(finalRow);

    // setSelectedExpenseReqId(resolvedRow.expenseId!);
    // setPopupLoading(false);
  };

  // const handleLogPopup = async (row: Row | Promise<Row>) => {
  //   // console.log(row, 'rowTest');

  //   setIsLogOpen(true);
  //   setPopupLoading(true);
  //   const resolvedRow = (await Promise.resolve(row)) as ExpenseDTOType;
  //   const advanceDetails: Array<VendorAdvance> =
  //     await VendorAdvanceServices.fetchVendorAdvanceDropDownByVendorId(
  //       resolvedRow.vendorId,
  //     );
  //   const splits: Array<ExpenseSplit> =
  //     await ExpenseServices.fetchExpenseSplitById(resolvedRow.expenseId!);
  //   // console.log(splits, resolvedRow, row, 'splits, resolvedRow, row');
  //   const getSplitGst = (split: any) =>
  //     Number(
  //       split.gstAmount ??
  //         (split.amountApproved && split.gstPercentage
  //           ? (split.amountApproved * split.gstPercentage) / 100
  //           : 0),
  //     );
  //   const overallGstAmount = splits.reduce(
  //     (sum: number, split: any) => sum + getSplitGst(split),
  //     0,
  //   );
  //   setIsValidVendor(true);
  //   setVendorHasGST(
  //     resolvedRow.gstStatus === 'Registered' || resolvedRow.gstStatus === '1',
  //   );
  //   const reConsultedRow = {
  //     ...resolvedRow,
  //     advanceCode: advanceDetails.filter(
  //       (advance) => advance.vendorAdvanceId === resolvedRow.advanceId,
  //     )[0]?.label,
  //     sourceAdvance: advanceDetails.filter(
  //       (advance) => advance.vendorAdvanceId === resolvedRow.advanceId,
  //     )[0]?.amountApproved,
  //     createdByName: userDropdown.find(
  //       (u) => u.userId === resolvedRow.createdBy,
  //     )?.firstName,
  //     lastUpdatedByName: userDropdown.find(
  //       (u) => u.userId === resolvedRow.lastUpdatedBy,
  //     )?.firstName,
  //     hostBooks: resolvedRow.hostBooks ? 'Yes' : 'No',
  //     // gstAmount: overallGstAmount,
  //     expenseSplits:
  //       splits.length > 0
  //         ? splits.map((split) => ({
  //             ...split,
  //             splitPercent: Number(
  //               (resolvedRow.totalAmmountNoGst > 0
  //                 ? ((split.totalAmmountNogst || 0) /
  //                     resolvedRow.totalAmmountNoGst) *
  //                   100
  //                 : 0
  //               ).toFixed(2),
  //             ),
  //             gstPercentage: split.gstPercentage?.toString() || '',
  //             gstAmount:
  //               getSplitGst(split).toFixed(2) ||
  //               split.gstAmount?.toFixed(2) ||
  //               '',

  //             toBeInvoiced: split.toBeInvoiced ? 'Yes' : 'No',
  //             totalAmountWithGst:
  //               (Number(split.amountApproved) + getSplitGst(split)).toFixed(
  //                 2,
  //               ) || '',
  //             approverStatusName:
  //               statusDropdown.find(
  //                 (s) => s.approverStatusId === split.approverStatusId,
  //               )?.approveStatusName ?? null,

  //             costCentreName:
  //               costCentersDropdown.find(
  //                 (c) => c.costCentreId === split.costCentreId,
  //               )?.costCentreName ?? null,

  //             costHeaderName:
  //               costHeadersDropdown.find(
  //                 (h) => h.costHeaderId === split.costHeaderId,
  //               )?.costHeaderName ?? null,
  //           }))
  //         : resolvedRow.expenseSplits && resolvedRow.expenseSplits.length > 0
  //           ? resolvedRow.expenseSplits
  //           : [
  //               {
  //                 amount: 0,
  //                 approverStatusId: 1,
  //                 costCentreId: null,
  //                 costHeaderId: null,
  //                 createdBy: session.userId,
  //                 lastUpdatedBy: session.userId,
  //                 gstPercentage: resolvedRow.gstPercentage,
  //                 gstAmount: 0,
  //                 totalAmmountNogst: 0,
  //                 expenseId: resolvedRow.expenseId,
  //               },
  //             ],
  //   } as ExpenseDTOType;
  //   // console.log(reConsultedRow, 'reConsultedRow');

  //   const finalRow = distributeAdvanceConsumedForExpense(reConsultedRow);
  //   setSelectedRow(finalRow);
  //   setFormFields(finalRow);

  //   setLogTableValue(finalRow);

  //   setSelectedExpenseReqId(resolvedRow.expenseId!);
  //   setPopupLoading(false);
  // };
  function handleCloseLog() {
    setIsValidVendor(false);
    setVendorHasGST(false);
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    if (search.expenseId) {
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
    } else {
      navigate({
        to: '/vendor_expenditure/expenses',
        replace: true,
      });
    }
  }

  const isDate = (value: any): boolean => {
    if (typeof value !== 'string') return false;

    const parsed = parseISO(value);

    return isValid(parsed);
  };

  const formatValue = (value: any, label: string) => {
    // --- Handle Date values ---
    if (isDate(value)) {
      try {
        return label === 'Invoice Date'
          ? format(new Date(value), 'MMM dd, yyyy')
          : format(new Date(value), 'MMM dd, yyyy h:mm a');
      } catch {
        return value;
      }
    }
    console.log(value);

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

    if (label.includes('Amount')) {
      return INTL_UTILS.formatCurrency({ value });
    }

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
        if (/tds/i.test(word)) return word.replace(/tds/gi, 'TDS');
        if (/wcr/i.test(word)) return word.replace(/wcr/gi, 'WCR');
        if (/po/i.test(word)) return word.replace(/po/gi, 'PO');
        if (/loi/i.test(word)) return word.replace(/loi/gi, 'LOI');

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
    if (!data.every((d) => d && typeof d === 'object')) {
      console.warn('ObjectTable received invalid row(s):', data);
      return '-';
    }

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
  // console.log(allExpense, 'selectedTestRow');

  const DetailItem = ({ row, headcells }: any) => {
    const normalFields: Array<any> = [];
    const objectArrays: Array<any> = [];

    // Separate normal fields and object-array fields
    headcells.forEach((hc: any) => {
      const value = row[hc.id];
      const id = hc.id;

      if (id.endsWith('Id') || id.endsWith('Type')) return;
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'object'
      ) {
        objectArrays.push({ label: formatLabel(hc.label), value });
      } else {
        normalFields.push({ label: formatLabel(hc.label), value });
      }
    });

    return (
      <div className="flex flex-col gap-4">
        {/* GRID FOR NORMAL FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {normalFields.map((item, idx) => {
            const isDescription = item.label === 'Description';
            const isExpanded = expandedFields[idx];

            return (
              <div key={idx}>
                <p className="text-sm text-gray-600 dark:text-gray-500 font-medium">
                  {item.label}:
                </p>

                <p
                  className={`text-base text-gray-900 dark:text-gray-300 font-semibold mt-1 ${
                    isDescription && !isExpanded && item.value?.length > 150
                      ? 'line-clamp-2'
                      : ''
                  }`}
                >
                  {Array.isArray(item.value)
                    ? item.value.join(', ')
                    : formatValue(item.value, item.label) || '-'}
                </p>

                {/* Show toggle only for Description and if text is long */}
                {isDescription && item.value?.length > 150 && (
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="text-blue-600 cursor-pointer text-sm mt-1 hover:underline"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            );
          })}
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
        <CustomScreen
          label="expense_pop"
          disableLabel
          initialValues={formFields}
          submitFunction={(data) => onUpdate(data)}
          onClose={() => {}}
          // isTableView={true}
          fields={expenseFields.filter(
            (f) =>
              ![
                ...expenseFieldNames,
                'costCentreNames',
                'costHeaderNames',
                'siteNames',
                'amountPayable',
                'tdsAmount',
                'totalValue',
              ].includes(f.name),
          )}
          options={options}
          styles={{
            pageName: 'Expenses',
            label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
            container:
              'flex h-fit overflow-auto bg-transparent dark:bg-transparent',
            form: 'w-[100%] max-h-[100vh] border rounded-xl backdrop-blur-md p-1 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
            grid: 'grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4',
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
            submitButton: toBackend || !isAccounts,
            // toApprovalBackend ||
            // toRejectionBackend ||
            // (isAccounts &&
            //   selectedRow?.approverStatusId !== ApproverStatus.Pending),
            // submitButton: false,
          }}
        />
      </div>
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
      value: 'logs',
      label: 'Logs',
      component: DetailTable,
      className:
        'w-full max-w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700',
    },
  ];
  const tabsHeadcells = [
    {
      id: 'all',
      label: 'All',
      countClassName: 'bg-gray-300 text-gray-800',
    },
    {
      id: 'pending',
      label: 'Pending',
      countClassName: 'bg-yellow-200 text-yellow-800',
    },
    {
      id: 'approved',
      label: 'Approved',
      countClassName: 'bg-green-200 text-green-800',
    },
    {
      id: 'partiallyApproved',
      label: 'Partially Approved',
      countClassName: 'bg-green-200 text-green-800',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      countClassName: 'bg-red-200 text-red-800',
    },
    {
      id: 'paid',
      label: 'Paid',
      countClassName: 'bg-green-200 text-green-800',
    },
  ];
  const tabsFns = {
    setTabsValue,
  };
  const allTabsValues = {
    tabsValue,
    tabsCount,
    tabsHeadcells,
  };

  return (
    <div className="m-2.5 h-[80%]">
      {ExpenseQuery.isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <section className="w-full h-full flex flex-col">
          {/* <Tabs defaultValue={tabsValue} className="self-end">
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

              <TabsTrigger
                value="partiallyApproved"
                onClick={() => setTabsValue('partiallyApproved')}
              >
                Partially Approved
                {tabsCount.partiallyApproved > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-xs font-medium text-green-800">
                    {tabsCount.partiallyApproved}
                  </span>
                )}
              </TabsTrigger>

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
          </Tabs> */}

          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName="Expense"
            functions={allFunctions}
            access={{
              hasCreateAccess: hasCreateAccess,
              hasUpdateAccess: hasUpdateAccess,
            }}
            hide={{
              add: !hasCreateAccess,
              filter: false,
              hidden: false,
              download: false,
            }}
            customToolbarItems={{
              position: 'before',
              element: (
                <FormLinkGenerator
                  session={session}
                  formPath="vendor_expenditure/expenseForm"
                  dialogTitle="Vendor Expense Form"
                  dialogDescription="Anyone with this link can fill the expense form."
                  tooltipContent="Generate Vendor Expense Form"
                />
              ),
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
              return undefined;
            }}
            clickableColumn={clickableColumnList}
            onClick={handleLogPopup}
            tabsFns={tabsFns}
            allTabsValues={allTabsValues}
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
                edit ? onEditUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={expenseFields
                .filter((f) => expenseFieldNames.includes(f.name))
                .sort(
                  (a, b) =>
                    expenseFieldNames.indexOf(a.name) -
                    expenseFieldNames.indexOf(b.name),
                )}
              toBackend={toBackend}
              // isTableView ={true}
              options={options}
              styles={formStyles}
              label={edit ? 'Update Expense Details' : 'Create New Expense'}
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
      {isApprovalModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal
            open={isApprovalModalOpen}
            onClose={() => setIsApprovalModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div>
              <CustomForm
                initialValues={{
                  expenseId: formFields.expenseId,
                  approvedBy: session.userId,
                  amountApproved: formFields.amountApproved,
                  remarks: null,
                }}
                submitFunction={(data) =>
                  isApproved ? handleApproval(data) : handleReject(data)
                }
                onClose={() => setIsApprovalModalOpen(false)}
                fields={approvalModalFields!}
                options={{}}
                extraContent={<ExpenseSplitTable expense={selectedRow!} />}
                toBackend={toBackend}
                // isTableView = {true}
                styles={formStyles}
                label={isApproved ? 'Approve Expense' : 'Reject Expense'}
                buttonLabel={isApproved ? 'Approve' : 'Reject'}
              />
            </div>
          </Modal>
        </div>
      )}
      {isLogOpen && (
        <LogScreen
          open={isLogOpen}
          onClose={handleCloseLog}
          pageName="Expense"
          row={logTableValue}
          headcells={logHeadcells}
          tabList={tabList}
          tabsValue={logTabsValue}
          onTabChange={(val: any) => handleLogsTabChange(val)}
          loading={popupLoading}
          footerActions={
            <>
              <Button
                onClick={() => handleApprovalModal(false)}
                disabled={disableApprovalFlow || toRejectionBackend}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
              >
                {toRejectionBackend ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </Button>

              <Button
                onClick={() => handleApprovalModal(true)}
                disabled={disableApprovalFlow || toApprovalBackend}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer"
              >
                {toApprovalBackend ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
