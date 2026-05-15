// import { Loader, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import { CustomForm } from '../form/customForm';
import { CustomTable } from '../table/customTable';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import LogPopup from '../layout/LogPopup';
import type { JSX } from 'react';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';

import type {
  FinalizedPaymentDTOType,
  FinalizedPaymentUpdateDTOType,
} from '@/utils/Validators/Schema/finalizedSchema';
import type { VendorAdvance } from '@/types/vendorAdvance';
import { useFinalized } from '@/hooks/data/useFinalized';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useVendorDropdown } from '@/hooks/data/useVendor';
import { useApproverCategory } from '@/hooks/data/useApproverCategory';
import { useApproverStatus } from '@/hooks/data/useApproverStatus';
import { useSites } from '@/hooks/data/useSite';
import { invalidateQuery } from '@/utils/common/queryUtils';
import {
  FinalizedPaymentQuery,
  FinalizedPaymentServices,
} from '@/integrations/Services/finalizedPayment';

import { useVendorAdvanceDropdown } from '@/hooks/data/useVendorAdvanceDropdown';
import { INTL_UTILS } from '@/utils/common/IntlUtils';
import Loader from '@/utils/common/components/loader';

interface finalizedProps extends BaseProps {}

export default function FinalizedPayment(props: finalizedProps): JSX.Element {
  const { hasCreateAccess, hasUpdateAccess, session } = props;

  const navigate = useNavigate({
    from: '/po/finalizedPayment',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [logTableValue, setLogTableValue] = useState<any>(null);
  const [logTabsValue, setLogTabsValue] = useState<any>('details');
  const [selectedRow, setSelectedRow] =
    useState<FinalizedPaymentDTOType | null>(null);
  enum METHOD {
    GET_ALL = 'GET_ALL',
    GET_BY_ORG_ID = 'GET_BY_ORG_ID',
  }
  const paymentQuery = useFinalized(session, METHOD.GET_BY_ORG_ID);
  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const VendorQuery = useVendorDropdown();
  const ApproverCategoryQuery = useApproverCategory();
  const ApproverStatusQuery = useApproverStatus();
  const SiteQuery = useSites(session);
  const vendorId = selectedRow ? selectedRow.vendorId : null;
  const AdvanceDropDownQuery = useVendorAdvanceDropdown(vendorId);
  const allPayments = useMemo(
    () =>
      (paymentQuery.data ?? []).sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      ),
    [paymentQuery.data],
  );
  // console.log(allPayments, 'allPaymentsTest');

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
  // const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

  const advanceDropdown = useMemo(
    () => AdvanceDropDownQuery.data ?? [],
    [AdvanceDropDownQuery.data],
  );

  const allLoading =
    CostHeaderQuery.isLoading ||
    CostCenterQuery.isLoading ||
    VendorQuery.isLoading ||
    ApproverCategoryQuery.isLoading ||
    ApproverStatusQuery.isLoading ||
    SiteQuery.isLoading ||
    AdvanceDropDownQuery.isLoading;

  const expenseFieldNames = [
    'payeeName',

    'sourceReference',
    'paymentCode',
    'costHeaderNames',
    'costCentreNames',
    'bankAccountNo',
    'bankIfscCode',
    'totalAmount',
    'amountPending',
    'vendorCode',
  ];
  const allowedIds = [9, 7, 5, 4, 11];

  const filteredStatus = statusDropdown
    .filter((s) => allowedIds.includes(s.approverStatusId)) // remove Overdue (6)
    .sort(
      (a, b) =>
        allowedIds.indexOf(a.approverStatusId) -
        allowedIds.indexOf(b.approverStatusId),
    );
  const logHeadcells = useMemo(() => {
    if (!logTableValue) return [];
    console.log(logTableValue);

    if (logTabsValue === 'logs') {
      return [
        { id: 'action', label: 'Action' },
        { id: 'changes', label: 'Changes' },
        { id: 'occuredOn', label: 'Occured On' },
        { id: 'updatedBy', label: 'Updated By' },
      ];
    }

    return Object.keys(logTableValue)
      .map((key) => ({
        id: key,
        label:
          key === 'amountPending'
            ? 'Balance Payable'
            : key === 'totalAmount'
              ? 'Total Amount Approved (w/o GST & TDS) '
              : key.charAt(0).toUpperCase() + key.slice(1),
      }))
      .filter((item) => [...expenseFieldNames, 'sourceType'].includes(item.id))
      .sort((a, b) => {
        const ModifiedFieldNames = [
          'payeeName',
          'sourceType',
          'sourceReference',
          'paymentCode',
          'vendorCode',
          'costHeaderNames',
          'costCentreNames',
          'bankAccountNo',
          'bankIfscCode',
          'totalAmount',
          'amountPending',
          // 'contactNo'
        ];
        return (
          ModifiedFieldNames.indexOf(a.id) - ModifiedFieldNames.indexOf(b.id)
        );
      });
  }, [logTableValue, logTabsValue]);

  console.log(logTableValue, 'logHeadcells');

  const [tableValue, setTableValue] = useState<Array<Row>>(allPayments);
  const [tabsValue, setTabsValue] = useState<string>('all');
  const [paymentdate, setPaymentdate] = useState<boolean>(false);
  console.log(tabsValue);

  enum ApproverStatus {
    Pending = 1,
    InProgress = 2,
    Approved = 3,
    Rejected = 4,
    Paid = 5,
    Overdue = 6,
    Hold = 7,
    PartiallyApproved = 8,
    yettobe = 9,
    UploadedToBank = 11,
  }

  useEffect(() => {
    switch (tabsValue) {
      case 'all':
        setTableValue(allPayments);
        break;

      case 'hold':
        setTableValue(() => {
          return allPayments.filter(
            (expense) => expense.approverStatusId === ApproverStatus.Hold,
          );
        });
        break;
      case 'uploadedtobank':
        setTableValue(() => {
          return allPayments.filter(
            (expense) =>
              expense.approverStatusId === ApproverStatus.UploadedToBank,
          );
        });
        break;
      case 'Yettobe':
        setTableValue(() => {
          return allPayments.filter(
            (expense) => expense.approverStatusId === ApproverStatus.yettobe,
          );
        });
        break;
      case 'rejected':
        setTableValue(() => {
          return allPayments.filter(
            (expense) => expense.approverStatusId === ApproverStatus.Rejected,
          );
        });
        break;
      case 'paid':
        setTableValue(() => {
          return allPayments.filter(
            (expense) => expense.approverStatusId === ApproverStatus.Paid,
          );
        });
        break;
    }
  }, [tabsValue, allPayments]);

  const tabsCount = useMemo(() => {
    const all = allPayments.length;

    // const pending = allPayments.filter(
    //   (item) =>
    //     item.approverStatusId === ApproverStatus.Pending ||
    //     item.approverStatusId === ApproverStatus.InProgress ||
    //     item.approverStatusId === ApproverStatus.Hold,
    // ).length;

    const approved = allPayments.filter(
      (item) => item.approverStatusId === ApproverStatus.Approved,
    ).length;
    const yettobe = allPayments.filter(
      (item) => item.approverStatusId === ApproverStatus.yettobe,
    ).length;
    const uploadedtobank = allPayments.filter(
      (item) => item.approverStatusId === ApproverStatus.UploadedToBank,
    ).length;

    const paid = allPayments.filter(
      (item) => item.approverStatusId === ApproverStatus.Paid,
    ).length;
    const hold = allPayments.filter(
      (item) => item.approverStatusId === ApproverStatus.Hold,
    ).length;
    const rejected = allPayments.filter(
      (item) => item.approverStatusId === ApproverStatus.Rejected,
    ).length;
    return {
      all,
      //   pending,
      uploadedtobank,
      approved,
      hold,
      paid,
      yettobe,
      rejected,
    };
  }, [allPayments]);

  const headCells: Array<HeadCell> = [
    {
      id: 'paymentCode',
      label: 'Payment code',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'sourceType',
      label: 'Source Type',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'sourceReference',
      label: 'Source Code',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'payeeName',
      label: 'Payee Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorDropdown.map((v) => v.vendorName),
    },
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'costCentreNames',
      label: 'Cost center',
      defaultView: false,
      view: true,
      filterable: true,
    },
    {
      id: 'costHeaderNames',
      label: 'Cost Header',
      defaultView: false,
      view: true,
      filterable: true,
    },
    {
      id: 'totalAmount',
      label: 'Total Amount Approved (w/o GST & TDS)',
      defaultView: false,
      view: true,
      filterable: true,
    },
    {
      id: 'amountPending',
      label: 'Amount Payable',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'bankAccountNo',
      label: 'Bank Account No',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'bankIfscCode',
      label: 'IFSC Code',
      defaultView: true,
      view: true,
      filterable: true,
    },

    {
      id: 'contactNo',
      label: 'Contact No',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'approverStatusName',
      label: 'Status',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // {
    //   id: 'createdDate',
    //   label: 'Created Date',
    //   defaultView: true,
    //   view: true,
    // },
    // {
    //   id: 'action',
    //   label: 'Action',
    //   defaultView: true,
    //   view: true,
    //   filterable: false,
    // },
  ];
  const includedDownloadColumns = headCells.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id);  

  // Form variables, states, functions and declarations
  const defaultValues = {
    amountPaid: 0,
    nftReference: '',
    paymentDate: '',
    approverStatusId: 0,
    finalizedPaymentId: 0,
    vendorId: '',
    createdDate: '',
    paymentCode: '',
    contactNo: '',
    bankIfscCode: '',
    approveStatusName: '',
    approverStatusName: '',
    actionRemarks: '',
    costCentreNames: [],
    bankAccountNo: 0,
    amountPending: 0,
  };
  const [formFields, setFormFields] =
    useState<FinalizedPaymentUpdateDTOType>(defaultValues);
  console.log(formFields);

  const isValid =
    !!Number(formFields?.amountPaid) &&
    !!formFields?.actionRemarks?.trim() &&
    !!formFields?.nftReference?.trim() &&
    !!formFields?.paymentDate &&
    formFields?.approveStatusName === 'Paid';

  const expenseFields: Array<Field> = [
    {
      name: 'approveStatusName',
      label: 'Status',
      type: 'select',
      placeholder: 'Select Status',
      required: true,
      onChange: (name: string, value: any, form: any) => {
        setFormFields({
          ...formFields,
          [name]: value,
        });
      },
      disabled: isValid ? true : false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    ...(formFields?.approveStatusName !== 'Paid'
      ? [
          {
            name: 'actionRemarks',
            label: 'Remark',
            type: 'text',
            placeholder: 'Enter Remark',
            hidden:
              formFields?.approveStatusName === 'Yet to be Paid' ||
              formFields?.approveStatusName === 'Uploaded to Bank'
                ? true
                : false,
            required:
              formFields?.approveStatusName === 'Yet to be Paid' ||
              formFields?.approveStatusName === 'Uploaded to Bank'
                ? false
                : true,
            styles: {
              wrapper: 'flex flex-col gap-1',
              label: 'text-sm font-medium text-gray-500',
              input:
                'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
            },
          },
        ]
      : []),
    {
      name: 'amountPaid',
      label: 'Amount Paid',
      type: 'text',
      placeholder: 'Enter Amount Paid',
      disabled: isValid ? true : false,
      hidden: formFields?.approveStatusName === 'Paid' ? false : true,
      required: formFields?.approveStatusName === 'Paid' ? true : false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      // onChange: (_name: string, value: any, form: any) => {
      //   form.setFieldValue('tdsPercentage', value);
      // },
    },

    {
      name: 'nftReference',
      label: 'NFT Reference',
      type: 'text',
      placeholder: 'Enter NFT Reference',
      disabled: isValid ? true : false,
      hidden: formFields?.approveStatusName === 'Paid' ? false : true,
      required: formFields?.approveStatusName === 'Paid' ? true : false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'actionRemarks',
      label: 'Remark',
      type: 'text',
      placeholder: 'Enter Remark',
      disabled: isValid ? true : false,
      hidden: formFields?.approveStatusName === 'Paid' ? false : true,
      required: formFields?.approveStatusName === 'Paid' ? true : false,
      // required: formFields?.approveStatusName !== 'paid' ? fals : false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'paymentDate',
      label: 'Payment Date',
      type: 'date',
      placeholder: 'Advance ID',
      disabled: isValid ? true : false,
      hidden: formFields?.approveStatusName === 'Paid' ? false : true,
      required: formFields?.approveStatusName === 'Paid' ? true : false,
      // onChange: (_name: string, value: any, form: any) => {
      //   setPaymentdate(true);
      //   // computeTotals(form);
      // },

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
  ];
  const options = {
    costHeaderNames: costHeadersDropdown.map(
      (item: any) => item.costHeaderName,
    ),
    costCentreNames: costCentersDropdown.map(
      (item: any) => item.costCentreName,
    ),
    costHeaderName:
      costHeadersDropdown.map((item: any) => item.costHeaderName) || [],
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    costCentreName:
      costCentersDropdown.map((item: any) => item.costCentreName) || [],
    siteNames: siteDropdown.map((item: any) => item.siteName),
    vendorName: vendorDropdown.map((item: any) => item.vendorName),
    approveStatusName: filteredStatus.map(
      (item: any) => item.approveStatusName,
    ),
    categoryName: categoryDropdown.map((item: any) => item.categoryName),
  };

  const handleOpen = () => {
    setFormFields(defaultValues);
    setEdit(false);
    setIsOpen(true);
  };
  const handleClose = () => {
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
      console.log(row, 'row');
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
    pageName: 'Expenses',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const updatefinalizedMutation = useMutation({
    mutationKey: [FinalizedPaymentQuery.GET_ALL_FINALIZED_PAYMENT],
    mutationFn: async (data: FinalizedPaymentUpdateDTOType) => {
      console.log(data);

      setToBackend(true);
      const response =
        await FinalizedPaymentServices.UpdatefinalizedPaymentById(
          data.finalizedPaymentId as number,
          data,
        );
      setIsLogOpen(false);
      return response;
    },
    onSuccess: () => {
      toast.success('Finalized Payment updated successfully!');
      setToBackend(false);
      invalidateQuery(FinalizedPaymentQuery.GET_ALL_FINALIZED_PAYMENT);
      handleClose();
      setLogTabsValue(false);
      setPaymentdate(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(`Failed to update expense`);
    },
  });
  async function onUpdate(data: FinalizedPaymentUpdateDTOType) {
    setToBackend(true);
    console.log('onUpdate data:', data);

    if (
      data?.amountPending != data?.amountPaid &&
      data?.approveStatusName?.toLocaleLowerCase() !== 'hold' &&
      data?.approveStatusName?.toLocaleLowerCase() !== 'uploaded to bank' &&
      data?.approveStatusName?.toLocaleLowerCase() !== 'rejected'
    ) {
      toast.error(
        'Amount Paid must be equal to Amount Payable for Paid status',
      );
      setToBackend(false);
      return;
    }
    // Validate amount
    const amountPaid = Number(data?.amountPaid) || 0;
    const totalAmount = Number(data?.amountPending) || 0;

    if (amountPaid > totalAmount) {
      toast.error('Amount Paid cannot be greater than Total Amount');
      setToBackend(false);
      return;
    }

    // Find approverStatusId correctly
    const approverStatus = statusDropdown?.find(
      (v) => v?.approveStatusName === data?.approveStatusName,
    );

    if (!approverStatus) {
      toast.error('Invalid approver status selected');
      setToBackend(false);
      return;
    }

    // Add +1 day logic
    let updatedDate = data?.paymentDate ?? null;

    if (paymentdate && data?.paymentDate) {
      const dateObj = new Date(data.paymentDate);
      dateObj.setDate(dateObj.getDate() + 1);
      updatedDate = dateObj.toISOString().slice(0, 19); // keep format YYYY-MM-DDTHH:mm:ss
    }

    // Build payload
    const payload: FinalizedPaymentUpdateDTOType = {
      finalizedPaymentId: Number(data?.finalizedPaymentId),
      approverStatusId: Number(approverStatus?.approverStatusId),
      amountPaid: amountPaid,
      nftReference: data?.nftReference ?? '',
      paymentDate: updatedDate ?? '',
      remarks: data?.actionRemarks ?? '',
      organizationId: sessionStorage.getItem('organizationId'),
    };

    console.log('Final Payload:', payload);

    await updatefinalizedMutation.mutateAsync(payload);
    setToBackend(false);
  }

  const clickableColumnList = 'paymentCode';
  const formatList = (arr?: (string | null)[]) => {
    const list = arr?.filter((item) => item) || [];
    return list.length > 0 ? list.join(',\n') : '-';
  };
  const handleLogPopup = async (row: Row | Promise<Row>) => {
    const resolvedRow = (await Promise.resolve(row)) as FinalizedPaymentDTOType;

    const formattedCostCentreNames = formatList(resolvedRow.costCentreNames);
    const formattedCostHeaderNames = formatList(resolvedRow.costHeaderNames);

    setIsLogOpen(true);

    setSelectedRow({
      ...resolvedRow,
      approveStatusName: statusDropdown?.find(
        (v) => v?.approverStatusId === resolvedRow?.approverStatusId,
      )?.approveStatusName as string,
    });

    setFormFields({
      ...resolvedRow,
      approveStatusName: resolvedRow?.approverStatusName,
    });

    setLogTableValue({
      ...resolvedRow,
      costCentreNames: formattedCostCentreNames,
      costHeaderNames: formattedCostHeaderNames,
    });
  };

  function handleCloseLog() {
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    navigate({
      to: '/po/finalizedPayment',
      replace: true,
    });
  }

  const isDate = (value: any) => {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  };

  const formatValue = (value: any, label: string) => {
    if (
      isDate(value) ||
      (!isNaN(Date.parse(value)) && typeof value === 'string')
    ) {
      try {
        return label === 'Invoice Date'
          ? format(new Date(value), 'MMM dd, yyyy')
          : label !== 'Vendor code' && label !== 'Payee name'
            ? format(new Date(value), 'MMM dd, yyyy h:mm a')
            : value;
      } catch {
        return value;
      }
    }

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

    const key = label.toLowerCase();

    if (key === 'createdbyname') return 'Created by';
    if (key === 'costcentrenames') return 'Cost center';
    if (key === 'costheadernames') return 'Cost header';

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
        if (/ifsc/i.test(word)) return 'IFSC';
        if (/gst/i.test(word)) return 'GST';
        if (/tds/i.test(word)) return 'TDS)';
        if (/no/i.test(word)) return 'No';

        return index === 0
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : word.toLowerCase();
      })
      .join(' ');
  };
  const ObjectTable = ({ data }: { data: Array<any> }) => {
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      Array.isArray(data === null)
    )
      return '-';
    const keys = Object.keys(data).filter(
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
            label="final_pay_pop"
            disableLabel
            initialValues={formFields}
            submitFunction={(data) => onUpdate(data)}
            onClose={() => {}}
            fields={expenseFields.filter(
              (f) =>
                ![
                  ...expenseFieldNames,
                  'costCentreNames',
                  'costHeaderNames',
                  'siteNames',
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
              submitButton:
                selectedRow?.approveStatusName === 'Paid' ||
                selectedRow?.approveStatusName === 'Rejected',
            }}
            toBackend={toBackend}
          />
      </div>
    );
  };

  const tabList = [
    {
      value: 'details',
      label: 'Details',
      component: DetailItem,
    },
  ];

  return (
    <div className="m-2.5 h-[80%]">
      {paymentQuery.isLoading || allLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <section className="w-full h-full flex flex-col">
          <Tabs defaultValue={tabsValue} className="self-end">
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
                value="Yet to be Paid"
                onClick={() => setTabsValue('Yettobe')}
              >
                Yet to be paid
                {tabsCount.yettobe > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFA72682] text-xs font-medium text-[#FF5E00E0]">
                    {tabsCount.yettobe}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="uploadedtobank"
                onClick={() => setTabsValue('uploadedtobank')}
              >
                Uploaded to Bank
                {tabsCount.uploadedtobank > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full  bg-[#FFEDD5] text-xs font-medium text-[#9A3412] ">
                    {tabsCount.uploadedtobank}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="hold" onClick={() => setTabsValue('hold')}>
                Hold
                {tabsCount.hold > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-medium text-[#5B21B6]">
                    {tabsCount.hold}
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
            </TabsList>
          </Tabs>

          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName="Expense"
            functions={allFunctions}
            access={{
              hasCreateAccess: hasCreateAccess,
              hasUpdateAccess: hasUpdateAccess,
            }}
            editOptions={[]}
            hide={{
              add: true,
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
                  case 11:
                    return { backgroundColor: '#FFEDD5', color: '#9A3412' };
                  case 7:
                    return { backgroundColor: '#EDE9FE', color: '#5B21B6' };
                  case 5:
                    return { backgroundColor: '#DCFCE7', color: '#065F46' };
                  case 4:
                    return { backgroundColor: '#FEE2E2', color: '#991B1B' };
                  case 8:
                    return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
                  case 9:
                    return { backgroundColor: '#FFA72682', color: '#FF5E00E0' };
                  default:
                    return { backgroundColor: '#F3F4F6', color: '#374151' };
                }
              }
              return undefined;
            }}
            includedDownloadColumns={includedDownloadColumns}
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
                // edit ? onUpdate(data) :
                onUpdate(data)
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
              options={options}
              styles={formStyles}
              label={
                // edit ?
                'Update Finalized Payment Details'
                // : 'Create New Expense'
              }
              buttonLabel={edit ? 'Update' : ''}
            />
          </Modal>
        </div>
      )}

      {isLogOpen && (
        <LogPopup
          open={isLogOpen}
          onClose={handleCloseLog}
          pageName="Finalized"
          row={logTableValue}
          headcells={logHeadcells}
          tabList={tabList}
          tabsValue={'details'}
          // onTabChange={(val: any) => handleLogsTabChange(val)}
          footerActions={
            <>
              {/* 
              <Button
                                onClick={() => handleApprovalModal(false)}

                                disabled={(+selectedRow!.approverStatusId === +ApproverStatus.Approved ||
                                    +selectedRow!.approverStatusId === +ApproverStatus.Rejected) ||
                                    (
                                        +selectedRow!.levelId! !== +(sessionStorage.getItem('levelId')!) &&
                                        session.roleName.toLowerCase() !== 'admin'
                                    ) || toBackend || toRejectionBackend}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                                {toRejectionBackend ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    "Reject"
                                )}
                            </Button>

                            <Button
                                onClick={() => handleApprovalModal(true)}
                                disabled={(+selectedRow!.approverStatusId === +ApproverStatus.Approved ||
                                    +selectedRow!.approverStatusId === +ApproverStatus.Rejected) ||
                                    (
                                        +selectedRow!.levelId! !== +(sessionStorage.getItem('levelId')!) &&
                                        session.roleName.toLowerCase() !== 'admin'
                                    ) || toBackend || toApprovalBackend}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                                {toApprovalBackend ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    "Approve"
                                )}
                            </Button> */}
            </>
          }
        />
      )}
    </div>
  );
}
