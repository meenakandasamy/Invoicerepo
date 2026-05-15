import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { format, isValid, parseISO } from 'date-fns';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { CustomTable } from '../table/customTable';
import LogPopup from '../layout/LogPopup';
import { Button } from '../ui/button';
import { CustomForm } from '../form/customForm';
import type { BaseProps } from '@/types/common';
import type { ConsultantSalarySearch } from '@/utils/Validators/schema/SearchSchemas';
import type { JSX } from 'react';
import type { HeadCell, Row } from '@/types/table';
import type { Field } from '@/types/form';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useSites } from '@/hooks/data/useSite';
import { useConsultantSalary } from '@/hooks/data/useConsultantSalary';
import Loader from '@/utils/common/components/loader';
import { useConsultantSalaryLogs } from '@/hooks/data/useConsultantSalaryLogs';
import {
  ConsultantQueries,
  ConsultantServices,
} from '@/integrations/Services/consultantServices';
import { invalidateQuery } from '@/utils/common/queryUtils';
import { Tooltip } from '@mui/material';

import {
  APPROVER_CATEGORY,
  isPrimaryValidator,
  levelValidator,
} from '@/utils/common/permissions';
import { useApproverDetails } from '@/hooks/data/useApproverDetails';
import { INTL_UTILS } from '@/utils/common/IntlUtils';
import type { vendorDropdownType } from '@/types/requestor';
import debounce from 'lodash.debounce';
import { useVendorDropdown } from '@/hooks/data/useVendor';

interface ConsultantProps extends BaseProps {
  search: ConsultantSalarySearch;
}

