import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { CustomTable } from '../table/customTable';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import LogPopup from '../layout/LogPopup';
import { Button } from '../ui/button';
import type { JSX } from 'react';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import Loader from '@/utils/common/components/loader';
import { useConslidatedDashboard } from '@/hooks/data/useConsolidatedDashboard';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { INTL_UTILS } from '@/utils/common/IntlUtils';
import { MODULE } from '@/integrations/Services/consolidatedService';

interface ConsolidatedDashboardProps extends BaseProps {}

export default function ConsolidatedDashboardPage(
  props: ConsolidatedDashboardProps,
): JSX.Element {
  const navigate = useNavigate({
    from: '/po/consolidatedDashboard',
  });

  const consildatedDataQuery = useConslidatedDashboard(props.session);
  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();

  const allConsildatedData = useMemo(
    () => consildatedDataQuery.data ?? [],
    [consildatedDataQuery.data],
  );

  const [tableValue, setTableValue] = useState<Array<Row>>(allConsildatedData);
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

  const costHeadersDropdown = useMemo(
    () => CostHeaderQuery.data ?? [],
    [CostHeaderQuery.data],
  );
  const costCentersDropdown = useMemo(
    () => CostCenterQuery.data ?? [],
    [CostCenterQuery.data],
  );

  const isDependentLoading =
    CostHeaderQuery.isLoading ||
    CostCenterQuery.isLoading ||
    consildatedDataQuery.isLoading ||
    CostHeaderQuery.isFetching ||
    CostCenterQuery.isFetching ||
    consildatedDataQuery.isFetching;

  useEffect(() => {
    switch (tabsValue) {
      case 'all':
        setTableValue(allConsildatedData);
        break;
      case 'expenses':
        setTableValue(() => {
          return allConsildatedData.filter(
            (vendorAdvance) => vendorAdvance.module === MODULE.EXPENDITURE,
          );
        });
        break;
      case 'advance':
        setTableValue(() => {
          return allConsildatedData.filter(
            (vendorAdvance) => vendorAdvance.module === MODULE.VENDOR_ADVANCE,
          );
        });
        break;

      case 'rent':
        setTableValue(() => {
          return allConsildatedData.filter(
            (vendorAdvance) => vendorAdvance.module === MODULE.VENDOR_RENT,
          );
        });
        break;
      case 'vendorRegistration':
        setTableValue(() => {
          return allConsildatedData.filter(
            (vendorAdvance) =>
              vendorAdvance.module === MODULE.VENDOR_REGISTRATION,
          );
        });
        break;
      case 'reimbrusement':
        setTableValue(() => {
          return allConsildatedData.filter(
            (vendorAdvance) =>
              vendorAdvance.module === MODULE.EMPLOYEE_REIMBURSEMENT,
          );
        });
        break;
      case 'consultantSalary':
        setTableValue(() => {
          return allConsildatedData.filter(
            (vendorAdvance) =>
              vendorAdvance.module === MODULE.CONSULTANT_SALARY,
          );
        });
        break;
      default:
        setTableValue(allConsildatedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsValue, allConsildatedData]);

  const tabsCount = useMemo(() => {
    const all = allConsildatedData.length;

    const expenses = allConsildatedData.filter(
      (item) => item.module === MODULE.EXPENDITURE,
    ).length;

    const advance = allConsildatedData.filter(
      (item) => item.module === MODULE.VENDOR_ADVANCE,
    ).length;

    const rent = allConsildatedData.filter(
      (item) => item.module === MODULE.VENDOR_RENT,
    ).length;

    const vendorRegistration = allConsildatedData.filter(
      (item) => item.module === MODULE.VENDOR_REGISTRATION,
    ).length;

    const reimbrusement = allConsildatedData.filter(
      (item) => item.module === MODULE.EMPLOYEE_REIMBURSEMENT,
    ).length;

    const consultantSalary = allConsildatedData.filter(
      (item) => item.module === MODULE.CONSULTANT_SALARY,
    ).length;

    return {
      all,
      expenses,
      advance,
      rent,
      vendorRegistration,
      reimbrusement,
      consultantSalary,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allConsildatedData]);

  const headCells: Array<HeadCell> = [
    {
      id: 'code',
      label: 'Unique Code',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'moduleName',
      label: 'Module Name',
      defaultView: true,
      filterable: true,
      filterOptions: [
        'Expenditure',
        'Vendor Advance',
        'Employee Reimbursement',
        'Vendor Registration',
        'Consultant Salary',
        'Vendor Rent',
      ],
      view: true,
    },
    {
      id: 'vendorName',
      label: 'Vendor Name',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'costCentreNames',
      label: 'Cost Center',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: costCentersDropdown.map((c) => c.costCentreName),
    },
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
      id: 'totalAmount',
      label: 'Total Amount',
      defaultView: true,
      view: true,
      filterable: true,
      visualFormat: (data: number) =>
        INTL_UTILS.formatCurrency({
          value: data,
        }),
    },
    {
      id: 'createdDate',
      label: 'Created Date',
      defaultView: true,
      view: true,
      filterable: true,
    },
    // Uncomment if actions are needed
    // {
    //   id: 'action',
    //   label: 'Action',
    //   defaultView: true,
    //   view: true,
    // },
  ];

  const includedDownloadColumns = headCells.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id);

  const [logTabsValue, setLogTabsValue] = useState('details');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logTableValue, setLogTableValue] = useState<Row | null>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);

  const logHeadcells = useMemo(() => {
    if (!logTableValue) return [];
    if (logTabsValue === 'logs') {
      return [
        { id: 'action', label: 'Action' },
        { id: 'changes', label: 'Changes' },
        { id: 'occuredOn', label: 'Occured On' },
        { id: 'updatedBy', label: 'Updated By' },
      ];
    }

    return Object.keys(logTableValue).map((key) => ({
      id: key,
      label:
        key === 'totalAmmountNoGst'
          ? 'Total Amount (Excl. GST)'
          : key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }, [logTableValue, logTabsValue]);

  const handleLogPopup = async (row: Row | Promise<Row>) => {
    const resolvedRow = await Promise.resolve(row);
    // setIsLogOpen(true);
    // setLogTableValue(resolvedRow);
    // setSelectedRow(resolvedRow);
    handleRedirect(resolvedRow);
  };

  function handleCloseLog() {
    setIsLogOpen(false);
  }

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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const ObjectTable = ({ data }: { data: Array<any> }) => {
    if (!Array.isArray(data) || data.length === 0 || data.every((d) => !d))
      return '-';

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
      const id = hc.id;
      if (id.endsWith('Id') || id.endsWith('Type') || id.endsWith('Ids'))
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
    // {
    //     value: 'logs',
    //     label: 'Logs',
    //     component: DetailTable,
    //     className:
    //         'w-full max-w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700',
    // },
  ];

  function handleLogsTabChange(value: string) {
    setLogTabsValue(value);
    if (value === 'logs') {
      // const formattedLogs = formatLogs(logs);
      // setLogTableValue(formattedLogs);
    } else if (value === 'details') {
      setLogTableValue(selectedRow);
    }
  }

  function handleRedirect(resolvedRow: any) {
    const module = resolvedRow?.module;
    if (!module) {
      toast.error('Module not detected');
      return;
    }
    console.log(module);

    let path = '';
    let query = '';

    switch (module) {
      case MODULE.EXPENDITURE:
        path = '/vendor_expenditure/expenses';
        query = `?expenseId=${resolvedRow.expenseId}`;
        break;
      case MODULE.EMPLOYEE_REIMBURSEMENT:
        path = '/employee/reimbursement';
        query = `?employeeReimbursementId=${resolvedRow.employeeReimbursementId}`;
        break;
      case MODULE.VENDOR_ADVANCE:
        path = '/vendor_expenditure/advance';
        query = `?vendorAdvanceId=${resolvedRow.vendorAdvanceId}`;
        break;
      case MODULE.VENDOR_REGISTRATION:
        path = '/po/vendor';
        query = `?vendorId=${resolvedRow.vendorId}`;
        break;
      case MODULE.VENDOR_RENT:
        path = '/vendor_expenditure/rent';
        query = `?vendorRentId=${resolvedRow.vendorRentId}`;
        break;
      case MODULE.CONSULTANT_SALARY:
        path = '/employee/consultantSalary';
        query = `?consultantId=${resolvedRow.consultantId}`;
        break;
      default:
        toast.error('Module not found');
        return;
    }

    navigate({ to: path + query });
  }
  // console.log(
  //   consildatedDataQuery.isLoading,
  //   consildatedDataQuery.isFetching,
  //   'consildatedDataQuery.isLoading || consildatedDataQuery.isFetching',
  // );

  return (
    <div className="m-2.5 h-[80%]">
      {isDependentLoading ? (
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
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFEDD5] text-xs font-medium text-[#9A3412]">
                    {tabsCount.all}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="vendorRegistration"
                onClick={() => setTabsValue('vendorRegistration')}
              >
                Vendor
                {tabsCount.vendorRegistration > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFEDD5] text-xs font-medium text-[#9A3412]">
                    {tabsCount.vendorRegistration}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="expenses"
                onClick={() => setTabsValue('expenses')}
              >
                Expenses
                {tabsCount.expenses > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFEDD5] text-xs font-medium text-[#9A3412]">
                    {tabsCount.expenses}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="advance"
                onClick={() => setTabsValue('advance')}
              >
                Advance
                {tabsCount.advance > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFEDD5] text-xs font-medium text-[#9A3412]">
                    {tabsCount.advance}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger value="rent" onClick={() => setTabsValue('rent')}>
                Rent
                {tabsCount.rent > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFEDD5] text-xs font-medium text-[#9A3412]">
                    {tabsCount.rent}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="reimbrusement"
                onClick={() => setTabsValue('reimbrusement')}
              >
                Reimbursement
                {tabsCount.reimbrusement > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFEDD5] text-xs font-medium text-[#9A3412]">
                    {tabsCount.reimbrusement}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="consultantSalary"
                onClick={() => setTabsValue('consultantSalary')}
              >
                Consultant
                {tabsCount.consultantSalary > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFEDD5] text-xs font-medium text-[#9A3412]">
                    {tabsCount.consultantSalary}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName="Consildated Dashboard"
            // functions={allFunctions}
            access={{
              hasCreateAccess: false,
              hasUpdateAccess: false,
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
            clickableColumn={'code'}
            onClick={handleLogPopup}
          />
        </section>
      )}
      {isLogOpen && (
        <LogPopup
          open={isLogOpen}
          onClose={handleCloseLog}
          pageName="approval Dashboard"
          row={logTableValue}
          headcells={logHeadcells}
          tabList={tabList}
          tabsValue={logTabsValue}
          onTabChange={(val: any) => handleLogsTabChange(val)}
          footerActions={
            <>
              <Button
                // onClick={() => handleRedirect()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                To Approval
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
