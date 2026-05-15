import {
  BadgeIndianRupee,
  BanknoteArrowDown,
  ClipboardCheck,
  IndianRupee,
  Receipt,
  Scale3D,
  ScrollText,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { Header } from './Header';
import { InvoiceStatsCard } from './InvoiceSummary';
import { VendorScrollList } from './VendorList';
import type { Vendor } from './VendorList';
import type { FieldConfig, InvoiceData } from './InvoiceSummary';
import { PieChart } from '@/charts/PieChart';
import {
  PurchaseOrderQuery,
  PurschaseOrderService,
} from '@/integrations/Services/purchaseOrderService';
import { useQueriesFn } from '@/utils/common/queryUtils';
import Loader from '@/utils/common/components/loader';
import { DASHBOARD_QUERY, DashboardServices } from '@/integrations/Services/dashboardService';


function convertToVendors(input: Array<BalancePayable> | undefined | null): Array<Vendor> | [] {
  if (!input) return [];
  return input.map(v => ({
    id: v.vendorId,
    name: v.vendorName,
    code: v.vendorCode,
    unpaidAmount: v.totalPayableAmount,
    pendingPO: v.pendingCount
  }));
}


const ApprovalDashboard = () => {
  const { data: response, isLoading, isError } = useQueriesFn([
    {
      api: PurschaseOrderService.FetchTotalSum,
      queryKey: PurchaseOrderQuery.GET_TOTAL_SUM,
    },
    {
      api: DashboardServices.getAllBalancePayable,
      queryKey: DASHBOARD_QUERY.GET_ALL_BALANCE_PAYABLE,
    },
    {
      api: DashboardServices.getAllPoSummary,
      queryKey: DASHBOARD_QUERY.GET_ALL_PO_SUMMARY,
    }
  ]);

  const [totalData, balancePayable, poSummary] = response;

  const invoiceData: TotalPoValueSummaryItem | null = useMemo(() => {
    return { ...totalData, noOfInstallments: poSummary?.noOfInstallments ?? 0 };
  }, [totalData, poSummary])

  const vendorData = useMemo(() => {
    return convertToVendors(balancePayable);
  }, [balancePayable]);

  const poSummaryData: AllPoSummaryResponse | null = useMemo(() => {
    return poSummary;
  }, [poSummary]);

  const paymentSummaryPieData = useMemo(() => {
    if (!invoiceData) return [];
    const SummaryData = invoiceData;
    const paid = SummaryData.amountPaid;
    const balance = SummaryData.balancePayable;
    return [
      ['Paid', paid],
      ['Balance', balance],
    ];
  }, [invoiceData]);

  const PoSummaryPieData = useMemo(() => {
    if (!poSummaryData) return [];
    const SummaryData = poSummaryData;
    const completed = SummaryData.zerobalancePayable;
    const pending = SummaryData.poId - SummaryData.zerobalancePayable;
    return [
      ['Completed', completed],
      ['Pending', pending],
    ];
  }, [poSummaryData]);

  function onFilterChange() {
    console.log('Filter Change');
  }

  const fields: Array<FieldConfig> = [
    {
      label: 'Total Invoice',
      key: 'totalInvoiceValue',
      icon: <Receipt size={20} />,
    },
    {
      label: 'Taxable Value',
      key: 'povalueExcludeGst',
      icon: <Scale3D size={20} />,
    },
    { label: 'Amount Paid', key: 'amountPaid', icon: <Wallet size={20} /> },
    {
      label: 'Balance Payable',
      key: 'balancePayable',
      icon: <IndianRupee size={20} />,
    },
    {
      label: 'GST Value',
      key: 'gstValue',
      icon: <BadgeIndianRupee size={20} />,
    },
    { label: 'TDS', key: 'tdsValue', icon: <BanknoteArrowDown size={20} /> },
    { label: 'Total POs', key: 'totalPos', icon: <ScrollText size={20} /> },
    {
      label: 'No of Installments',
      key: 'noOfInstallments',
      icon: <ClipboardCheck size={20} />,
    },
  ];

  if (isLoading) return <Loader/>;

  if (isError) {
    toast.error('Error fetching dashboard data');
    return (
      <div className="space-y-6 p-6 ">
        <Header
          onFilterChange={onFilterChange}
          filterFields={[
            { id: 'status', label: 'Status', placeholder: 'Enter status' },
            {
              id: 'approver',
              label: 'Approver',
              placeholder: 'Enter approver',
            },
          ]}
          hide={{ tab: true }}
          filterButtonLabel="Apply"
          tooltipText="Open filters"
        />

        <h2 className="text-lg font-semibold mb-4">
          Error fetching dashboard data
        </h2>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex flex-row gap-2 flex-wrap">
        {/* Row 2 */}
        <div className="flex flex-col gap-2 flex-wrap">
          <InvoiceStatsCard
            data={invoiceData as InvoiceData}
            fields={fields}
            title="Breakdown Summary"
            currency="INR"
            locale="en-IN"
            direction="horizontal"
            height="h-[30dvh]"
            width="w-[60dvw]"
            className="mb-4"
          />
          <div className="flex justify-between w-[60dvw]">
            <div className="h-[36dvh] w-[40dvw] ml-2 lg:w-[20dvw] lg:h-[34dvh] xl:w-[25dvw] xl:h-[38dvh]">
              <PieChart
                requestData={PoSummaryPieData}
                groupBy={(d) => d[0]}
                aggregateFn={(values) => values[0][1]}
                totalLabel="POs"
                title="PO Summary"
                outerRadius={90}
              />
            </div>
            <div className="h-[36dvh] w-[40dvw] mr-40 lg:mr-30 lg:w-[20dvw] lg:h-[34dvh] xl:w-[25dvw] xl:h-[38dvh]">
              <PieChart
                requestData={paymentSummaryPieData}
                groupBy={(d) => d[0]}
                aggregateFn={(values) => values[0][1]}
                totalLabel="Amount"
                title="Payment Summary"
                outerRadius={90}
              />
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex gap-4 flex-wrap">
          <div className="h-[68dvh] w-[50dvh] ml-4 lg:w-[25dvw] lg:h-[68dvh] xl:w-[28dvw]">
            <VendorScrollList vendorList={vendorData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDashboard;
