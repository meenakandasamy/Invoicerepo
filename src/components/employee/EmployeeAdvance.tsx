import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Modal } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import LogPopup from '../layout/LogPopup';
import { Button } from '../ui/button';
import type { HeadCell, Row } from '@/types/table';
import type { Field } from '@/types/form';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useSites } from '@/hooks/data/useSite';
import { useEmployeeAdvance } from '@/hooks/data/useEmployeeAdvance';
import Loader from '@/utils/common/components/loader';
import {
  EmployeeQueries,
  EmployeeServices,
} from '@/integrations/Services/employeeServices';
import { invalidateQuery } from '@/utils/common/queryUtils';

export const EmployeeAdvance = (props: any) => {
  const { hasCreateAccess, hasUpdateAccess, session, search } = props;
  const navigate = useNavigate({ from: '/employee/advance' });

  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const SiteQuery = useSites(session);

  const costHeaderDropdown = useMemo(
    () => CostHeaderQuery.data ?? [],
    [CostHeaderQuery.data],
  );
  const costCentreDropdown = useMemo(
    () => CostCenterQuery.data ?? [],
    [CostCenterQuery.data],
  );
  const siteDropdown = useMemo(() => SiteQuery.data ?? [], [SiteQuery.data]);

  const employeeAdvanceQuery = useEmployeeAdvance(session);
  const employeeAdvacneByIdQuery = useEmployeeAdvance(
    session,
    search.employeeReimbursementId as number,
  );
  function handleAdvanceRow(row: Row): void {
    setIsLogOpen(true);
    setSelectedRow(row);
    setLogTableValue(row);
    setFormFields(row);
  }
  useEffect(() => {
    if (search.employeeReimbursementId && employeeAdvacneByIdQuery.data) {
      handleAdvanceRow(employeeAdvacneByIdQuery.data);
    }
  }, [search.employeeReimbursementId, employeeAdvacneByIdQuery.data]);

  const allAdvanceData: any = [
    {
      createdDate: '2025-11-25T12:55:10.475+00:00',
      lastUpdatedDate: '2025-11-26T14:16:08.502+00:00',
      employeeReimbursementId: 3,
      reimbursementCode: 'EMP-RE20251125002',
      employeeId: 102,
      employeeName: 'John',
      siteIds: [1, 4, 7],
      expenseType: 'Travel',
      totalAmount: 5500.75,
      emailId: 'jsujitha@gmail.com',
      createdBy: 10,
      costCentreIds: [1, 2],
      costHeaderIds: [3, 2],
      approverStatusId: 2,
      amountApproved: 5000,
      remarks: 'Approved with minor changes',
      lastUpdatedBy: 3,
      finalizedPaymentId: 2,
      levelId: null,
    },
    {
      createdDate: '2025-11-25T10:09:40.796+00:00',
      lastUpdatedDate: '2025-11-25T10:09:40.796+00:00',
      employeeReimbursementId: 5,
      reimbursementCode: 'EMP-RE202511250004',
      employeeId: 2345656,
      employeeName: 'Bavi',
      siteIds: [44, 46],
      expenseType: 'Food',
      totalAmount: 50000,
      emailId: 'bavi@gmail.com',
      createdBy: 3,
      costCentreIds: null,
      costHeaderIds: null,
      approverStatusId: null,
      amountApproved: null,
      remarks: null,
      lastUpdatedBy: 3,
      finalizedPaymentId: null,
      levelId: null,
    },
    {
      createdDate: '2025-11-25T10:07:21.427+00:00',
      lastUpdatedDate: '2025-11-25T10:11:38.285+00:00',
      employeeReimbursementId: 4,
      reimbursementCode: 'EMP-RE202511250003',
      employeeId: 3456789,
      employeeName: 'Ahan',
      siteIds: null,
      expenseType: 'Transport',
      totalAmount: 5000,
      emailId: 'ahanceo@gmail.com',
      createdBy: 3,
      costCentreIds: [3],
      costHeaderIds: [2],
      approverStatusId: null,
      amountApproved: null,
      remarks: null,
      lastUpdatedBy: 3,
      finalizedPaymentId: null,
      levelId: null,
    },
    {
      createdDate: '2025-11-26T14:58:53.887+00:00',
      lastUpdatedDate: '2025-11-26T14:59:21.236+00:00',
      employeeReimbursementId: 16,
      reimbursementCode: 'EMP-RE202511260012',
      employeeId: 195683,
      employeeName: 'Sujitha',
      siteIds: null,
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'sujithajothi118@gmail.com',
      createdBy: 3,
      costCentreIds: null,
      costHeaderIds: null,
      approverStatusId: 4,
      amountApproved: null,
      remarks: null,
      lastUpdatedBy: null,
      finalizedPaymentId: null,
      levelId: 1,
    },
    {
      createdDate: '2025-11-24T19:04:45.173+00:00',
      lastUpdatedDate: '2025-11-25T18:00:51.900+00:00',
      employeeReimbursementId: 1,
      reimbursementCode: 'EMP-RE20251124001',
      employeeId: 1203,
      employeeName: 'John Doe',
      siteIds: [44, 45, 46],
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 3,
      costCentreIds: [1, 2, 3],
      costHeaderIds: [3],
      approverStatusId: 1,
      amountApproved: null,
      remarks: 'Business trip to client site',
      lastUpdatedBy: 3,
      finalizedPaymentId: 1,
      levelId: 1,
    },
    {
      createdDate: '2025-11-25T18:20:17.094+00:00',
      lastUpdatedDate: '2025-11-25T18:20:17.094+00:00',
      employeeReimbursementId: 6,
      reimbursementCode: 'EMP-RE202511250005',
      employeeId: 12053,
      employeeName: 'Suji',
      siteIds: [44, 45, 46],
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 102,
      costCentreIds: [1, 2],
      costHeaderIds: [1, 3],
      approverStatusId: 1,
      amountApproved: null,
      remarks: 'Business trip to client site',
      lastUpdatedBy: null,
      finalizedPaymentId: 2,
      levelId: 1,
    },
    {
      createdDate: '2025-11-25T18:23:49.017+00:00',
      lastUpdatedDate: '2025-11-25T18:23:49.017+00:00',
      employeeReimbursementId: 8,
      reimbursementCode: 'EMP-RE202511250006',
      employeeId: 120773,
      employeeName: 'Suji',
      siteIds: [44, 45, 46],
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 102,
      costCentreIds: [1, 2],
      costHeaderIds: [1, 3],
      approverStatusId: 1,
      amountApproved: null,
      remarks: 'Business trip to client site',
      lastUpdatedBy: null,
      finalizedPaymentId: 2,
      levelId: 1,
    },
    {
      createdDate: '2025-11-25T18:27:54.935+00:00',
      lastUpdatedDate: '2025-11-25T18:27:54.935+00:00',
      employeeReimbursementId: 9,
      reimbursementCode: 'EMP-RE202511250007',
      employeeId: 120973,
      employeeName: 'Suji',
      siteIds: null,
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 3,
      costCentreIds: null,
      costHeaderIds: null,
      approverStatusId: 1,
      amountApproved: null,
      remarks: null,
      lastUpdatedBy: null,
      finalizedPaymentId: null,
      levelId: 1,
    },
    {
      createdDate: '2025-11-26T15:27:10.834+00:00',
      lastUpdatedDate: '2025-11-26T15:59:37.389+00:00',
      employeeReimbursementId: 17,
      reimbursementCode: 'EMP-RE202511260013',
      employeeId: 199683,
      employeeName: 'Sujitha',
      siteIds: [4, 5],
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'sujithajothi118@gmail.com',
      createdBy: 3,
      costCentreIds: [2],
      costHeaderIds: [1],
      approverStatusId: 4,
      amountApproved: 1000,
      remarks: null,
      lastUpdatedBy: null,
      finalizedPaymentId: null,
      levelId: 2,
    },
    {
      createdDate: '2025-11-25T18:35:46.617+00:00',
      lastUpdatedDate: '2025-11-25T18:55:26.777+00:00',
      employeeReimbursementId: 10,
      reimbursementCode: 'EMP-RE202511250008',
      employeeId: 1209783,
      employeeName: 'Suji',
      siteIds: [44, 45, 46],
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 3,
      costCentreIds: [1, 2],
      costHeaderIds: [3],
      approverStatusId: 3,
      amountApproved: 1000,
      remarks: null,
      lastUpdatedBy: null,
      finalizedPaymentId: null,
      levelId: 3,
    },
    {
      createdDate: '2025-11-26T09:33:12.464+00:00',
      lastUpdatedDate: '2025-11-26T09:37:58.118+00:00',
      employeeReimbursementId: 11,
      reimbursementCode: 'EMP-RE202511260009',
      employeeId: 120983,
      employeeName: 'Ilaya',
      siteIds: [44, 45],
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 3,
      costCentreIds: [1, 2],
      costHeaderIds: [3],
      approverStatusId: 2,
      amountApproved: 1000,
      remarks: null,
      lastUpdatedBy: null,
      finalizedPaymentId: null,
      levelId: 2,
    },
    {
      createdDate: '2025-11-26T09:38:20.862+00:00',
      lastUpdatedDate: '2025-11-26T09:39:49.582+00:00',
      employeeReimbursementId: 13,
      reimbursementCode: 'EMP-RE202511260010',
      employeeId: 12983,
      employeeName: 'Ilaya',
      siteIds: [1, 2],
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 3,
      costCentreIds: [1, 2],
      costHeaderIds: [3],
      approverStatusId: 3,
      amountApproved: 1000,
      remarks: null,
      lastUpdatedBy: null,
      finalizedPaymentId: null,
      levelId: 3,
    },
    {
      createdDate: '2025-11-26T09:45:04.848+00:00',
      lastUpdatedDate: '2025-11-26T09:45:04.848+00:00',
      employeeReimbursementId: 15,
      reimbursementCode: 'EMP-RE202511260011',
      employeeId: 1983,
      employeeName: 'Raja',
      siteIds: null,
      expenseType: 'Travel',
      totalAmount: 12500.5,
      emailId: 'john.doe@company.com',
      createdBy: 3,
      costCentreIds: null,
      costHeaderIds: null,
      approverStatusId: 1,
      amountApproved: null,
      remarks: null,
      lastUpdatedBy: null,
      finalizedPaymentId: null,
      levelId: 1,
    },
  ];

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

  const headCells: Array<HeadCell> = [
    {
      label: 'Advance Request Code',
      id: 'advanceRequestCode',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Created By',
      id: 'createdByName',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Created Timestamp',
      id: 'createdDate',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Employee Name',
      id: 'employeeName',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Email ID',
      id: 'emailId',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Employee Id',
      id: 'employeeId',
      view: true,
      defaultView: true,
      filterable: false,
    },
    {
      label: 'Site Name',
      id: 'siteName',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Total Amount',
      id: 'totalAmount',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Cost Center',
      id: 'costCentreName',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Cost Header',
      id: 'costHeaderName',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      id: 'approverStatusName',
      label: 'Status',
      defaultView: true,
      view: true,
    },
    {
      id: 'approvedAmount',
      label: 'Approved Amount',
      defaultView: true,
      view: true,
    },
    {
      id: 'updatedByName',
      label: 'Updated By',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'updatedDate',
      label: 'Updated Date',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'dateOfPayment',
      label: 'Date Of Payment',
      defaultView: true,
      view: true,
      filterable: true,
    },

    // {
    //   id: 'action',
    //   label: 'Action',
    //   defaultView: true,
    //   view: true,
    //   filterable: false,
    // },
  ];

  const defaultValues = {};
  const [tabsValue, setTabsValue] = useState<string>('all');
  //   const [tableValue, setTableValue] = useState<any>(allAdvanceData);
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [toBackend, setToBackend] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [logTabsValue, setLogTabsValue] = useState('details');
  const [logTableValue, setLogTableValue] = useState<any>([]);

  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalFields, setApprovalModalFields] =
    useState<Array<Field>>();

  //   useEffect(() => {
  //     switch (tabsValue) {
  //       case 'all':
  //         setTableValue(allAdvanceData);
  //         break;
  //       case 'pending':
  //         setTableValue(() => {
  //           return allAdvanceData.filter(
  //             (advance: any) =>
  //               advance.approverStatusId === ApproverStatus.Pending ||
  //               advance.approverStatusId === ApproverStatus.InProgress ||
  //               advance.approverStatusId === ApproverStatus.Hold,
  //           );
  //         });
  //         break;
  //       case 'approved':
  //         setTableValue(() => {
  //           return allAdvanceData.filter(
  //             (advance: any) =>
  //               advance.approverStatusId === ApproverStatus.Approved,
  //           );
  //         });
  //         break;
  //       case 'partiallyApproved':
  //         setTableValue(() => {
  //           return allAdvanceData.filter(
  //             (advance: any) =>
  //               advance.approverStatusId === ApproverStatus.PartiallyApproved,
  //           );
  //         });
  //         break;
  //       case 'rejected':
  //         setTableValue(() => {
  //           return allAdvanceData.filter(
  //             (advance: any) =>
  //               advance.approverStatusId === ApproverStatus.Rejected,
  //           );
  //         });
  //         break;
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [tabsValue, allAdvanceData]);

  const tabsCount = useMemo(() => {
    const all = allAdvanceData.length;

    const pending = allAdvanceData.filter(
      (item: any) =>
        item.approverStatusId === ApproverStatus.Pending ||
        item.approverStatusId === ApproverStatus.InProgress ||
        item.approverStatusId === ApproverStatus.Hold,
    ).length;

    const approved = allAdvanceData.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Approved,
    ).length;

    const partiallyApproved = allAdvanceData.filter(
      (item: any) => item.approverStatusId === ApproverStatus.PartiallyApproved,
    ).length;

    const rejected = allAdvanceData.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Rejected,
    ).length;

    return { all, pending, partiallyApproved, approved, rejected };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAdvanceData]);

  const isDate = (value: any) => {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  };
  const formatValue = (value: any, label: string) => {
    // --- Handle Date values ---
    if (
      isDate(value) ||
      (!isNaN(Date.parse(value)) && typeof value === 'string')
    ) {
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  function DetailItem({ row, headcells }: any) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {normalFields.map((item, idx) => (
            <div key={idx}>
              <p className="text-sm text-gray-600 dark:text-gray-500 font-medium">
                {item.label}:
              </p>
              <p className="text-base text-gray-900 dark:text-gray-300 font-semibold mt-1 wrap-break-word whitespace-normal">
                {Array.isArray(item.value)
                  ? item.value.join(', ')
                  : formatValue(item.value, item.label) || '-'}
              </p>
            </div>
          ))}
        </div>
        <CustomForm
          initialValues={formFields}
          submitFunction={(data) => onUpdate(data)}
          onClose={() => {}}
          // fields={expenseFields
          //   .filter((f) => !expenseFieldNames.includes(f.name))
          //   .sort(
          //     (a, b) =>
          //       expenseFieldNames.indexOf(a.name) -
          //       expenseFieldNames.indexOf(b.name),
          //   )}
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
            submitButton: false,
          }}
          fields={[
            {
              name: 'costCentreName',
              label: 'Cost Centre',
              type: 'multiSelect',
              placeholder: 'Cost Centre',
              required: true,
              onChange: (name: string, value: any, form: any) => {
                const costCentreIds = costCentreDropdown
                  .filter((cost: any) => value.includes(cost.costCentreName))
                  .map((cost: any) => cost.costCentreId);
                setFormFields((prev: any) => ({
                  ...prev,
                  [name]: value,
                  costCentreIds,
                }));
                form.setFieldValue('costCentreIds', costCentreIds);
              },
              value: formFields.costCentreName,
              styles: {
                wrapper: 'flex flex-col gap-1',
                label: 'text-sm font-medium text-gray-500',
                input:
                  'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
              },
            },
            // {
            //   name: 'siteName',
            //   label: 'Site Name',
            //   type: 'multiSelect',
            //   placeholder: 'Site Name',
            //   required: true,
            //   onChange: (name: string, value: any, form: any) => {
            //     setFormFields((prev: any) => ({
            //       ...prev,
            //       [name]: value,
            //     }));
            //   },
            //   value: formFields.siteName,
            //   styles: {
            //     wrapper: 'flex flex-col gap-1',
            //     label: 'text-sm font-medium text-gray-500',
            //     input:
            //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
            //   },
            // },
            {
              name: 'costHeaderName',
              label: 'Cost Header',
              type: 'multiSelect',
              placeholder: 'Cost Header',
              required: true,
              onChange: (name: string, value: any, form: any) => {
                const costHeaderIds = costHeaderDropdown
                  .filter((cost: any) => value.includes(cost.costHeaderName))
                  .map((cost: any) => cost.costHeaderId);
                setFormFields((prev: any) => ({
                  ...prev,
                  [name]: value,
                  costHeaderIds,
                }));
                form.setFieldValue('costHeaderIds', costHeaderIds);
              },
              value: formFields.costHeaderName,
              styles: {
                wrapper: 'flex flex-col gap-1',
                label: 'text-sm font-medium text-gray-500',
                input:
                  'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
              },
            },
          ]}
          label={''}
        />
      </div>
    );
  }

  const tabList = [
    {
      value: 'details',
      label: 'Details',
      component: DetailItem,
    },
  ];

  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setFormFields({});
    setIsLogOpen(false);
    setSelectedRow(null);
    setToBackend(false);
  };

  const allFunctions = {
    addFn: handleOpen,
    // optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };
  const formStyles: Record<string, string> = {
    pageName: 'Employee Advance',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
    submitButton:
      'cursor-pointer border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const fields: Array<Field> = [
    {
      name: 'employeeName',
      label: 'Employee Name',
      type: 'text',
      placeholder: 'Employee Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'employeeId',
      label: 'Employee Id',
      type: 'text',
      placeholder: 'Employee Id',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'emailId',
      label: 'Employee Email Id',
      type: 'text',
      placeholder: 'Employee Email Id',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'multiSelect',
      placeholder: 'Site Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'totalAmount',
      label: 'Total Amount',
      type: 'number',
      placeholder: 'Total Amount',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'Remarks',
      label: 'Remarks',
      type: 'text',
      placeholder: 'Remarks',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'quotationFilepath',
      label: 'Quotation (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('quotationFilepath', value[0].file.name);
        form.setFieldValue(
          'quotationFiletype',
          value[0].file.type.split('/')[1],
        );
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
  ];
  const options = {
    siteName: siteDropdown.map((site: any) => site.siteName),
    costCentreName: costCentreDropdown.map((cost: any) => cost.costCentreName),
    costHeaderName: costHeaderDropdown.map((cost: any) => cost.costHeaderName),
  };

  const createEmployeeAdvanceMutation = useMutation({
    mutationKey: [EmployeeQueries.CREATE_EMPLOYEE_ADVANCE],
    mutationFn: async (data: any) => {
      return await EmployeeServices.createEmployeeAdvance(data);
    },
    onSuccess: () => {
      toast.success('Employee Advance added successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_ADVANCE);
      handleClose();
    },
    onError: (error: any) => {
      toast.error('Failed to add Employee Advance!');
      console.error(error);
    },
  });

  const updateEmployeeAdvanceMutation = useMutation({
    mutationKey: [EmployeeQueries.UPDATE_EMPLOYEE_ADVANCE],
    mutationFn: async (data: any) => {
      return await EmployeeServices.updateEmployeeAdvance(
        data.employeeAdvanceId,
        data,
      );
    },
    onSuccess: () => {
      toast.success('Employee Advance updated successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_ADVANCE);
      handleClose();
    },
    onError: (error: any) => {
      toast.error('Failed to update Employee Advance!');
      console.error(error);
    },
  });

  const approveEmployeeAdvanceMutation = useMutation({
    mutationKey: [EmployeeQueries.APPROVE_EMPLOYEE_ADVANCE],
    mutationFn: async (data: any) => {
      return await EmployeeServices.approveAdvance(data);
    },
    onSuccess: () => {
      toast.success('Employee Advance approved successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_ADVANCE);
      handleClose();
      handleApprovalModalClose();
    },
    onError: (error: any) => {
      toast.error('Failed to approve Employee Advance!');
      console.error(error);
    },
  });

  const rejectEmployeeAdvanceMutation = useMutation({
    mutationKey: [EmployeeQueries.REJECT_EMPLOYEE_ADVANCE],
    mutationFn: async (data: any) => {
      return await EmployeeServices.rejectAdvance(data);
    },
    onSuccess: () => {
      toast.success('Employee Advance rejected successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_ADVANCE);
      handleClose();
      handleApprovalModalClose();
    },
    onError: (error: any) => {
      toast.error('Failed to reject Employee Advance!');
      console.error(error);
    },
  });
  async function onSubmit(data: any) {
    setToBackend(true);
    const matchedSite: any = siteDropdown.filter((site: any) =>
      data.siteName.includes(site.siteName),
    );
    if (!matchedSite) {
      throw new Error('Site not found!');
    }
    const siteIds: Array<number> = matchedSite.map((site: any) => site.siteId);
    const payload = {
      ...data,
      siteIds,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      totalAmount: Number(data.totalAmount),
    };
    console.log(payload);
    await createEmployeeAdvanceMutation.mutateAsync(payload);
    setToBackend(false);
    handleClose();
  }

  const headcells = useMemo(() => {
    return Object.keys(logTableValue || {})
      .map((key) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }))
      .filter((item) => item.id !== 'createdBy' && item.id !== 'lastUpdatedBy');
  }, [logTableValue]);

  function handleLogsTabChange(value: string) {
    setLogTabsValue(value);
  }

  function handleCloseLog() {
    setIsOpen(false);
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    navigate({
      to: '/employee/advance',
      replace: true,
    });
  }

  function handleApprovalModal(approveStatus: boolean) {
    if (
      formFields.costCentreNames &&
      formFields.costCentreNames.length === 0 &&
      formFields.costHeaderNames &&
      formFields.costHeaderNames.length === 0
    ) {
      toast.error('Please add at least one cost centre or cost header');
      return;
    }
    setIsApproved(approveStatus);
    setIsApprovalModalOpen(true);
    if (approveStatus) {
      setApprovalModalFields([
        {
          name: 'amountApproved',
          label: 'Amount Approved',
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
      ]);
    } else {
      setApprovalModalFields([
        {
          name: 'amountRejected',
          label: 'Amount Rejected',
          type: 'number',
          required: true,
          onChange: (_name: string, value: any, form: any) => {
            form.setFieldValue('amountRejected', value);
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
  }

  const handleApproval = async (data: any) => {
    setToBackend(true);
    const payload: any = {
      vendorId: logTableValue.vendorId!,
      approvedBy: session.userId,
      isAccounts: session.roleName.toLowerCase() === 'accounts',
      remarks: data.remarks,
    };
    console.log(payload, data, 'payload');

    await approveEmployeeAdvanceMutation.mutateAsync(payload);
    setToBackend(false);
  };

  const handleReject = (data: any) => {
    if (!selectedRow) return;
    const payload: any = {
      vendorId: selectedRow.vendorId!,
      rejectedBy: session.userId,
      levelId: +sessionStorage.getItem('levelId')!,
      remarks: data.remarks,
    };
    console.log(payload, 'payload');

    rejectEmployeeAdvanceMutation.mutate(payload);
  };

  function handleApprovalModalClose() {
    setIsApprovalModalOpen(false);
    setApprovalModalFields([]);
  }

  async function onUpdate(data: any) {
    setToBackend(true);

    const payload = {
      ...data,
      lastUpdatedBy: session.userId,
      totalAmount: Number(data.totalAmount),
    };
    await updateEmployeeAdvanceMutation.mutateAsync(payload);
    setToBackend(false);
    handleClose();
  }

  return (
    <div>
      {employeeAdvanceQuery.isLoading ? (
        <Loader />
      ) : (
        //   : employeeAdvanceQuery.isError ? (
        //     toast.error('Failed to load page!')
        //   )
        <div>
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
              </TabsList>
            </Tabs>

            <CustomTable
              key={allAdvanceData.length}
              headcells={headCells}
              rows={allAdvanceData}
              pageName="Employee Advance"
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
              clickableColumn="advanceRequestCode"
              onClick={handleAdvanceRow}
            />
          </section>
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
                  submitFunction={(data) => onSubmit(data)}
                  onClose={handleClose}
                  fields={fields}
                  options={options}
                  styles={formStyles}
                  label={'Create New Advance'}
                  buttonLabel={toBackend ? 'Submitting ' : 'Submit'}
                  toBackend={toBackend}
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
                    expenseId: selectedRow?.expenseId,
                    approvedBy: session.userId,
                    amountApproved: null,
                    remarks: null,
                  }}
                  submitFunction={(data) =>
                    isApproved ? handleApproval(data) : handleReject(data)
                  }
                  onClose={() => setIsApprovalModalOpen(false)}
                  fields={approvalModalFields!}
                  options={{}}
                  styles={formStyles}
                  label={isApproved ? 'Approve Vendor' : 'Reject Vendor'}
                  buttonLabel={
                    isApproved
                      ? toBackend
                        ? 'Approving '
                        : 'Approve'
                      : toBackend
                        ? 'Rejecting '
                        : 'Reject'
                  }
                  toBackend={toBackend}
                />
              </Modal>
            </div>
          )}

          {isLogOpen && (
            <LogPopup
              open={isLogOpen}
              onClose={handleCloseLog}
              pageName="Employee Advance"
              row={logTableValue}
              headcells={headcells}
              tabList={tabList}
              tabsValue={logTabsValue}
              onTabChange={(val: string) => handleLogsTabChange(val)}
              footerActions={
                <>
                  <Button
                    onClick={() => handleApprovalModal(false)}
                    disabled={
                      !selectedRow!.approverStatusId ||
                      +selectedRow!.approverStatusId ===
                        +ApproverStatus.Approved ||
                      +selectedRow!.approverStatusId ===
                        +ApproverStatus.Rejected ||
                      (+selectedRow!.levelId! !==
                        +sessionStorage.getItem('levelId')! &&
                        session.roleName.toLowerCase() !== 'admin')
                    }
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Reject
                  </Button>

                  <Button
                    onClick={() => handleApprovalModal(true)}
                    disabled={
                      !selectedRow!.approverStatusId ||
                      +selectedRow!.approverStatusId ===
                        +ApproverStatus.Approved ||
                      +selectedRow!.approverStatusId ===
                        +ApproverStatus.Rejected ||
                      (+selectedRow!.levelId! !==
                        +sessionStorage.getItem('levelId')! &&
                        session.roleName.toLowerCase() !== 'admin')
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Approve
                  </Button>
                </>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};
