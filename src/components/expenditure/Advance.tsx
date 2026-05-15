import { Loader2, Zap } from 'lucide-react';
import Loader from '@/utils/common/components/loader';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { format, isValid, parseISO } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import debounce from 'lodash.debounce';
import { CustomForm } from '../form/customForm';
import { CustomTable } from '../table/customTable';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import LogPopup from '../layout/LogPopup';
import { Button } from '../ui/button';
import { FormLinkGenerator } from '../form/FormLinkGenerator';
import AdvanceSplitTable from './AdvanceSplitTable';
import type { JSX } from 'react';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type { VendorAdvanceSearch } from '@/utils/Validators/schema/SearchSchemas';
import type { vendorDropdownType } from '@/types/requestor';
import { Tooltip } from '@mui/material';

import type {
  VendorAdvanceApprovalType,
  VendorAdvanceRejectionType,
  VendorAdvanceType,
  VendorAdvanceUpdateType,
} from '@/utils/Validators/schema/VendorAdvanceSchema';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useVendorDropdown } from '@/hooks/data/useVendor';
import { useApproverCategory } from '@/hooks/data/useApproverCategory';
import { useApproverStatus } from '@/hooks/data/useApproverStatus';
import { useSites } from '@/hooks/data/useSite';
import { invalidateQuery } from '@/utils/common/queryUtils';
import { useApproverDetails } from '@/hooks/data/useApproverDetails';
import { useVendorAdvances } from '@/hooks/data/useVendorAdvance';
import {
  VendorAdvanceQueries,
  VendorAdvanceServices,
} from '@/integrations/Services/vendorAdvanceService';
import {
  APPROVER_CATEGORY,
  isPrimaryValidator,
  levelValidator,
} from '@/utils/common/permissions';
import { useVendorAdvanceLogs } from '@/hooks/data/useVendorAdvanceLogs';
import { INTL_UTILS } from '@/utils/common/IntlUtils';
import { useUserList } from '@/hooks/data/useUserList';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

interface ExpensesProps extends BaseProps {
  search: VendorAdvanceSearch;
}