export const ConsultantSalary = (props: ConsultantProps): JSX.Element => {
  const { hasCreateAccess, hasUpdateAccess, session, search } = props;
  const navigate = useNavigate({
    from: '/employee/consultantSalary',
  });

  // useEffect(() => {
  //   if (search.consultantId) {
  //     const data = getConsultantData(search.consultantId);
  //     handleLogpopup(data);
  //   }

  // }, []);

  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const SiteQuery = useSites(session);
  const VendorQuery = useVendorDropdown();

  const costHeaderDropdown = useMemo(
    () => CostHeaderQuery.data ?? [],
    [CostHeaderQuery.data],
  );
  const costCentreDropdown = useMemo(
    () => CostCenterQuery.data ?? [],
    [CostCenterQuery.data],
  );
  // const siteDropdown = useMemo(() => SiteQuery.data ?? [], [SiteQuery.data]);

  enum METHOD {
    GET_ALL = 'GET_ALL',
    GET_BY_ID = 'GET_BY_ID',
    GET_BY_ORG_ID = 'GET_BY_ORG_ID',
  }
  const consultantQuery = useConsultantSalary(session, METHOD.GET_BY_ORG_ID);
  const allConsultantSalary = useMemo(
    () =>
      (consultantQuery.data ?? []).sort(
        (a: any, b: any) =>
          new Date(b.lastUpdatedDate).getTime() -
          new Date(a.lastUpdatedDate).getTime(),
      ),
    [consultantQuery.data],
  );

  const consultantQueryById = useConsultantSalary(
    session,
    METHOD.GET_BY_ID,
    search.consultantId ? search.consultantId : '',
  );
  const consultantById = useMemo(
    () => consultantQueryById.data ?? [],
    [consultantQueryById.data],
  );
  console.log(consultantById, search.consultantId, 'consultantById');

  useApproverDetails(session.userId);
  const [tableValue, setTableValue] = useState<Array<any>>(allConsultantSalary);

  const defaultValues = {};
  const [formFields, setFormFields] = useState<any>(defaultValues);

  const computeTotals = (form: any) => {
    const totalNoGst = Number(form.getFieldValue('totalAmmountNoGst') || 0);
    const gst = Number(form.getFieldValue('gstPercentage') || 0);
    const gstAmount = Number((totalNoGst * gst) / 100);
    const advancePaid = Number(form.getFieldValue('advancePaid') || 0);
    const tds = Number(form.getFieldValue('tdsPercentage') || 0);
    const tdsAmount = Number(((totalNoGst + gstAmount) * tds) / 100);

    form.setFieldValue(
      'totalValue',
      (totalNoGst + gstAmount - tdsAmount).toFixed(2),
    );
    form.setFieldValue(
      'amountPayable',
      (totalNoGst - advancePaid + gstAmount - tdsAmount).toFixed(2),
    );
  };

  const [isOpen, setIsOpen] = useState(false);
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [toApprovalBackend, setToApprovalBackend] = useState<boolean>(false);
  const [toRejectionBackend, setToRejectionBackend] = useState<boolean>(false);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<
    number | string
  >('');
  const [logTableValue, setLogTableValue] = useState<any>(null);
  const [logTabsValue, setLogTabsValue] = useState<any>('details');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalFields, setApprovalModalFields] =
    useState<Array<Field>>();

  const logsQuery = useConsultantSalaryLogs(selectedConsultantId, session);
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

  const vendorDropdown = useMemo(
    () => VendorQuery.data ?? [],
    [VendorQuery.data],
  );
  const [tabsValue, setTabsValue] = useState('all');
  useEffect(() => {
    switch (tabsValue) {
      case 'all':
        setTableValue(allConsultantSalary);
        break;
      case 'pending':
        setTableValue(() => {
          return allConsultantSalary.filter(
            (consultant: any) =>
              consultant.approverStatusId === ApproverStatus.Pending ||
              consultant.approverStatusId === ApproverStatus.InProgress ||
              consultant.approverStatusId === ApproverStatus.Hold,
          );
        });
        break;
      case 'approved':
        setTableValue(() => {
          return allConsultantSalary.filter(
            (consultant: any) =>
              consultant.approverStatusId === ApproverStatus.Approved &&
              !consultant.isPaid,
          );
        });
        break;
      case 'partiallyApproved':
        setTableValue(() => {
          return allConsultantSalary.filter(
            (consultant: any) =>
              consultant.approverStatusId === ApproverStatus.PartiallyApproved,
          );
        });
        break;
      case 'rejected':
        setTableValue(() => {
          return allConsultantSalary.filter(
            (consultant: any) =>
              consultant.approverStatusId === ApproverStatus.Rejected,
          );
        });
        break;
      case 'paid':
        setTableValue(() => {
          return allConsultantSalary.filter(
            (consultant: any) => consultant.isPaid,
          );
        });
        break;
      case 'hostBooks':
        setTableValue(() => {
          return allConsultantSalary.filter(
            (consultant: any) =>
              consultant.hostBooks === true || consultant.hostBooks === 'Yes',
          );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsValue, allConsultantSalary]);

  const tabsCount = useMemo(() => {
    const all = allConsultantSalary.length;

    const pending = allConsultantSalary.filter(
      (item: any) =>
        item.approverStatusId === ApproverStatus.Pending ||
        item.approverStatusId === ApproverStatus.InProgress ||
        item.approverStatusId === ApproverStatus.Hold,
    ).length;

    const approved = allConsultantSalary.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Approved,
    ).length;

    const partiallyApproved = allConsultantSalary.filter(
      (item: any) => item.approverStatusId === ApproverStatus.PartiallyApproved,
    ).length;

    const rejected = allConsultantSalary.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Rejected,
    ).length;

    const paid = allConsultantSalary.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Paid,
    ).length;

    const hostBooks = allConsultantSalary.filter(
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
  }, [allConsultantSalary]);

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
        if (/gst/i.test(word)) return word.replace(/gst/gi, 'GST');
        if (/tds/i.test(word)) return word.replace(/tds/gi, 'TDS');
        if (/fp/i.test(word)) return word.replace(/fp/gi, 'FP');
        if (/inc/i.test(word)) return word.replace(/inc/gi, 'incl.');

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
      // const value = row[hc.id];
      // if (
      //   hc.id.toLowerCase().includes('id') ||
      //   hc.id.toLowerCase().includes('type') ||
      //   hc.id.toLowerCase() === 'createddate'
      // )
     const excludeFields = ['id', 'type', ];
   if (
  excludeFields.some(field =>
    hc.id.toLowerCase().includes(field)
  )
) {
  return;
}
      const value = row[hc.id];
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
                {item?.label}:
              </p>
              <p className="text-base text-gray-900 dark:text-gray-300 font-semibold mt-1 wrap-break-word whitespace-normal">
                {Array.isArray(item?.value)
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
          toBackend={toBackend}
          // fields={expenseFields
          //   .filter((f) => !expenseFieldNames.includes(f.name))
          //   .sort(
          //     (a, b) =>
          //       expenseFieldNames.indexOf(a.name) -
          //       expenseFieldNames.indexOf(b.name),
          //   )}
          options={options}
          styles={{
            pageName: 'Consultant Salary',
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
          buttonLabel={toBackend ? 'Updating' : 'Update'}
          hide={{
            label: false,
            button: false,
            container: false,
            form: false,
            cancelButton: true,
            submitButton: toBackend || !isValidVendor || !isAccounts,
            // selectedRow?.approverStatusId !== ApproverStatus.Pending,
          }}
          fields={[
            {
              name: 'costCentreNames',
              label: 'Cost Centre',
              type: 'select',
              placeholder: 'Cost Centre',
              required: true,
              disabled:
                !isValidVendor ||
                !isAccounts ||
                toBackend ||
                selectedRow?.approverStatusId !== ApproverStatus.Pending,
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

            {
              name: 'costHeaderNames',
              label: 'Cost Header',
              type: 'select',
              placeholder: 'Cost Header',
              required: true,
              disabled:
                !isValidVendor ||
                !isAccounts ||
                toBackend ||
                selectedRow?.approverStatusId !== ApproverStatus.Pending,
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
            {
              name: 'tdsPercentage',
              label: 'TDS Percentage',
              type: 'select',
              placeholder: 'Enter TDS %',
              required: false,
              disabled:
                !isValidVendor ||
                !isAccounts ||
                toBackend ||
                selectedRow?.approverStatusId !== ApproverStatus.Pending,
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
              value: formFields.tdsPercentage,
            },
            {
              name: 'amountApproved',
              label: 'Amount Approved (excl. GST)',
              type: 'text',
              placeholder: 'Enter Amount Approved',
              required: true,
              disabled:
                !isValidVendor ||
                !isAccounts ||
                toBackend ||
                selectedRow?.approverStatusId !== ApproverStatus.Pending,
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
              // hidden:
              //   selectedRow?.approverStatusId !== ApproverStatus.Approved &&
              //   selectedRow?.fpNftReference === null,
              disabled:
                !isValidVendor ||
                !isAccounts ||
                // selectedRow?.approverStatusId !== ApproverStatus.Approved &&
                // selectedRow?.fpNftReference === null,
                toBackend,
              styles: {
                wrapper: 'flex flex-col gap-1',
                label: 'text-sm font-medium text-gray-500',
                input:
                  'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
              },
              value: formFields.hostBooks,
            },
            // {
            //   name: 'consultantSalarySplit',
            //   label: 'Consultant Salary Split Details',
            //   type: 'multiItems',
            //   ButtonDisabled: toBackend,
            //   itemFields: [
            //     {
            //       name: 'splitPercent',
            //       label: 'Split in %',
            //       type: 'number',
            //       placeholder: 'Enter Split %',
            //       disabled:
            //         !isAccounts ||
            //         // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            //         (isAccounts &&
            //           selectedRow?.approverStatusId !== ApproverStatus.Pending),
            //     },
            //     {
            //       name: 'costCentreName',
            //       label: 'Cost Center',
            //       type: 'select',
            //       placeholder: 'Select Center',
            //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            //       disabled:
            //         !isAccounts ||
            //         (isAccounts &&
            //           selectedRow?.approverStatusId !== ApproverStatus.Pending),
            //     },
            //     {
            //       name: 'costHeaderName',
            //       label: 'Cost Header',
            //       type: 'select',
            //       placeholder: 'Select Header',
            //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            //       disabled:
            //         !isAccounts ||
            //         (isAccounts &&
            //           selectedRow?.approverStatusId !== ApproverStatus.Pending),
            //     },
            //     {
            //       name: 'totalAmountNogst',
            //       label: 'Total Amount',
            //       type: 'number',
            //       placeholder: 'Enter Amount',
            //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            //       disabled:
            //         !isAccounts ||
            //         (isAccounts &&
            //           selectedRow?.approverStatusId !== ApproverStatus.Pending),
            //     },
            //     {
            //       name: 'amountApproved',
            //       label: 'Amount Approved',
            //       type: 'number',
            //       placeholder: 'Enter amount approved',
            //       disabled: disableApprovalFlow,
            //     },
            //     {
            //       name: 'toBeInvoiced',
            //       label: 'To Be Invoiced',
            //       type: 'select',
            //       referValue: 'toBeInvoiced',
            //       placeholder: 'Yes or No',
            //       // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            //       disabled:
            //         !isAccounts ||
            //         (isAccounts &&
            //           selectedRow?.approverStatusId !== ApproverStatus.Pending),
            //     },
            //     // {
            //     //     name: 'amount',
            //     //     label: 'Total Amount(Including GST)',
            //     //     type: 'number',
            //     //     placeholder: 'Enter total Amount',
            //     //     disabled: true,
            //     // },
            //   ],
            //   onChange(
            //     _name,
            //     value,
            //     form,
            //     editingField: 'splitPercent' | 'totalAmountNoGst',
            //   ) {
            //     const parentTotal =
            //       Number(form.state.values.totalAmountNoGst) || 0;
            //     const combos = new Set<string>();
            //     let runningTotal = 0;

            //     const updatedArray = value.map((item: any) => {
            //       const updated = { ...item };
            //       const key = `${item.costCentreName}::${item.costHeaderName}`;

            //       // Duplicate CC + CH combination
            //       if (
            //         item.costCentreName &&
            //         item.costHeaderName &&
            //         combos.has(key)
            //       ) {
            //         toast.error(
            //           'Duplicate combination removed. Please select a different Cost Centre or Cost Header.',
            //         );
            //         updated.costCentreId = 0;
            //         updated.costCentreName = '';
            //         updated.costHeaderId = 0;
            //         updated.costHeaderName = '';
            //       } else {
            //         combos.add(key);
            //       }

            //       const enteredPercent =
            //         item.splitPercent != null
            //           ? Number(item.splitPercent)
            //           : null;
            //       const enteredAmount =
            //         item.totalAmmountNogst != null
            //           ? Number(item.totalAmmountNogst)
            //           : null;

            //       if (
            //         editingField === 'splitPercent' &&
            //         enteredPercent != null
            //       ) {
            //         // User is editing split, calculate amount from split
            //         updated.totalAmmountNogst = Number(
            //           ((parentTotal * enteredPercent) / 100).toFixed(2),
            //         );
            //       } else if (
            //         editingField === 'totalAmountNoGst' &&
            //         enteredAmount != null
            //       ) {
            //         // User is editing amount, calculate split from amount
            //         updated.splitPercent = Number(
            //           (parentTotal > 0
            //             ? (enteredAmount / parentTotal) * 100
            //             : 0
            //           ).toFixed(2),
            //         );
            //       } else if (enteredPercent != null) {
            //         // fallback: only split is available
            //         updated.totalAmmountNogst = Number(
            //           ((parentTotal * enteredPercent) / 100).toFixed(2),
            //         );
            //       } else if (enteredAmount != null) {
            //         // fallback: only amount is available
            //         updated.splitPercent = Number(
            //           (parentTotal > 0
            //             ? (enteredAmount / parentTotal) * 100
            //             : 0
            //           ).toFixed(2),
            //         );
            //       }

            //       // Overflow check
            //       let newRunningTotal =
            //         runningTotal + Number(updated.totalAmmountNogst || 0);
            //       if (newRunningTotal > parentTotal) {
            //         toast.error(
            //           'Total split amount exceeds parent total amount.',
            //         );
            //         updated.totalAmmountNogst = 0;
            //         updated.splitPercent = 0;
            //         newRunningTotal = runningTotal;
            //       }
            //       runningTotal = newRunningTotal;

            //       // GST calculation
            //       if (updated.gstPercentage && updated.gstPercentage > 0) {
            //         const total = Number(updated.totalAmmountNogst || 0);
            //         const gst = Number(updated.gstPercentage);
            //         updated.amount = Number(
            //           (total + (total * gst) / 100).toFixed(2),
            //         );
            //       }

            //       return updated;
            //     });
            //     console.log(updatedArray, 'updatedArray');

            //     // form.setFieldValue("advanceConsumed", Number(finalUpdated.advanceConsumed.toFixed(2)));
            //     form.setFieldValue('consultantSalarySplit', updatedArray);
            //   },
            //   styles: {
            //     wrapper: 'flex flex-col gap-1',
            //     label: 'text-sm font-medium text-gray-500',
            //     input:
            //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
            //   },
            // },
          ]}
          label={''}
        />
      </div>
    );
  }

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

      const isConsultant = vendorExists?.vendorType.includes('Consultant');
      const isConsultantApproved =
        vendorExists?.approverStatusId === ApproverStatus.Approved;
      if (!vendorExists) {
        toast.error('Vendor does not exist or not verified yet.');
        setIsValidVendor(false);
        return;
      }
      if (!isConsultant) {
        toast.error('Vendor Type is not a Consultant.');
        setIsValidVendor(false);
        return;
      }
      if (!isConsultantApproved) {
        toast.error('Consultant is not approved yet.');
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
        selectedConsultantName: vendorExists?.vendorName || null,
        vendorId: vendorExists?.vendorId || null,
      };

      form.setFieldValue(
        'selectedConsultantName',
        vendorExists?.vendorName || null,
      );
      setFormFields(updatedValues);
    },
    1000, // 1s delay
  );

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

  function handleApprovalModal(approveStatus: boolean) {
    if (
      logTableValue.costCentreNames &&
      logTableValue.costCentreNames.length === 0 &&
      logTableValue.costHeaderNames &&
      logTableValue.costHeaderNames.length === 0
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
          required:
            logTableValue.amountApproved < logTableValue.totalSalaryAmount,
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
  }

  const headCells: Array<HeadCell> = [
    {
      label: 'Request Code',
      id: 'consultantSalaryReqCode',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Created By',
      id: 'createdByName',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      label: 'Created On',
      id: 'createdDate',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      label: 'Consultant Name',
      id: 'consultantName',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Invoice Number',
      id: 'invoiceNo',
      view: true,
      defaultView: true,
      filterable: true,
    },
    // {
    //   label: 'Email ID',
    //   id: 'emailId',
    //   view: true,
    //   defaultView: true,
    //   filterable: true,
    // },
    // {
    //   label: 'Site Name',
    //   id: 'siteName',
    //   view: true,
    //   defaultView: true,
    //   filterable: true,
    // },
    {
      label: 'Description',
      id: 'description',
      view: true,
      defaultView: true,
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
                maxWidth: '150px',
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
    {
      label: 'Total Salary Amount (excl. GST)',
      id: 'totalSalaryAmount',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Total GST Amount',
      id: 'totalGstAmount',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Total TDS Amount',
      id: 'totalTdsAmount',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Total Salary Amount (incl. GST)',
      id: 'totalAmountIncGst',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Amount Payable',
      id: 'amountPayable',
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
      label: 'Current Level',
      id: 'visualLevelId',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      label: 'Next Approver',
      id: 'nextApproverName',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      id: 'approverStatusName',
      label: 'Status',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'lastUpdatedByName',
      label: 'Updated By',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'lastUpdatedDate',
      label: 'Last Updated On',
      defaultView: false,
      view: false,
      filterable: false,
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

  const includedDownloadColumns = headCells.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id);
  
  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      setFormFields(row);
      setIsOpen(true);
    }
  }
  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    setIsValidVendor(false);
    setVendorHasGST(false);
  };
  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

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

    const removableKeys = [
      'createdBy',
      'lastUpdatedBy',
      'costCentreNames',
      'costHeaderNames',
      'siteNames',
    ];
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
    return Object.keys(logTableValue || {})
      .filter((key) => isNotEmpty(logTableValue[key]))
      .map((key) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }))
      .filter((hc) => !removableKeys.includes(hc.id));
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
      setLogTableValue(sorted);
    } else if (value === 'details') {
      setLogTableValue(search.consultantId ? consultantById : selectedRow);
    }
  }

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

  function handleCloseLog() {
    setIsOpen(false);
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    setIsValidVendor(false);
    setIsApprovalModalOpen(false);
    if (search.consultantId) {
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
      return;
    } else {
      navigate({
        to: '/employee/consultantSalary',
        replace: true,
      });
      return;
    }
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
    HostBooks = 9,
  }

  useEffect(() => {
    if (search.consultantId && consultantQueryById.data) {
      handleConsultantSalary(consultantQueryById.data);
    }
  }, [search.consultantId, consultantQueryById.data]);

  function handleConsultantSalary(row: Row): void {
    setIsLogOpen(true);
    setSelectedRow(row);
    setIsValidVendor(true);

    const splitAddedRow = {
      ...row,
      consultantSalarySplit:
        row.consultantSalarySplit && row.consultantSalarySplit.length > 0
          ? row.consultantSalarySplit.map((split: any) => {
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
                  (row.totalAmount > 0
                    ? ((split.totalAmountNogst || 0) / row.totalAmount) * 100
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
    };
    // setLogTableValue(splitAddedRow);
    // setFormFields(splitAddedRow);
    setLogTableValue(row);
    setFormFields(row);
    setSelectedConsultantId(row.consultantId);
  }

  const fields: Array<Field> = [
    {
      name: 'vendorName',
      label: 'Consultant Email / Code',
      type: 'text',
      placeholder: 'Consultant Email / Code',
      disabled: toBackend,
      required: true,
      onChange: (_name: string, value: any, form: any) => {
        // form.setFieldValue('emailId', value);
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
      name: 'selectedConsultantName',
      label: 'Consultant Name',
      type: 'text',
      placeholder: 'Consultant Name',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'invoiceNo',
      label: 'Invoice Number',
      type: 'text',
      placeholder: 'Invoice Number',
      disabled: !isValidVendor || toBackend,
      required: true,
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
      placeholder: 'Invoice Date',
      disabled: !isValidVendor || toBackend,
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // {
    //   name: 'siteNames',
    //   label: 'Site Names',
    //   type: 'multiSelect',
    //   placeholder: 'Site Names',
    //   disabled: !isValidVendor,
    //   required: true,
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-500',
    //     input:
    //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    //   },
    // },
    {
      name: 'totalSalaryAmount',
      label: 'Total Amount (excl. GST)',
      type: 'text',
      placeholder: 'Total Amount (excl. GST)',
      disabled: !isValidVendor || toBackend,
      required: true,
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
      disabled: !isValidVendor || !vendorHasGST || toBackend,
      required: true,
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
      placeholder: 'Description',
      // required: true,
      disabled: !isValidVendor || toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'invoiceFilepath',
      label: 'Invoice (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
      disabled: !isValidVendor || toBackend,
      required: true,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'invoiceFilePath', 'invoiceFileType');
      },
      // hidden: edit,
    },
    // {
    //   name: 'attendanceFilepath',
    //   label: 'Attendance (PDF, JPG, PNG)',
    //   type: 'file',
    //   placeholder: 'Choose File',
    //   acceptTypes: '.pdf,.jpg,.jpeg,.png',
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-600',
    //   },
    //   required: true,
    //   onChange: (name: string, value: any) => {
    //     setFormFields((prev: any) => ({
    //       ...prev,
    //       [name]: value[0].file.name,
    //       attendanceFileType: value[0].file.type.split('/')[1],
    //     }));
    //   },
    //   // hidden: edit,
    // },
  ];

  const isAccounts = useMemo(() => {
    return isPrimaryValidator(APPROVER_CATEGORY.CONSULTANT_SALARY);
  }, []);

  const shouldBeTrue = useMemo(() => {
    const isNonAccounts = !isAccounts;
    const levelMismatch = !(
      selectedRow &&
      selectedRow.levelId &&
      levelValidator(
        APPROVER_CATEGORY.CONSULTANT_SALARY,
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

  // console.log(shouldBeTrue, 'shouldBeTrue');

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

  const options = {
    // siteNames: siteDropdown.map((site: any) => site.siteName),
    costCentreNames: costCentreDropdown.map(
      (costCentre: any) => costCentre.costCentreName,
    ),
    costHeaderNames: costHeaderDropdown.map(
      (costHeader: any) => costHeader.costHeaderName,
    ),
    gstPercentage: [0, 1.25, 2.5, 5, 6, 12, 18, 40],

    hostBooks: ['No', 'Yes'],
    toBeInvoiced: ['No', 'Yes'],
    tdsPercentage: [0, 0.1, 1, 2, 5, 10, 12.5, 20, 30, 35, 40],
  };
  const formStyles = {
    pageName: 'Consultant Salary',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
    submitButton:
      'cursor-pointer border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const createConsultantSalaryMutation = useMutation({
    mutationKey: [ConsultantQueries.CREATE_CONSULTANT_SALARY],
    mutationFn: async (data: any) => {
      setToBackend(true);
      return await ConsultantServices.createConsultantSalary(data);
    },
    onSuccess: () => {
      toast.success('Salary created successfully!');
      invalidateQuery(ConsultantQueries.GET_All_Consultant_Salary);
      handleClose();
      handleCloseLog();
      setToBackend(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to create Salary!');
      setToBackend(false);
      console.error(error);
    },
  });

  const updateConsultantSalaryMutation = useMutation({
    mutationKey: [ConsultantQueries.UPDATE_CONSULTANT_SALARY],
    mutationFn: async (data: any) => {
      const response = await ConsultantServices.updateConsultantSalary(
        data.consultantId as number,
        data,
      );
      return response;
    },
    onSuccess: async (_response, variables) => {
      const { consultantId: id } = variables;
      const consultantSalaryData =
        await ConsultantServices.fetchConsultantSalaryById(id!);
      const modifedConsultantSalary = {
        ...consultantSalaryData,
        hostBooks:
          consultantSalaryData.hostBooks == false ||
          consultantSalaryData.hostBooks == undefined ||
          consultantSalaryData.hostBooks == 'No'
            ? 'No'
            : 'Yes',
      };
      console.log(modifedConsultantSalary, 'consultantSalaryData');

      toast.success('Salary updated successfully!');
      invalidateQuery(ConsultantQueries.GET_All_Consultant_Salary);
      setLogTableValue(modifedConsultantSalary);
      // handleClose();
      // handleCloseLog();
    },
    onError: (error: Error) => {
      toast.error('Failed to update Salary!');
      console.error(error);
    },
  });

  const approveConsultantMutation = useMutation({
    mutationKey: [ConsultantQueries.APPROVE_CONSULTANT_SALARY],
    mutationFn: async (data: any) => {
      setToApprovalBackend(true);
      return await ConsultantServices.approveConsultantSalary(data);
    },
    onSuccess: () => {
      setToApprovalBackend(false);
      toast.success('Employee Advance approved successfully!');
      invalidateQuery(ConsultantQueries.GET_All_Consultant_Salary);
      handleCloseLog();
      // handleClose();
    },
    onError: (error: any) => {
      setToApprovalBackend(false);
      toast.error('Failed to approve Employee Advance!');
      console.error(error);
    },
  });

  const rejectConsultantMutation = useMutation({
    mutationKey: [ConsultantServices.rejectConsultantSalary],
    mutationFn: async (data: any) => {
      setToRejectionBackend(true);
      return await ConsultantServices.rejectConsultantSalary(data);
    },
    onSuccess: () => {
      setToRejectionBackend(false);
      toast.success('Employee Advance rejected successfully!');
      invalidateQuery(ConsultantQueries.GET_All_Consultant_Salary);
      handleClose();
      handleCloseLog();
    },
    onError: (error: any) => {
      setToRejectionBackend(false);
      toast.error('Failed to reject Employee Advance!');
      console.error(error);
    },
  });

  const handleApproval = async (data: any) => {
    const payload: any = {
      consultantId: logTableValue.consultantId!,
      approvedBy: session.userId,
      isAccounts: session.roleName.toLowerCase() === 'accounts',
      amountApproved: Number(data.amountApproved),
      remarks: data.remarks,
    };

    if (data.amountApproved > logTableValue.amountApproved) {
      toast.error(
        'Amount Approved cannot be greater than Already Approved Amount',
      );
      return;
    }

    const isUpdatedSuccess = await onUpdate({
      ...logTableValue,
      amountApproved: Number(data.amountApproved),
      amountPayable:
        Number(data.amountApproved) +
        (Number(logTableValue.gstPercentage) / 100) *
          Number(data.amountApproved) -
        (Number(logTableValue.tdsPercentage || 0) / 100) *
          Number(data.amountApproved),
    });
    if (!isUpdatedSuccess) {
      toast.error('Failed to approve Consultant Salary due to update error!');
      return;
    }

    try {
      await approveConsultantMutation.mutateAsync(payload);
      toast.success('Consultant Salary approved successfully');
      if (search.consultantId) {
        navigate({
          to: '/po/consolidatedDashboard',
          replace: true,
        });
        return;
      }
    } catch (error) {
      console.error('Approval failed', error);
      toast.error('Consultant Salary approval failed');
    }
  };

  const handleReject = (data: any) => {
    if (!selectedRow) return;
    const payload: any = {
      consultantId: selectedRow.consultantId!,
      rejectedBy: session.userId,
      levelId: +sessionStorage.getItem('levelId')!,
      remarks: data.remarks,
    };
    console.log(payload, 'payload');

    rejectConsultantMutation.mutate(payload);
  };
  async function onSubmit(data: any) {
    if (!isValidFile(data.invoiceFilepath)) {
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
    // setToBackend(true);
    const payload = {
      ...data,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      // dateOfPayment: dayjs().toISOString(),
      invoiceDate: data.invoiceDate
        ? dayjs(data.invoiceDate).toISOString()
        : null,
      invoiceFileType: data.invoiceFileType,
      // attendanceFileType: formFields.attendanceFileType,
      // siteIds: siteDropdown
      //   .filter((site: any) => data.siteNames.includes(site.siteName))
      //   .map((site: any) => site.siteId),
      gstPercentage: Number(data.gstPercentage || 0),
      consultantName: formFields.selectedConsultantName,
      amountPayable:
        Number(data.totalSalaryAmount) +
        (Number(data.gstPercentage || 0) / 100) *
          Number(data.totalSalaryAmount),
      approverStatusId: 1,
      vendorId: vendor.vendorId,
      organizationId: sessionStorage.getItem('organizationId'),
    };
    console.log(payload, 'payloadTest');
    // console.log({
    //   po: data.invoiceFilepath,
    // })
    await createConsultantSalaryMutation.mutateAsync(payload);
  }

  async function onUpdate(data: any) {
    if (data.amountApproved > data.totalSalaryAmount) {
      toast.error('Amount Approved cannot be greater than Total Salary Amount');
      return;
    }
    const vendor = vendorDropdown.find(
      (v) =>
        v.emailId === data.vendorName ||
        v.vendorName === data.vendorName ||
        v.vendorCode === data.vendorName ||
        v.vendorId === data.vendorId,
    );
    console.log(vendor, data, 'dataTestLog');

    if (!vendor) {
      toast.error('Vendor not found or unverified');
      return;
    }
    setToBackend(true);
    const payload = {
      consultantId: data.consultantId,
      vendorId: vendor.vendorId,
      consultantSalaryReqCode: data.consultantSalaryReqCode,
      invoiceNo: data.invoiceNo,
      invoiceDate: data.invoiceDate,
      totalSalaryAmount: Number(data.totalSalaryAmount),
      gstPercentage: Number(data.gstPercentage),
      lastUpdatedBy: session.userId,
      tdsPercentage: Number(data.tdsPercentage) || 0,
      costCentreIds: data.costCentreIds,
      costHeaderIds: data.costHeaderIds,
      hostBooks: data.hostBooks == 'Yes' ? true : false,
      totalAmountIncGst: data.totalAmountIncGst,
      amountApproved: data.amountApproved,
      consultantName: data.consultantName,
      approverStatusId: data.approverStatusId,
      levelId: data.levelId,
      invoiceFilepath: data.invoiceFilepath,
      attendanceFilepath: data.attendanceFilepath,
      description: data.description,
      organizationId:
        data.organizationId || sessionStorage.getItem('organizationId'),
      amountPayable:
        Number(data.amountApproved) +
        (Number(data.gstPercentage) / 100) * Number(data.amountApproved) -
        (Number(data.tdsPercentage || 0) / 100) * Number(data.amountApproved),
      invoiceFileType: data.invoiceFileType,
      // invoiceFileType:
      //   data.invoiceFilepath.split('.')[
      //     data.invoiceFilepath.split('.').length - 1
      //   ],
      // attendanceFileType:
      //   data.attendanceFilepath.split('.')[
      //     data.attendanceFilepath.split('.').length - 1
      //   ],
    };
    console.log(payload, 'payloadTest');
    try {
      await updateConsultantSalaryMutation.mutateAsync(payload);
      setLogTableValue((prev: any) => ({ ...prev, ...payload }));
      setSelectedRow((prev: any) => ({ ...prev, ...payload }));
      setFormFields((prev: any) => ({ ...prev, ...payload }));
      if (search.consultantId) {
        window.location.reload();
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      setToBackend(false);
    }
  }
  return (
    <div className="m-2.5 h-[60vh]">
      {consultantQuery.isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
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
              pageName="Consultant Salary"
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
              clickableColumn="consultantSalaryReqCode"
              onClick={handleConsultantSalary}
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
                  label={'Create New Consultant Salary'}
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
                    amountApproved: logTableValue?.amountApproved || 0,
                    remarks: null,
                  }}
                  submitFunction={(data) =>
                    isApproved ? handleApproval(data) : handleReject(data)
                  }
                  onClose={() => setIsApprovalModalOpen(false)}
                  fields={approvalModalFields!}
                  options={{}}
                  styles={formStyles}
                  label={isApproved ? 'Approve Salary' : 'Reject Salary'}
                  buttonLabel={
                    isApproved
                      ? toApprovalBackend
                        ? 'Approving '
                        : 'Approve'
                      : toRejectionBackend
                        ? 'Rejecting '
                        : 'Reject'
                  }
                  toBackend={
                    isApproved ? toApprovalBackend : toRejectionBackend
                  }
                />
              </Modal>
            </div>
          )}

          {isLogOpen && (
            <LogPopup
              open={isLogOpen}
              onClose={handleCloseLog}
              pageName="Consultant Salary"
              row={logTableValue}
              headcells={headcells}
              tabList={tabList}
              tabsValue={logTabsValue}
              onTabChange={(val: string) => handleLogsTabChange(val)}
              footerActions={
                <>
                  <Button
                    onClick={() => handleApprovalModal(false)}
                    disabled={disableApprovalFlow}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Reject
                  </Button>

                  <Button
                    onClick={() => handleApprovalModal(true)}
                    disabled={disableApprovalFlow}
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
