import { Modal } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { format, isValid, parseISO } from 'date-fns';
import { CustomForm } from '../form/customForm';
import { CustomTable } from '../table/customTable';
import LogPopup from '../layout/LogPopup';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import type { JSX } from 'react/jsx-runtime';
import type { HeadCell, Row } from '@/types/table';
import type { Field } from '@/types/form';
import type { BaseProps } from '@/types/common';
import type { ReimbursementSearch } from '@/utils/Validators/schema/SearchSchemas';
import Loader from '@/utils/common/components/loader';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useReimbrushment } from '@/hooks/data/useReimbrushment';
import { useSites } from '@/hooks/data/useSite';
import {
  EmployeeQueries,
  EmployeeServices,
} from '@/integrations/Services/employeeServices';
import { invalidateQuery } from '@/utils/common/queryUtils';
import {
  APPROVER_CATEGORY,
  isPrimaryValidator,
  levelValidator,
} from '@/utils/common/permissions';
import { useReimbrushmentLogs } from '@/hooks/data/useReimbrushmentLogs';
import { useApproverDetails } from '@/hooks/data/useApproverDetails';
import { INTL_UTILS } from '@/utils/common/IntlUtils';

interface ReimbrusementProps extends BaseProps {
  search: ReimbursementSearch;
}