export default function VendorAdvancePage(props: ExpensesProps): JSX.Element {
  const { hasCreateAccess, hasUpdateAccess, session, search } = props;

  const navigate = useNavigate({
    from: '/vendor_expenditure/advance',
  });
  const { data: userList } = useUserList(session);

  useEffect(() => {
    if (search.vendorAdvanceId) {
      const data = getAdvanceData(search.vendorAdvanceId);

      handleLogPopup(data);
    }
    async function getAdvanceData(id: string | number) {
      const expenseData =
        await VendorAdvanceServices.fetchVendorAdvanceById(id);
      return expenseData;
    }
  }, [search.vendorAdvanceId]);

  // ! must call in all expense flow modules
  const { data: approverDetails } = useApproverDetails(session.userId);
  const isAccounts = isPrimaryValidator(APPROVER_CATEGORY.EMP_REIMBURSEMENT);

  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalFields, setApprovalModalFields] =
    useState<Array<Field>>();
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [toApprovalBackend, setToApprovalBackend] = useState<boolean>(false);
  const [toRejectionBackend, setToRejectionBackend] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const [isInstantApproval, setIsInstantApproval] = useState<boolean>(false);
  const [toInstantApprovalBackend, setToInstantApprovalBackend] =
    useState<boolean>(false);

  //   Log States:
  const [isLogOpen, setIsLogOpen] = useState(false);

  const [logTableValue, setLogTableValue] = useState<any>(null);
  const [logTabsValue, setLogTabsValue] = useState<any>('details');
  const [selectedRow, setSelectedRow] = useState<VendorAdvanceType | null>(
    null,
  );
  const [selectedVendorAdvanceId, setSelectedVendorAdvanceId] = useState<
    number | null
  >(null);

  enum METHOED {
    COST_IDS = 'COST_IDS',
    COST_IDS_ADMIN = 'COST_IDS_ADMIN',
    LEVEl_ID = 'LEVEL_ID',
    ALL = 'ALL',
    ORG_ID = 'ORG_ID',
  }

  const VendorAdvanceQuery = useVendorAdvances(
    session,
    isAccounts
      ? METHOED.ORG_ID
      : sessionStorage
            .getItem('poRoleName')
            ?.toLocaleLowerCase()
            .includes('admin')
        ? METHOED.ORG_ID
        : METHOED.COST_IDS,
  );
  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const VendorQuery = useVendorDropdown();
  const ApproverCategoryQuery = useApproverCategory();
  const ApproverStatusQuery = useApproverStatus();
  const SiteQuery = useSites(session);
  const logsQuery = useVendorAdvanceLogs(selectedVendorAdvanceId, session);
  useApproverDetails(session.userId);

  const allVendorAdvance = useMemo(
    () =>
      (VendorAdvanceQuery.data ?? []).sort(
        (a, b) =>
          new Date(b.lastUpdatedDate).getTime() -
          new Date(a.lastUpdatedDate).getTime(),
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
  const siteDropdown = useMemo(() => SiteQuery.data ?? [], [SiteQuery.data]);
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

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
    if (value === 'logs') {
      // const formattedLogs = formatLogs(logs);
      const sortedLogs = sortByOccurredOnAsc(logs);
      console.log(sortedLogs, 'sortedLogs');
      setLogTableValue(sortedLogs);
    } else if (value === 'details') {
      setLogTableValue(selectedRow);
    }
  }

  const [tableValue, setTableValue] = useState<Array<Row>>(allVendorAdvance);
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

  const shouldBeTrue = useMemo(() => {
    const isNonAccounts = !isAccounts;
    const levelMismatch = !(
      selectedRow &&
      selectedRow.levelId &&
      levelValidator(
        APPROVER_CATEGORY.VENDOR_ADVANCE,
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

  useEffect(() => {
    switch (tabsValue) {
      case 'all':
        setTableValue(allVendorAdvance);
        break;
      case 'pending':
        setTableValue(() => {
          return allVendorAdvance.filter(
            (vendorAdvance) =>
              vendorAdvance.approverStatusId === ApproverStatus.Pending ||
              vendorAdvance.approverStatusId === ApproverStatus.InProgress ||
              vendorAdvance.approverStatusId === ApproverStatus.Hold,
          );
        });
        break;
      case 'approved':
        setTableValue(() => {
          return allVendorAdvance.filter(
            (vendorAdvance) =>
              vendorAdvance.approverStatusId === ApproverStatus.Approved &&
              !vendorAdvance.isPaid,
          );
        });
        break;
      case 'partiallyApproved':
        setTableValue(() => {
          return allVendorAdvance.filter(
            (vendorAdvance) =>
              vendorAdvance.approverStatusId ===
              ApproverStatus.PartiallyApproved,
          );
        });
        break;
      case 'rejected':
        setTableValue(() => {
          return allVendorAdvance.filter(
            (vendorAdvance) =>
              vendorAdvance.approverStatusId === ApproverStatus.Rejected,
          );
        });
        break;
      case 'paid':
        setTableValue(() => {
          return allVendorAdvance.filter(
            (vendorAdvance) => vendorAdvance.isPaid,
          );
        });
        break;
      // case 'hostBooks':
      //   setTableValue(() => {
      //     return allVendorAdvance.filter(
      //       (vendorAdvance) => vendorAdvance.isHostBook,
      //     );
      //   });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsValue, allVendorAdvance]);

  const tabsCount = useMemo(() => {
    const all = allVendorAdvance.length;

    const pending = allVendorAdvance.filter(
      (item) =>
        item.approverStatusId === ApproverStatus.Pending ||
        item.approverStatusId === ApproverStatus.InProgress ||
        item.approverStatusId === ApproverStatus.Hold,
    ).length;

    const approved = allVendorAdvance.filter(
      (item) =>
        item.approverStatusId === ApproverStatus.Approved && !item.isPaid,
    ).length;

    const partiallyApproved = allVendorAdvance.filter(
      (item) => item.approverStatusId === ApproverStatus.PartiallyApproved,
    ).length;

    const rejected = allVendorAdvance.filter(
      (item) => item.approverStatusId === ApproverStatus.Rejected,
    ).length;

    const paid = allVendorAdvance.filter((item) => item.isPaid).length;

    // const hostBooks = allVendorAdvance.filter((item) => item.isHostBook).length;

    return {
      all,
      pending,
      partiallyApproved,
      approved,
      rejected,
      paid,
      // hostBooks,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVendorAdvance]);

  const headCells: Array<HeadCell> = [
    // 1. Vendor Advance Code
    {
      id: 'vendorAdvanceCode',
      label: 'Advance Code',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 2. Created By (New)
    {
      id: 'createdBy',
      label: 'Created By',
      defaultView: false,
      view: true,
      filterable: true,
    },
    // 3. Created Timestamp (New)
    {
      id: 'createdDate',
      label: 'Created On',
      defaultView: false,
      view: true,
      filterable: true,
    },
    // 4. Vendor Company Name (Reordered)
    {
      id: 'vendorName',
      label: 'Vendor Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorDropdown.map((v) => v.vendorName),
    },
    // 5. Vendor POC Name (New)
    // {
    //   id: 'vendorPocName',
    //   label: 'Vendor POC Name',
    //   defaultView: false,
    //   view: true,
    //   filterable: true,
    // },
    // 6. Vendor Code (New)
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      defaultView: false,
      view: true,
      filterable: true,
    },
    // 7. Vendor Email (New)
    {
      id: 'vendorEmailId',
      label: 'Vendor Email Id',
      defaultView: false,
      view: true,
      filterable: true,
    },
    // 8. GST Status (New)
    {
      id: 'gstStatus',
      label: 'GST Status',
      defaultView: false,
      view: true,
      filterable: true,
    },
    // 9. Category (Reordered)
    {
      id: 'categoryName',
      label: 'Category',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: categoryDropdown.map((c) => c.categoryName),
    },
    // 10. Description (Reordered)
    {
      id: 'description',
      label: 'Description',
      defaultView: true,
      view: true,
      filterable: true,
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
    // 11. Total Amount excl.  GST (Reordered)
    {
      id: 'totalAmountNoGst',
      label: 'Total Amount (excl. GST)',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 12. GST Slab (Reordered)
    {
      id: 'gstPercentage',
      label: 'GST Slab (%)',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
    },
    // 13. GST Amount (Reordered)
    {
      id: 'gstAmount',
      label: 'GST Amount',
      defaultView: false,
      view: false,
      filterable: false,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 14. Total Amount incl.  GST (AND Advance Amount)
    {
      id: 'totalAmount',
      label: 'Advance Amount (incl. GST)',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 15. Cost Centre (Reordered)
    {
      id: 'costCentreNames',
      label: 'Cost Centre',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: costCentersDropdown.map((c) => c.costCentreName),
    },
    // 16. Cost Header (Reordered)
    {
      id: 'costHeaderNames',
      label: 'Cost Header',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: costHeadersDropdown.map((c) => c.costHeaderName),
    },
    {
      id: 'visualLevelId',
      label: 'Current Level',
      defaultView: true,
      view: true,
    },
    // {
    //   id: 'nextApproverName',
    //   label: 'Next Approver',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    // },
    // 17. Approval Status (Reordered)
    {
      id: 'approverStatusName',
      label: 'Approval Status',
      defaultView: true,
      view: true,
      filterable: true, // Assuming basic text filter or add select if you have options
    },
    // 18. Amount Approved (Reordered)
    {
      id: 'visualAmountApproved',
      label: 'Amount Approved (excl. GST)',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 19. Advance left (not consumed) (New)
    {
      id: 'advanceLeft',
      label: 'Advance Left (Not Consumed)',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 20. Remarks (New)
    // {
    //   id: 'remarks',
    //   label: 'Remarks (Inspire)',
    //   defaultView: false,
    //   view: true,
    //   filterable: true,
    // },
    // 21. Updated By (New)
    {
      id: 'lastUpdatedBy',
      label: 'Updated By',
      defaultView: false,
      view: true,
      filterable: true,
    },
    // 22. Updated Timestamp (New)
    {
      id: 'lastUpdatedDate',
      label: 'Last Updated On',
      defaultView: false,
      view: true,
      filterable: true,
    },
    {
      id: 'amountPayable',
      label: 'Amount Payable (incl. GST)',
      defaultView: false,
      view: true,
      filterable: true,
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 23. Amount Paid (Reordered)
    {
      id: 'fpTmountPaid',
      label: 'Amount Paid',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
      visualFormat: (data: number) => {
        return INTL_UTILS.formatCurrency({ value: data });
      },
    },
    // 24. Date of Payment (Reordered)
    {
      id: 'fpPaymentDate',
      label: 'Date of Payment',
      defaultView: true,
      view: true,
      filterable: true, // Likely needs date range filter logic in UI
    },
    // 25. IMPS / NEFT Transfer Ref (New)
    {
      id: 'transferReference',
      label: 'IMPS / NEFT Ref #',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // 26. Advance Consumed (New)
    // {
    //   id: 'advanceConsumed',
    //   label: 'Advance Consumed',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    //   filterType: 'range',
    //   visualFormat: (data: number) => {
    //     return INTL_UTILS.formatCurrency({ value: data });
    //   },
    // },
    // --- Fields present in code but not in Excel List (Appended) ---
    // {
    //   id: 'siteNames',
    //   label: 'Sites',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    //   filterType: 'select',
    //   filterOptions: siteDropdown.map((s) => s.siteName),
    // },
  ];

  const includedDownloadColumns = headCells
    .filter((headcell) => headcell.view === true)
    .map((headcell) => headcell.id);

  const vendorAdvanceFieldNames = [
    'vendorName',
    'selectedVendorName',
    'categoryName',
    'totalAmountNoGst',
    // 'gstPercentage',
    'gstAmount',
    'description',
    'totalAmountInGst',
    'totalAmount',
    'poLoiFilepath',
    'signedConfirmationFilepath',
    'invoiceFilepath',
  ];

  const vendorAdvanceViewForm = Array.from(
    new Set([
      ...headCells.map((hc) => hc.id),
      'amountPaid',
      'dateOfPayment',
      'transferReference',
      'levelId',
      'poLoiFilepath',
      // 'signedConfirmationFilepath',
      'invoiceFilepath',
      'remarks',
      'tdsPercentage',
    ]),
  );

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
    const keysdata=['gstStatus','lastUpdatedBy',]

    return Object.keys(logTableValue)
      .map((key) => ({
        id: key,
        label: headCells.find((hc) => hc.id === key)?.label || key,
      }))
      .filter((item) => vendorAdvanceViewForm.includes(item.id))
      .sort(
        (a, b) =>
          vendorAdvanceViewForm.indexOf(a.id) -
          vendorAdvanceViewForm.indexOf(b.id),
      ).filter((hc) => !keysdata.includes(hc.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logTableValue, logTabsValue]);

  // Form variables, states, functions and declarations
  const defaultValues: VendorAdvanceType = {
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
    amountPayable: 0,
    createdByName: '',
    lastUpdatedByName: '',
    vendorAdvanceId: 0,
    vendorAdvanceCode: '',
    vendorId: 0,
    vendorName: '',
    // --- New Vendor Fields ---
    vendorPocName: null,
    vendorCode: null,
    vendorEmail: null,
    gstStatus: null,

    categoryId: 0,
    categoryName: '',

    description: '',

    // --- Financials ---
    totalAmountNoGst: 0,
    gstPercentage: null,
    gstAmount: null,
    totalAmountInGst: 0,
    tdsPercentage: null,
    tdsAmount: null,
    totalAmount: 0,

    amountApproved: 0,
    amountPaid: 0,

    // --- New Advance Fields ---
    advanceLeft: null,
    advanceConsumed: null,

    dateOfPayment: '',
    // --- New Transfer Ref ---
    transferReference: null,

    approverStatusId: 0,
    approverStatusName: '',

    levelId: 0,
    isPaid: false,

    costCentreIds: [],
    costHeaderIds: [],
    siteIds: [],

    createdBy: 0,
    lastUpdatedBy: null,

    costCentreNames: [],
    costHeaderNames: [],
    siteNames: [],

    remarks: '',

    poLoiFilepath: '',
    poLoiFileType: '',
    invoiceFilepath: '',
    invoiceFileType: '',
    signedConfirmationFilepath: '',
    signedConfirmFileType: '',
  };
  const [formFields, setFormFields] =
    useState<VendorAdvanceType>(defaultValues);

  const computeTotals = (form: any) => {
    const totalNoGst = Number(form.getFieldValue('totalAmountNoGst') || 0);
    const gst = Number(form.getFieldValue('gstPercentage') || 0);
    // const tds = Number(form.getFieldValue('tdsPercentage') || 0);
  const tdsPercentage = Number(form.getFieldValue('tdsPercentage') || 0);
   const amountApproved = Number(form.getFieldValue('amountApproved') || 0);
    // Calculate GST & TDS
    const gstAmount = (totalNoGst * gst) / 100;
    // const tdsAmount = (totalNoGst * tds) / 100;

    // Calculate final total (No GST + GST - TDS)
    const totalAmount = totalNoGst + gstAmount;
 let tdsAmount = 0;
  if (tdsPercentage > 0 && amountApproved > 0) {
    tdsAmount = (amountApproved * tdsPercentage) / 100;
  }
  // const amountpayable=
    // Set form values
      form.setFieldValue('tdsAmount', tdsAmount.toFixed(2));
    form.setFieldValue('gstAmount', gstAmount.toFixed(2));
    // form.setFieldValue('tdsAmount', tdsAmount.toFixed(2));
    form.setFieldValue('totalAmount', totalAmount.toFixed(2));
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

      if (!vendorExists) {
        toast.error('Vendor does not exist or not verified yet.');
      }

      setState(!!vendorExists);
      if (vendorExists) {
        if (vendorExists.approverStatusId !== ApproverStatus.Approved) {
          toast.error('Vendor is not approved yet.');
          setIsValidVendor(false);
          return;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          setVendorHasGST(
            vendorExists.gstNo !== null && vendorExists.gstNo !== '',
          );
        }
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

  const vendorAdvanceFields: Array<Field> = [
    {
      name: 'vendorName',
      label: 'Vendor Email / Code',
      type: 'text',
      placeholder: 'Enter Vendor Email / Code',
      required: true,
      disabled: toBackend,
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
      name: 'poNumber',
      label: 'PO Number',
      type: 'text',
      placeholder: 'Enter PO Number',
      disabled: !isValidVendor || disableApprovalFlow || toBackend,
      required: false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // {
    //   name: 'categoryName',
    //   label: 'Category',
    //   type: 'select',
    //   placeholder: 'Select Category',
    //   required: true,
    //   disabled: !isValidVendor,
    //   onChange: (_name: string, value: any, form: any) => {
    //     form.setFieldValue('categoryName', value);
    //     form.setFieldValue(
    //       'categoryId',
    //       categoryDropdown.find((c) => c.categoryName === value)?.categoryId,
    //     );
    //   },
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-500',
    //     input:
    //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    //   },
    // },
    {
      name: 'costCentreNames',
      label: 'Cost Centres',
      type: 'select',
      placeholder: 'Select Cost Centres',
      required: true,
      disabled: !isValidVendor || disableApprovalFlow || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('costCentreNames', value);
        const ids = costCentersDropdown
          .filter((center) => value.includes(center.costCentreName))
          .map((center) => center.costCentreId);
        form.setFieldValue('costCentreIds', ids);
        setFormFields((prev) => ({
          ...prev,
          costCentreNames: value,
          costCentreIds: ids, // Fixed the typo here from "Center" to "Centre"
        }));
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
        !isAccounts ||
        toBackend ||
        disableApprovalFlow ||
        selectedRow?.approverStatusId !== ApproverStatus.Pending,
      onChange: (_name, value, form) => {
        form.setFieldValue('costHeaderNames', value);
        const ids = costHeadersDropdown
          .filter((header) => value.includes(header.costHeaderName))
          .map((header) => header.costHeaderId);
        form.setFieldValue('costHeaderIds', ids);
        setFormFields((prev) => ({
          ...prev,
          costHeaderNames: value,
          costHeaderIds: ids,
        }));
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
      disabled: !isValidVendor || disableApprovalFlow || toBackend,
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
      name: 'totalAmountNoGst',
      label: 'Total Amount (excl. GST)',
      type: 'text',
      placeholder: 'Enter Total Amount without GST',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('totalAmountNoGst', value);
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'gstPercentage',
      label: 'GST %',
      type: 'select',
      placeholder: 'Enter GST %',
      required: true,
      disabled: !isValidVendor || !vendorHasGST || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('gstPercentage', value);
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'gstAmount',
      label: 'GST Amount',
      type: 'number',
      placeholder: 'Calculated GST Amount',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'totalAmount',
      label: 'Total Amount (incl. GST)',
      type: 'number',
      placeholder: 'Total Amount incl. GST',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    // {
    //   name: 'amountPaid',
    //   label: 'Amount Paid',
    //   type: 'number',
    //   placeholder: 'Enter Amount Paid',
    //   required: false,
    //   disabled: true,
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-500',
    //     input:
    //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    //   },
    // },
    {
      name: 'amountApproved',
      label: 'Amount Approved (excl. GST)',
      type: 'text',
      placeholder: 'Enter amount approved',
      required: isAccounts,
      disabled: !isValidVendor || disableApprovalFlow || toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'tdsPercentage',
      label: 'TDS Percentage',
      type: 'select',
      placeholder: 'Enter TDS Percentage',
      required: false,
      disabled: !isValidVendor || disableApprovalFlow || toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('tdsPercentage', value);
        computeTotals(form);
      },
    },
    {
      name: 'tdsAmount',
      label: 'TDS Amount',
      type: 'number',
      placeholder: 'Enter TDS Amount',
      required: false,
      disabled: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('tdsAmount', value);
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'poLoiFilepath',
      label: 'PO/LOI (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'poLoiFilepath', 'poLoiFileType');
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    // {
    //   name: 'signedConfirmationFilepath',
    //   label: 'Approval Confirmation (PDF, JPG, PNG)',
    //   type: 'file',
    //   placeholder: 'Choose File',
    //   acceptTypes: '.pdf,.jpg,.jpeg,.png',
    //   required: true,
    //   disabled: !isValidVendor || toBackend,
    //   onChange: (_name: string, value: any, form: any) => {
    //     handleFileChange(
    //       value,
    //       form,
    //       'signedConfirmationFilepath',
    //       'signedConfirmFileType',
    //     );
    //   },
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-600',
    //   },
    // },
    {
      name: 'invoiceFilepath',
      label: 'Invoice (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      disabled: !isValidVendor || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'invoiceFilepath', 'invoiceFileType');
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    // {
    //   name: 'hostBooks',
    //   label: 'Host Book',
    //   type: 'select',
    //   placeholder: 'Yes or No',
    //   disabled: !isValidVendor || !isAccounts || toBackend,
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-600',
    //   },
    // },
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
    siteNames: siteDropdown.map((item: any) => item.siteName),
    vendorName: vendorDropdown.map((item: any) => item.vendorName),
    categoryName: categoryDropdown.map((item: any) => item.categoryName),
    gstPercentage: [0, 1.25, 2.5, 5, 6, 12, 18, 40],
    tdsPercentage: [0, 0.1, 0.5, 1, 2, 10],
    // hostBooks: ['No', 'Yes'],
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

  const handleCloseAll = () => {
    handleClose();
    handleCloseLog();
    setIsInstantApproval(false);
    setToInstantApprovalBackend(false);
    setToApprovalBackend(false);
    setToRejectionBackend(false);
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      setFormFields(row);
      setIsOpen(true);
      setEdit(true);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
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

  const createVendorAdvanceMutation = useMutation({
    mutationKey: [VendorAdvanceQueries.CREATE],
    mutationFn: async (data: VendorAdvanceType) => {
      setToBackend(true);
      return await VendorAdvanceServices.createVendorAdvance(data);
    },
    onSuccess: () => {
      toast.success('Vendor Advance added successfully!');
      invalidateQuery(VendorAdvanceQueries.GET_ALL);
      setFormFields(defaultValues);
      setToBackend(false);
      handleClose();
    },
    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to add Vendor Advance: ${error.message || error}`);
    },
  });

  const updateVendorAdvanceMutation = useMutation({
    mutationKey: [VendorAdvanceQueries.UPDATE],
    mutationFn: async (data: VendorAdvanceType) => {
      setToBackend(true);
      setToInstantApprovalBackend(true);
      const response = await VendorAdvanceServices.updateVendorAdvance(
        data.vendorAdvanceId,
        data,
      );
      // setIsLogOpen(false);
      return response;
    },

    onSuccess: async (_response, variable) => {
      if (isInstantApproval) {
        toast.success('Vendor Advance approved successfully!');
        handleCloseAll();
      } else {
        const { vendorAdvanceId: id } = variable;

        const advanceData = await VendorAdvanceServices.fetchVendorAdvanceById(
          id as number,
        );
        setLogTableValue(advanceData);
        handleLogPopup(advanceData);

        toast.success('Vendor Advance updated successfully!');
        setIsUpdated(true);
      }
      invalidateQuery(VendorAdvanceQueries.GET_ALL);
      setToBackend(false);
      setToInstantApprovalBackend(false);
    },

    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to update Vendor Advance: ${error.message || error}`);
    },
  });

  const vendorAdvanceApproveMutation = useMutation({
    mutationKey: [VendorAdvanceQueries.APPROVE],
    mutationFn: async (data: any) => {
      setToBackend(true);
      setToApprovalBackend(true);
      return await VendorAdvanceServices.approveVendorAdvance(data);
    },
    onSuccess: () => {
      invalidateQuery(VendorAdvanceQueries.GET_ALL);
      handleCloseAll();
      setToBackend(false);
      setToApprovalBackend(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        `Failed to approve vendor advance ${error.response.data || error.message}`,
      );
      setToBackend(false);
      setToApprovalBackend(false);
    },
  });

  const vendorAdvanceRejectMutation = useMutation({
    mutationKey: [VendorAdvanceQueries.REJECT],
    mutationFn: async (data: any) => {
      setToBackend(true);
      setToRejectionBackend(true);
      return await VendorAdvanceServices.rejectVendorAdvance(data);
    },
    onSuccess: () => {
      invalidateQuery(VendorAdvanceQueries.GET_ALL);
      handleCloseAll();
      setToBackend(false);
      setToRejectionBackend(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        `Failed to reject vendor advance ${error.response.data || error.message}`,
      );
      setToBackend(false);
      setToRejectionBackend(false);
    },
  });

  async function onSubmit(data: VendorAdvanceType) {
    if (
      !isValidFile(data.poLoiFilepath) ||
      !isValidFile(data.signedConfirmationFilepath) ||
      !isValidFile(data.invoiceFilepath)
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
    const category: any = categoryDropdown.find(
      (c) => c.categoryName === 'Vendor Advance',
    );
    if (!vendor) {
      toast.error('Vendor not found or unverified');
      return;
    }
    if (!category) {
      toast.error('Category not found');
    }
    const payload: VendorAdvanceType = {
      ...data,
      categoryId: category.categoryId,
      vendorId: vendor.vendorId,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      vendorEmailId: vendor.emailId,
      organizationId: sessionStorage.getItem('organizationId'),
    };

    // remove null, undefiened, 0 and empty strings
    const filteredPayload = deepClean(payload);
    console.log(filteredPayload, vendor, 'filteredPayload');
    console.log({
      po: data.poLoiFilepath,
      wcr: data.signedConfirmationFilepath,
      ticket: data.invoiceFilepath,
    });

    await createVendorAdvanceMutation.mutateAsync(filteredPayload);
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

  function handleApproveUpdate() {
    const payload = {
      ...formFields,
      approverStatusId: 3,
      hostBooks: formFields.hostBooks == 'Yes' ? true : false,
      createdBy: userList?.find((u) => u.userName == formFields.createdBy)
        ?.userId,
      lastUpdatedBy: userList?.find(
        (u) => u.userName == formFields.lastUpdatedBy,
      )?.userId,
    };
    const filteredPayload = deepClean(payload);
    console.log(filteredPayload, 'dataTestdata');
    updateVendorAdvanceMutation.mutate(filteredPayload);
  }

  function onUpdate(data: VendorAdvanceUpdateType) {
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
    if (!userList) {
      toast.error('User list not found');
      return;
    }
    if (Number(data.amountApproved) > Number(data.totalAmount)) {
      console.log(data.amountApproved, data.totalAmount, 'totalAmounts');

      toast.error('Approved amount cannot be greater than total amount');
      return;
    }
    const payload: VendorAdvanceUpdateType = {
      // spread the data
      ...data,

      // update the vendorId based on the vendorName
      vendorId: vendor.vendorId,

      // set createdBy and lastUpdatedBy
      lastUpdatedBy: session.userId,
      createdBy: userList.find((u) => u.userId === session.userId)?.userId,
      // hostBooks: data.hostBooks == 'Yes' ? true : false,
      organizationId:
        data.organizationId || sessionStorage.getItem('organizationId'),
    };

    const filteredPayload = deepClean(payload);
    // console.log(filteredPayload, 'filteredPayload');

    updateVendorAdvanceMutation.mutate(filteredPayload);
  }

  function handleApprovalModalClose() {
    setIsApprovalModalOpen(false);
    setApprovalModalFields([]);
  }

  const handleApproval = async (data: VendorAdvanceType) => {
    if (!selectedRow) return;
    if (Number(data.amountApproved) > Number(selectedRow.totalAmount)) {
      toast.error('Approved amount cannot be greater than total amount');
      return;
    }
    const payload: VendorAdvanceApprovalType = {
      vendorAdvanceId: data.vendorAdvanceId,
      approvedBy: session.userId,
      amountApproved: data.amountApproved,
      isAccounts: session.roleName.toLowerCase() === 'accounts',
      remarks: data.remarks as string,
    };

    const vendor = vendorDropdown.find(
      (v) =>
        v.emailId === selectedRow.vendorName ||
        v.vendorName === selectedRow.vendorName,
    );
    if (!vendor) {
      toast.error('Vendor not found or unverified');
      return;
    }
    const Updatedpayload: VendorAdvanceUpdateType = {
      // spread the data
      ...selectedRow,

      // update the vendorId based on the vendorName
      vendorId: vendor.vendorId,

      // amountPayable
      totalAmountInGst: Number(
        (
          +data.amountApproved +
          +((data.amountApproved * (selectedRow.gstPercentage || 0)) / 100)
        ).toFixed(2),
      ),

      // set createdBy and lastUpdatedBy
      lastUpdatedBy: session.userId,
    };

    const filteredPayload = deepClean(Updatedpayload);
    console.log(filteredPayload);

    try {
      await VendorAdvanceServices.updateVendorAdvance(
        filteredPayload.vendorAdvanceId,
        filteredPayload,
      );
      vendorAdvanceApproveMutation.mutate(payload);
      handleApprovalModalClose();
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to APPROVE Vendor Advance', e.message);
    } finally {
      search.vendorAdvanceId &&
        navigate({
          to: '/po/consolidatedDashboard',
          replace: true,
        });
    }
  };

  const handleReject = (data: VendorAdvanceType) => {
    if (!selectedRow) return;
    const payload: VendorAdvanceRejectionType = {
      vendorAdvanceId: data.vendorAdvanceId,
      rejectedBy: session.userId,
      levelId: +sessionStorage.getItem('levelId')!,
      remarks: data.remarks as string,
    };
    vendorAdvanceRejectMutation.mutate(payload);
    handleApprovalModalClose();
  };

  const handleInstantApprovalModal = () => {
    if (
      !formFields.costCentreNames?.length ||
      !formFields.costHeaderNames?.length
    ) {
      toast.error('Please enter Cost Header and Cost Center');
      return;
    }
    setIsInstantApproval(true);
  };

  const handleApprovalModal = (approveStatus: boolean) => {
    if (
      !formFields.costCentreNames?.length ||
      !formFields.costHeaderNames?.length
    ) {
      toast.error('Please enter Cost Header and Cost Center');
      return;
    }
    if (!isUpdated) {
      toast.error('Please click Update before Approving');
      return;
    }

    // const advancePop: VendorAdvanceType = useFormPageStore.getState().getPage("advance_pop");
    // if (sessionStorage.getItem('levelId') === '0' && approveStatus) {
    //   const payload: VendorAdvanceApprovalType = {
    //     vendorAdvanceId: advancePop.vendorAdvanceId,
    //     approvedBy: session.userId,
    //     amountApproved: advancePop.amountApproved,
    //     isAccounts: session.roleName.toLowerCase() === 'accounts',
    //     remarks: "Accounts Verified",
    //   };
    //   await vendorAdvanceApproveMutation.mutate(payload);
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

  const clickableColumnList = 'vendorAdvanceCode';
  const handleLogPopup = async (row: Row | Promise<Row>) => {
    const resolvedRow = await Promise.resolve(row);
    console.log(resolvedRow);
    setIsValidVendor(true);
    setVendorHasGST(true);
    setIsLogOpen(true);
    setSelectedRow({
      ...resolvedRow,
    } as VendorAdvanceType);
    setFormFields({
      ...resolvedRow,
    } as VendorAdvanceType);
    setLogTableValue(resolvedRow);

    setSelectedVendorAdvanceId(
      (resolvedRow as VendorAdvanceType).vendorAdvanceId,
    );
  };

  function handleCloseLog() {
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    setIsValidVendor(false);
    setVendorHasGST(false);
    if (search.vendorAdvanceId) {
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
      return;
    } else {
      navigate({
        to: '/vendor_expenditure/advance',
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

    return value;
  };

  const formatLabel = (label: string) => {
    if (!label) return '';
    if (typeof label === 'number') return label;
    const key = label.toLowerCase();

    if (key === 'imps / neft ref #') return 'IMPS / NEFT Ref #';
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
        if (/po/i.test(word)) return word.replace(/po/gi, 'PO');
        if (/loi/i.test(word)) return word.replace(/loi/gi, 'LOI');
        if (/no/i.test(word)) return word.replace(/no/gi, 'No');

        return index === 0
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : word.toLowerCase();
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
      const value = row[hc.id];
      if (
        hc.id.toLowerCase().includes('id') ||
        hc.id.toLowerCase().includes('type')
      )
        return;
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
          label="advance_pop"
          disableLabel
          initialValues={formFields}
          submitFunction={(data) => onUpdate(data)}
          onClose={() => {}}
          fields={vendorAdvanceFields.filter(
            (f) =>
              ![
                ...vendorAdvanceFieldNames,
                'siteNames',
                // 'tdsAmount',
                // 'tdsPercentage',
              ].includes(f.name),
          )}
          options={options}
          styles={{
            pageName: 'Vendor Advance',
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
            submitButton:
              toBackend ||
              !isValidVendor ||
              !isAccounts ||
              (isAccounts &&
                selectedRow?.approverStatusId !== ApproverStatus.Pending),
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
      {VendorAdvanceQuery.isLoading || VendorAdvanceQuery.isFetching ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <section className="w-full h-full flex flex-col">
          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName="Vendor Advance"
            functions={allFunctions}
            access={{
              hasCreateAccess: hasCreateAccess,
              hasUpdateAccess: hasUpdateAccess,
            }}
            editOptions={[]}
            hide={{
              add: !hasCreateAccess,
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
              return undefined;
            }}
            includedDownloadColumns={includedDownloadColumns}
            customToolbarItems={{
              position: 'before',
              element: (
                <FormLinkGenerator
                  session={session}
                  formPath="vendor_expenditure/advanceForm"
                  dialogTitle="Vendor Advance Form"
                  dialogDescription="Anyone with this link can fill the advance form."
                  tooltipContent="Generate Vendor Advance Form"
                />
              ),
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
                edit ? onUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={vendorAdvanceFields
                .filter((f) => vendorAdvanceFieldNames.includes(f.name))
                .sort(
                  (a, b) =>
                    vendorAdvanceFieldNames.indexOf(a.name) -
                    vendorAdvanceFieldNames.indexOf(b.name),
                )}
              toBackend={toBackend}
              options={options}
              styles={formStyles}
              label={
                edit
                  ? 'Update Vendor Advance Details'
                  : 'Create New Vendor Advance'
              }
              buttonLabel={
                edit
                  ? toBackend
                    ? 'Updating...'
                    : 'Update'
                  : toBackend
                    ? 'Submitting...'
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
            <CustomForm
              initialValues={{
                vendorAdvanceId: selectedRow!.vendorAdvanceId,
                approvedBy: session.userId,
                amountApproved: logTableValue?.amountApproved || 0,
                remarks: null,
              }}
              submitFunction={(data) =>
                isApproved ? handleApproval(data) : handleReject(data)
              }
              onClose={() => setIsApprovalModalOpen(false)}
              fields={approvalModalFields!}
              toBackend={toBackend}
              extraContent={<AdvanceSplitTable advance={selectedRow!} />}
              options={{}}
              styles={formStyles}
              label={isApproved ? 'Approve Advance' : 'Reject Advance'}
              buttonLabel={isApproved ? 'Approve' : 'Reject'}
            />
          </Modal>
        </div>
      )}
      {isLogOpen && (
        <LogPopup
          open={isLogOpen}
          onClose={handleCloseLog}
          pageName="Vendor Advance"
          row={logTableValue}
          headcells={logHeadcells}
          tabList={tabList}
          tabsValue={logTabsValue}
          onTabChange={(val: any) => handleLogsTabChange(val)}
          footerActions={
            <>
              <Button
                onClick={() => handleApprovalModal(false)}
                disabled={disableApprovalFlow || toRejectionBackend}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
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
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
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

              {isAccounts && (
                <Button
                  onClick={() => handleInstantApprovalModal()}
                  disabled={
                    toInstantApprovalBackend ||
                    toBackend ||
                    selectedRow?.levelId != 1 ||
                    selectedRow?.approverStatusId !== 1
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                >
                  {toApprovalBackend ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      Instant Approve <Zap />
                    </>
                  )}
                </Button>
              )}
            </>
          }
        />
      )}

      <ConfirmationModal
        isOpen={isInstantApproval}
        onClose={() => setIsInstantApproval(false)}
        onConfirm={handleApproveUpdate}
        title={'Instant Approve '}
        description={`Are you sure you want to directly approve the advance ?`}
        confirmButtonText={'Approve'}
        cancelButtonText="Cancel"
        confirmButtonColor={'blue'}
        disableCancelButton={toInstantApprovalBackend || toBackend}
        disableConfirmButton={toInstantApprovalBackend || toBackend}
      />
    </div>
  );
}