export default function Reimbursement(props: ReimbrusementProps): JSX.Element {
  const { hasCreateAccess, hasUpdateAccess, session, search } = props;

  const navigate = useNavigate({
    from: '/employee/reimbursement',
  });

  useApproverDetails(session.userId);

  // const isOEM = session.companyType === 'OEM';
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

  enum METHOD {
    GET_ALL = 'GET_ALL',
    GET_BY_ID = 'GET_BY_ID',
    GET_BY_ORG_ID = 'GET_BY_ORG_ID',
  }

  const reimbrusementDataQuery = useReimbrushment(
    session,
    METHOD.GET_BY_ORG_ID,
  );
  const reimbrusementByIdQuery = useReimbrushment(
    session,
    METHOD.GET_BY_ID,
    search.employeeReimbursementId as number,
  );

  useEffect(() => {
    if (search.employeeReimbursementId && reimbrusementByIdQuery.data) {
      handleReimbrusement(reimbrusementByIdQuery.data, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.employeeReimbursementId, reimbrusementByIdQuery.data]);

  const allReimbursementData = useMemo(
    () =>
      (reimbrusementDataQuery.data ?? []).sort(
        (a: any, b: any) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      ),
    [reimbrusementDataQuery.data],
  );
  const [selectedReimbursementId, setSelectedReimbursementId] = useState<
    number | string
  >('');
  const logsQuery = useReimbrushmentLogs(selectedReimbursementId, session);
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

  // const reimbursementById =
  // console.log(allReimbursementData, 'reimbursementData');
  const defaultValues = {
    employeeName: '',
    employeeId: '',
    emailId: '',
    siteName: [],
    costCentreName: [],
    costHeaderName: [],
    expenseType: [],
    totalAmount: '',
    remarks: '',
    receiptFilePath: '',
  };
  const [tableValue, setTableValue] =
    useState<Array<any>>(allReimbursementData);
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [toBackend, setToBackend] = useState(false);
  const [toApprovalBackend, setToApprovalBackend] = useState(false);
  const [toRejectionBackend, setToRejectionBackend] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [logTabsValue, setLogTabsValue] = useState('details');
  const [logTableValue, setLogTableValue] = useState<any>([]);

  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalFields, setApprovalModalFields] =
    useState<Array<Field>>();

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
  const [tabsValue, setTabsValue] = useState<string>('all');
  useEffect(() => {
    switch (tabsValue) {
      case 'all':
        setTableValue(allReimbursementData);
        break;
      case 'pending':
        setTableValue(() => {
          return allReimbursementData.filter(
            (reimbrusement: any) =>
              reimbrusement.approverStatusId === ApproverStatus.Pending ||
              reimbrusement.approverStatusId === ApproverStatus.InProgress ||
              reimbrusement.approverStatusId === ApproverStatus.Hold,
          );
        });
        break;
      case 'approved':
        setTableValue(() => {
          return allReimbursementData.filter(
            (reimbrusement: any) =>
              reimbrusement.approverStatusId === ApproverStatus.Approved,
          );
        });
        break;
      case 'partiallyApproved':
        setTableValue(() => {
          return allReimbursementData.filter(
            (reimbrusement: any) =>
              reimbrusement.approverStatusId ===
              ApproverStatus.PartiallyApproved,
          );
        });
        break;
      case 'rejected':
        setTableValue(() => {
          return allReimbursementData.filter(
            (reimbrusement: any) =>
              reimbrusement.approverStatusId === ApproverStatus.Rejected,
          );
        });
        break;
      case 'paid':
        setTableValue(() => {
          return allReimbursementData.filter(
            (reimbrusement: any) => reimbrusement.isPaid,
          );
        });
        break;
      case 'hostBooks':
        setTableValue(() => {
          return allReimbursementData.filter(
            (reimbrusement: any) =>
              reimbrusement.hostBooks === true ||
              reimbrusement.hostBooks === 'Yes',
          );
        });

        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsValue, allReimbursementData]);

  const tabsCount = useMemo(() => {
    const all = allReimbursementData.length;

    const pending = allReimbursementData.filter(
      (item: any) =>
        item.approverStatusId === ApproverStatus.Pending ||
        item.approverStatusId === ApproverStatus.InProgress ||
        item.approverStatusId === ApproverStatus.Hold,
    ).length;

    const approved = allReimbursementData.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Approved,
    ).length;

    const partiallyApproved = allReimbursementData.filter(
      (item: any) => item.approverStatusId === ApproverStatus.PartiallyApproved,
    ).length;

    const rejected = allReimbursementData.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Rejected,
    ).length;

    const paid = allReimbursementData.filter((item: any) => item.isPaid).length;

    const hostBooks = allReimbursementData.filter(
      (item: any) => item.hostBooks === true || item.hostBooks === 'Yes',
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
  }, [allReimbursementData]);

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
    if (key === 'lastupdatedbyname') return 'Last updated by';
    if (key === 'approverstatusname') return 'Approver status';
    if (key === 'lastupdateddate') return 'Last updated on';
    if (key === 'createddate') return 'Created on';
    if (key === 'nextapprovername') return 'Next approver';
    if (key === 'costcentrename') return 'Cost center';
    if (key === 'costheadername') return 'Cost header';
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
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        // Remaining words lowercase
        return word.toLowerCase();
      })
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
              <p className="text-base text-gray-900 dark:text-gray-300 font-semibold mt-1 break-words whitespace-normal">
                {Array.isArray(item.value)
                  ? item.value.join(', ')
                  : formatValue(item.value, item.label) || '-'}
              </p>
            </div>
          ))}
        </div>
        <CustomForm
          disableLabel
          initialValues={formFields}
          submitFunction={(data) => onUpdate(data)}
          onClose={() => setIsOpen(false)}
          options={options}
          styles={{
            pageName: 'Reimbursement',
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
          toBackend={toBackend}
          hide={{
            label: false,
            button: false,
            container: false,
            form: false,
            cancelButton: true,
            submitButton:
              toBackend ||
              toApprovalBackend ||
              toRejectionBackend ||
              !isAccounts,
            // selectedRow?.approverStatusId !== ApproverStatus.Pending,
          }}
          fields={[
            //   {
            //     name: 'costCentreNames',
            //     label: 'Cost Centre',
            //     type: 'multiSelect',
            //     placeholder: 'Cost Centre',
            //     required: true,
            //     disabled: !isPrimaryValidator(
            //       APPROVER_CATEGORY.EMP_REIMBURSEMENT,
            //     ),
            //     onChange: (name: string, value: any, form: any) => {
            //       const costCentreIds = costCentreDropdown
            //         .filter((cost: any) => value.includes(cost.costCentreName))
            //         .map((cost: any) => cost.costCentreId);
            //       setFormFields((prev: any) => ({
            //         ...prev,
            //         [name]: value,
            //         costCentreIds,
            //       }));
            //       form.setFieldValue('costCentreIds', costCentreIds);
            //     },
            //     value: formFields.costCentreName,
            //     styles: {
            //       wrapper: 'flex flex-col gap-1',
            //       label: 'text-sm font-medium text-gray-500',
            //       input:
            //         'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
            //     },
            //   },
            {
              name: 'hostBooks',
              label: 'Host Books',
              type: 'select',
              placeholder: 'Yes or No',
              // required: true,
              disabled: !isAccounts || toBackend,
              styles: {
                wrapper: 'flex flex-col gap-1',
                label: 'text-sm font-medium text-gray-500',
                input:
                  'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
              },
            },
            //   {
            //     name: 'costHeaderNames',
            //     label: 'Cost Header',
            //     type: 'multiSelect',
            //     placeholder: 'Cost Header',
            //     required: true,
            //     disabled: !isPrimaryValidator(
            //       APPROVER_CATEGORY.EMP_REIMBURSEMENT,
            //     ),
            //     onChange: (name: string, value: any, form: any) => {
            //       const costHeaderIds = costHeaderDropdown
            //         .filter((cost: any) => value.includes(cost.costHeaderName))
            //         .map((cost: any) => cost.costHeaderId);
            //       setFormFields((prev: any) => ({
            //         ...prev,
            //         [name]: value,
            //         costHeaderIds,
            //       }));
            //       form.setFieldValue('costHeaderIds', costHeaderIds);
            //     },
            //     value: formFields.costHeaderName,
            //     styles: {
            //       wrapper: 'flex flex-col gap-1',
            //       label: 'text-sm font-medium text-gray-500',
            //       input:
            //         'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
            //     },
            //   },
            {
              name: 'reimbursementSplit',
              label: 'Reimbursement Split',
              type: 'multiItems',
              // required: true,
              ButtonDisabled:
                !isAccounts ||
                toBackend ||
                selectedRow?.approverStatusId !== ApproverStatus.Pending,
              itemFields: [
                {
                  name: 'splitPercent',
                  label: 'Split in %',
                  type: 'number',
                  placeholder: 'Enter Split %',
                  disabled:
                    !isAccounts ||
                    toBackend ||
                    selectedRow?.approverStatusId !== ApproverStatus.Pending,
                },
                {
                  name: 'costCentreName',
                  label: 'Cost Center',
                  type: 'select',
                  placeholder: 'Select Center',
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  disabled:
                    !isAccounts ||
                    toBackend ||
                    selectedRow?.approverStatusId !== ApproverStatus.Pending,
                },
                {
                  name: 'costHeaderName',
                  label: 'Cost Header',
                  type: 'select',
                  placeholder: 'Select Header',
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  disabled:
                    !isAccounts ||
                    toBackend ||
                    selectedRow?.approverStatusId !== ApproverStatus.Pending,
                },
                {
                  name: 'totalAmountNogst',
                  label: 'Total Amount',
                  type: 'currency',
                  placeholder: 'Enter Amount',
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  disabled:
                    !isAccounts ||
                    toBackend ||
                    selectedRow?.approverStatusId !== ApproverStatus.Pending,
                },
                {
                  name: 'amountApproved',
                  label: 'Amount Approved (excl. GST)',
                  type: 'currency',
                  placeholder: 'Enter amount approved',
                  disabled:
                    !isAccounts ||
                    toBackend ||
                    selectedRow?.approverStatusId !== ApproverStatus.Pending,
                },
                {
                  name: 'toBeInvoiced',
                  label: 'To Be Invoiced',
                  type: 'select',
                  referValue: 'toBeInvoiced',
                  placeholder: 'Yes or No',
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  disabled:
                    !isAccounts ||
                    toBackend ||
                    selectedRow?.approverStatusId !== ApproverStatus.Pending,
                },
                // {
                //     name: 'amount',
                //     label: 'Total Amount(Including GST)',
                //     type: 'number',
                //     placeholder: 'Enter total Amount',
                //     disabled: true,
                // },
              ],
              onChange(
                name: string,
                value: any,
                form: any,
                editingField?: any,
              ) {
                const parentTotal = Number(form.state.values.totalAmount);
                const combos = new Set<string>();
                let runningTotal = 0;

                const updatedArray = value.map((item: any) => {
                  const updated = { ...item };
                  const key = `${item.costCentreName}::${item.costHeaderName}`;

                  if (
                    item.costCentreName &&
                    item.costHeaderName &&
                    combos.has(key)
                  ) {
                    toast.error(
                      'Duplicate combination removed. Please select a different Cost Centre or Cost Header.',
                    );
                    updated.costCentreId = 0;
                    updated.costCentreName = '';
                    updated.costHeaderId = 0;
                    updated.costHeaderName = '';
                  } else {
                    combos.add(key);
                  }

                  const enteredPercent =
                    item.splitPercent != null
                      ? Number(item.splitPercent)
                      : null;
                  const enteredAmount =
                    item.totalAmountNogst != null
                      ? Number(item.totalAmountNogst)
                      : null;
                  if (
                    editingField === 'splitPercent' &&
                    enteredPercent !== null
                  ) {
                    updated.totalAmountNogst = Number(
                      (parentTotal * enteredPercent) / 100,
                    ).toFixed(2);
                  } else if (
                    editingField === 'totalAmountNogst' &&
                    enteredAmount !== null
                  ) {
                    updated.splitPercent = Number(
                      (parentTotal > 0
                        ? (enteredAmount / parentTotal) * 100
                        : 0
                      ).toFixed(2),
                    );
                  } else if (enteredPercent != null) {
                    // fallback: only split is available
                    updated.totalAmountNogst = Number(
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
                  let newRunningTotal =
                    runningTotal + Number(updated.totalAmountNogst || 0);
                  if (newRunningTotal > parentTotal) {
                    toast.error(
                      'Total split amount exceeds parent total amount.',
                    );
                    updated.totalAmountNogst = 0;
                    updated.splitPercent = 0;
                    newRunningTotal = runningTotal;
                  }
                  runningTotal = newRunningTotal;
                  // console.log(runningTotal, newRunningTotal, 'parentTest');

                  return updated;
                });

                form.setFieldValue('reimbursementSplit', updatedArray);
              },
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

  const headCells: Array<HeadCell> = [
    {
      label: 'Request Code',
      id: 'reimbursementCode',
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
      label: 'Created On',
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
      filterType: 'select',
      filterOptions: siteDropdown.map((site: any) => site.siteName),
    },
    {
      label: 'Expense Type',
      id: 'expenseType',
      view: true,
      defaultView: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Food', 'Lodging', 'Travel', 'Other'],
    },
    {
      label: 'Total Amount',
      id: 'totalAmount',
      view: true,
      defaultView: true,
      filterable: true,
    },
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
    // {
    //   id: 'action',
    //   label: 'Action',
    //   defaultView: true,
    //   view: true,
    //   filterable: false,
    // },
  ];

  const includedDownloadColumns = headCells
    .filter((headcell) => headcell.view === true)
    .map((headcell) => headcell.id);

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      setFormFields(row);
      setIsOpen(true);
      setEdit(true);
    }
  }
  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setEdit(false); // Ensure it's in add mode
    setIsOpen(true);
  };
  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

  const formStyles: Record<string, string> = {
    pageName: 'Reimbursement',
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
      disabled: toBackend,
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
      disabled: toBackend,

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
      disabled: toBackend,
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
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'expenseType',
      label: 'Expense Type',
      type: 'multiSelect',
      placeholder: 'Expense Type',
      required: true,
      disabled: toBackend,
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
      type: 'text',
      placeholder: 'Total Amount',
      required: true,
      disabled: toBackend,
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
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    {
      name: 'receiptFilePath',
      label: 'Receipt (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
      required: true,
      disabled: toBackend,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'receiptFilePath', 'receiptFileType');
      },
      // hidden: edit,
    },
  ];

  const isAccounts = useMemo(() => {
    return isPrimaryValidator(APPROVER_CATEGORY.EMP_REIMBURSEMENT);
  }, []);
  const shouldBeTrue = useMemo(() => {
    const isNonAccounts = !isAccounts;
    const levelMismatch = !(
      selectedRow &&
      selectedRow.levelId &&
      levelValidator(
        APPROVER_CATEGORY.EMP_REIMBURSEMENT,
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

  const options: Record<string, Array<string | number>> = {
    siteName: siteDropdown.map((site: any) => site.siteName),
    expenseType: ['Food', 'Lodging', 'Transport', 'Other'],
    costCentreNames: costCentreDropdown.map((cost: any) => cost.costCentreName),
    costCentreName: costCentreDropdown.map((cost: any) => cost.costCentreName),
    costHeaderNames: costHeaderDropdown.map((cost: any) => cost.costHeaderName),
    costHeaderName: costHeaderDropdown.map((cost: any) => cost.costHeaderName),
    toBeInvoiced: ['Yes', 'No'],
    hostBooks: ['No', 'Yes'],
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormFields({});
    setIsLogOpen(false);
    setSelectedRow(null);
    setToBackend(false);
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

  const createReimbursementMutation = useMutation({
    mutationKey: [EmployeeQueries.CREATE_EMPLOYEE_REIMBURSEMENT],
    mutationFn: async (data: any) => {
      setToBackend(true);
      return await EmployeeServices.createEmployeeReimbursement(data);
    },
    onSuccess: () => {
      toast.success('Reimbursement created successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_REIMBURSEMENT);
      handleClose();
      setToBackend(false);
    },
    onError: (error: Error) => {
      setToBackend(false);
      toast.error('Failed to create reimbursement!');
      console.error(error);
    },
  });

  const updateReimbursementMutation = useMutation({
    mutationKey: [EmployeeQueries.UPDATE_EMPLOYEE_REIMBURSEMENT],
    mutationFn: async (data: any) => {
      setToBackend(true);
      const response = await EmployeeServices.updateEmployeeReimbursement(
        data.employeeReimbursementId as number,
        data,
      );
      return response;
    },
    onSuccess: async (_response, variables) => {
      const { employeeReimbursementId: id } = variables;
      const reimbursementData = await EmployeeServices.fetchReimbursementById(
        id!,
      );

      const modifiedValue = {
        ...reimbursementData,
        toBeInvoiced:
          reimbursementData.hostBooks == false ||
          reimbursementData.hostBooks == undefined ||
          reimbursementData.hostBooks == 'No'
            ? 'No'
            : 'Yes',
      };
      setLogTableValue(modifiedValue);
      toast.success('Reimbursement updated successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_REIMBURSEMENT);
      // handleClose();
      // handleCloseLog();
      setToBackend(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to update reimbursement!');
      setToBackend(false);
      console.error(error);
    },
  });

  const approveReimbursementMutation = useMutation({
    mutationKey: [EmployeeQueries.APPROVE_EMPLOYEE_REIMBURSEMENT],
    mutationFn: async (data: any) => {
      setToApprovalBackend(true);
      return await EmployeeServices.approveReimbursement(data);
    },
    onSuccess: () => {
      setToApprovalBackend(false);
      toast.success('Reimbursement approved successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_REIMBURSEMENT);
      handleClose();
      handleCloseLog();
    },
    onError: (error: Error) => {
      setToApprovalBackend(false);
      toast.error('Failed to approve reimbursement!');
      console.error(error);
    },
  });

  const rejectReimbursementMutation = useMutation({
    mutationKey: [EmployeeQueries.REJECT_EMPLOYEE_REIMBURSEMENT],
    mutationFn: async (data: any) => {
      setToRejectionBackend(true);
      return await EmployeeServices.rejectReimbursement(data);
    },
    onSuccess: () => {
      setToRejectionBackend(false);
      toast.success('Reimbursement rejected successfully!');
      invalidateQuery(EmployeeQueries.GET_ALL_EMPLOYEE_REIMBURSEMENT);
      handleClose();
      handleCloseLog();
    },
    onError: (error: Error) => {
      setToRejectionBackend(false);
      toast.error('Failed to reject reimbursement!');
      console.error(error);
    },
  });

  async function onSubmit(data: any): Promise<void> {
    if (!isValidFile(data.receiptFilePath)) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }
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
      receiptFileType: formFields.receiptFileType,
      expenseType: Array.isArray(data.expenseType)
        ? data.expenseType.join(', ')
        : data.expenseType,
      organizationId: sessionStorage.getItem('organizationId'),
    };
    // console.log(payload);
    await createReimbursementMutation.mutateAsync(payload);
    // handleClose();
    setIsOpen(false);
  }

  async function handleReimbrusement(row: Row, data: any): Promise<void> {
    // const formattedRow = {
    //   ...row,
    //   costCentreName: costCentreDropdown
    //     .filter((item: any) => row.costCentreIds?.includes(item.costCentreId))
    //     .map((item: any) => item.costCentreName)
    //     .join(', '),
    // };
    // console.log(costCentreDropdown, 'rowTets');
    // if (
    //   !isValidFile(data.invoiceFilePath) ||
    //   !isValidFile(data.poLoiFilePath) ||
    //   !isValidFile(data.wcrFilePath) ||
    //   !isValidFile(data.ticketReportFilePath)
    // ) {
    //   toast.error('Only PDF, JPG, and PNG files are allowed');
    //   return;
    // }

    setIsLogOpen(true);
    setPopupLoading(true);
    const splitDetails = await EmployeeServices.fetchReimbrushmentSplitById(
      row.employeeReimbursementId,
    );
    const {
      siteNames,
      costCentreNames,
      costHeaderNames,
      finalizedPaymentId,
      fpPaymentCode,
      fpActionRemarks,
      fpPayeeName,
      fpSourceReference,
      fpNftReference,
      fpPaymentDate,
      fpContactNo,
      fpBankAccountNo,
      fpBankIfscCode,
      fpTotalAmount,
      fpAmountPending,
      ...cleaned
    } = row;
    const splitAddedRow = {
      ...cleaned,
      reimbursementSplit:
        splitDetails?.length > 0
          ? splitDetails.map((split: any) => {
              return {
                ...split,
                toBeInvoiced:
                  split.toBeInvoiced == true
                    ? 'Yes'
                    : split.toBeInvoiced == false
                      ? 'No'
                      : '',
                costCentreName: costCentreDropdown.find(
                  (cost) => cost.costCentreId === split.costCentreId,
                )?.costCentreName,
                costHeaderName: costHeaderDropdown.find(
                  (cost) => cost.costHeaderId === split.costHeaderId,
                )?.costHeaderName,
                splitPercent: Number(
                  (cleaned.totalAmount > 0
                    ? ((split.totalAmountNogst || 0) / cleaned.totalAmount) *
                      100
                    : 0
                  ).toFixed(2),
                ),
              };
            })
          : row.reimbursementSplit && row.reimbursementSplit.length > 0
            ? row.reimbursementSplit.map((split: any) => {
                return {
                  ...split,
                  toBeInvoiced:
                    split.toBeInvoiced == true
                      ? 'Yes'
                      : split.toBeInvoiced == false
                        ? 'No'
                        : '',
                  costCentreName: costCentreDropdown.find(
                    (cost) => cost.costCentreId === split.costCentreId,
                  )?.costCentreName,
                  costHeaderName: costHeaderDropdown.find(
                    (cost) => cost.costHeaderId === split.costHeaderId,
                  )?.costHeaderName,
                  splitPercent: Number(
                    (cleaned.totalAmount > 0
                      ? ((split.totalAmountNogst || 0) / cleaned.totalAmount) *
                        100
                      : 0
                    ).toFixed(2),
                  ),
                };
              })
            : [
                {
                  approverStatusId: 1,
                  costCentreId: null,
                  costHeaderId: null,
                  createdBy: session.userId,
                  lastUpdatedBy: session.userId,
                  toBeInvoiced: null,
                  amountApproved: 0,
                  totalAmountNogst: 0,
                  gstPercentage: 0,
                },
              ],
      costCentreName: row.reimbursementSplit
        ?.map((split: any) => {
          return {
            ...split,
            costCentreName: costCentreDropdown.find(
              (cost) => cost.costCentreId === split.costCentreId,
            )?.costCentreName,
          };
        })
        .map((split: any) => split.costCentreName)
        .join(', '),
      costHeaderName: row.reimbursementSplit
        ?.map((split: any) => {
          return {
            ...split,
            costHeaderName: costHeaderDropdown.find(
              (cost) => cost.costHeaderId === split.costHeaderId,
            )?.costHeaderName,
          };
        })
        .map((split: any) => split.costHeaderName)
        .join(', '),
    };

    setPopupLoading(false);
    setSelectedRow(cleaned);
    setLogTableValue(splitAddedRow);
    setFormFields(splitAddedRow);
    setSelectedReimbursementId(row.employeeReimbursementId);
  }
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

  const headcells = useMemo(() => {
    if (!logTableValue) return [];
    if (logTabsValue === 'logs') {
      return [
        { id: 'action', label: 'Action' },
        { id: 'changes', label: 'Changes' },
        { id: 'occuredOn', label: 'Occured On' },
        { id: 'updatedByName', label: 'Updated By' },
      ];
    }

    return Object.keys(logTableValue || {})
      .map((key) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }))
      .filter((item) => item.id !== 'createdBy' && item.id !== 'lastUpdatedBy');
  }, [logTableValue, logTabsValue]);

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
      const sorted = sortByOccurredOnAsc(logs);
      // console.log(logs, 'logsTxt');
      // const formattedLogs = formatLogs(logs);
      setLogTableValue(sorted);
    } else if (value === 'details') {
      setLogTableValue(selectedRow);
    }
  }

  function handleCloseLog() {
    setIsOpen(false);
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    setIsApprovalModalOpen(false);
    if (search.employeeReimbursementId) {
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
      return;
    } else {
      navigate({
        to: '/employee/reimbursement',
        replace: true,
      });
      return;
    }
  }
  // console.log(
  //   formFields.costCentreName,
  //   formFields,
  //   'formFields.costCentreName',
  // );

  function handleApprovalModal(approveStatus: boolean) {
    console.log(logTableValue, 'logTableValue.amountApproved');

    if (
      logTableValue.reimbursementSplit.some(
        (item: any) => !item.costCentreName || !item.costHeaderName,
      )
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
          label: 'Amount Approved (excl. GST)',
          type: 'text',
          onChange: (_name: string, value: any, form: any) => {
            console.log(formFields, value, 'testForm');
            if (value > formFields.amountApproved) {
              toast.error(
                'Approved amount cannot be greater than Already Amount Approved',
              );
              return;
            } else {
              form.setFieldValue('amountApproved', value);
              setFormFields((prev: any) => ({
                ...prev,
                amountApproved: value,
              }));
            }
          },
          // disabled: sessionStorage.getItem('levelId') === '0',
          required: true,
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
          required: logTableValue.amountApproved < logTableValue.totalAmount,
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
  }

  const handleApproval = async (data: any) => {
    if (!selectedRow) return;
    if (data.amountApproved > logTableValue.amountApproved) {
      toast.error(
        'Approved amount cannot be greater than Already Approved amount',
      );
      return;
    }
    const payload: any = {
      employeeReimbursementId: logTableValue.employeeReimbursementId!,
      approvedBy: session.userId,
      isAccounts: false,
      amountApproved: data.amountApproved,
      remarks: data.remarks,
      approvedReimbursementSplitDTO: selectedRow?.reimbursementSplit?.map(
        (split: any) => ({
          reimbursementSplitId: split.reimbursementSplitId,
          amountApproved: split.amountApproved,
          approverStatusId:
            split.amountApproved == split.totalAmountNogst ? 3 : 8,
        }),
      ),
    };
    console.log(payload, selectedRow, 'payload');
    await approveReimbursementMutation.mutateAsync(payload);
    search.employeeReimbursementId &&
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
    window.location.reload();
  };

  const handleReject = async (data: any) => {
    if (!selectedRow) return;

    const payload: any = {
      employeeReimbursementId: selectedRow.employeeReimbursementId!,
      rejectedBy: session.userId,
      amountApproved: 10000,
      remarks: data.remarks,
    };
    console.log(payload, 'payload');

    await rejectReimbursementMutation.mutateAsync(payload);
    handleApprovalModalClose();
  };

  function handleApprovalModalClose() {
    setIsApprovalModalOpen(false);
    setApprovalModalFields([]);
  }

  async function onUpdate(data: any): Promise<void> {
    // if (!data.costCentreName || !data.costHeaderName) {
    //   toast.error('Please add at least one cost centre or cost header');
    //   return;
    // }
    // console.log(
    //   data,
    //   data.reimbursementSplit,
    //   data.reimbursementSplit.reduce(
    //     (acc, curr) => acc + curr.amountApproved,
    //     0,
    //   ),
    //   'splitTest',
    // );

    if (
      data.reimbursementSplit.some(
        (item: any) => !item.costCentreName || !item.costHeaderName,
      )
    ) {
      toast.error('Please add at least one cost centre or cost header');
      return;
    }
    if (
      data.reimbursementSplit.reduce(
        (acc, curr) => acc + curr.splitPercent,
        0,
      ) !== 100
    ) {
      toast.error('Total Split % must be equal to 100%');
      return;
    }
    // if (
    //   data.reimbursementSplit.some(
    //     (item) => item.totalAmountNogst != item.amountApproved,
    //   )
    // ) {
    //   toast.error('Approved Amount must be equal to Total Amount');
    //   return;
    // }

    const payload = {
      ...data,
      lastUpdatedBy: session.userId,
      expenseType: Array.isArray(data.expenseType)
        ? data.expenseType.join(', ')
        : data.expenseType,
      costCentreIds: data.reimbursementSplit.map(
        (item: any) =>
          costCentreDropdown.find(
            (cc) => cc.costCentreName === item.costCentreName,
          )?.costCentreId,
      ),
      costHeaderIds: data.reimbursementSplit.map(
        (item: any) =>
          costHeaderDropdown.find(
            (ch) => ch.costHeaderName === item.costHeaderName,
          )?.costHeaderId,
      ),
      reimbursementSplit: data.reimbursementSplit.map((item: any) => ({
        ...item,
        lastUpdatedBy: session.userId,
        toBeInvoiced: item.toBeInvoiced === 'Yes' ? true : false,
        costCentreId: costCentreDropdown.find(
          (cost) => cost.costCentreName === item.costCentreName,
        )?.costCentreId,
        costHeaderId: costHeaderDropdown.find(
          (cost) => cost.costHeaderName === item.costHeaderName,
        )?.costHeaderId,
      })),
      amountApproved: Number(
        data.reimbursementSplit
          .map((item: any) => item.amountApproved)
          .reduce((a: any, b: any) => a + b, 0),
      ),
      hostBooks: data.hostBooks == 'Yes' ? true : false,
      organizationId:
        data.organizationId || sessionStorage.getItem('organizationId'),
    };
    // console.log(payload, data.reimbursementSplit, 'dataTest');
    await updateReimbursementMutation.mutateAsync(payload);
    // if (search.employeeReimbursementId) {
    // window.location.reload();
    // }
    setToBackend(false);
    // handleClose();
  }

  return (
    <div className="m-2.5 h-[80%]">
      {reimbrusementDataQuery.isLoading ? (
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
          </Tabs>

          <CustomTable
            key={tableValue.length}
            headcells={headCells}
            rows={tableValue}
            pageName="Reimbursement"
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
            includedDownloadColumns={includedDownloadColumns}
            clickableColumn="reimbursementCode"
            onClick={handleReimbrusement}
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
              fields={fields}
              options={options}
              styles={formStyles}
              label={edit ? 'Update Reimbursement' : 'Create New Reimbursement'}
              buttonLabel={
                edit
                  ? toBackend
                    ? 'Updating '
                    : 'Update'
                  : toBackend
                    ? 'Submitting '
                    : 'Submit'
              }
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
                amountApproved: logTableValue.amountApproved,
                remarks: null,
              }}
              submitFunction={(data) =>
                isApproved ? handleApproval(data) : handleReject(data)
              }
              onClose={() => setIsApprovalModalOpen(false)}
              fields={approvalModalFields!}
              options={{}}
              styles={formStyles}
              label={
                isApproved ? 'Approve Reimbrusement' : 'Reject Reimbrusement'
              }
              buttonLabel={
                isApproved
                  ? toApprovalBackend
                    ? 'Approving'
                    : 'Approve'
                  : toRejectionBackend
                    ? 'Rejecting'
                    : 'Reject'
              }
              toBackend={isApproved ? toApprovalBackend : toRejectionBackend}
            />
          </Modal>
        </div>
      )}

      {isLogOpen && (
        <LogPopup
          open={isLogOpen}
          onClose={handleCloseLog}
          pageName="Reimbursement"
          row={logTableValue}
          headcells={headcells}
          tabList={tabList}
          tabsValue={logTabsValue}
          onTabChange={(val: string) => handleLogsTabChange(val)}
          loading={popupLoading}
          footerActions={
            <>
              <Button
                onClick={() => handleApprovalModal(false)}
                disabled={disableApprovalFlow}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                {toRejectionBackend ? 'Rejecting ' : 'Reject'}
              </Button>

              <Button
                onClick={() => handleApprovalModal(true)}
                disabled={disableApprovalFlow}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                {toApprovalBackend ? 'Approving ' : 'Approve'}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
