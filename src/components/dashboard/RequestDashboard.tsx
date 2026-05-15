import { toast } from 'sonner';
import * as d3 from 'd3';
import { Header } from './Header';
import { ValueCard } from './ValueCard';
import { PieChart } from '@/charts/PieChart';
import { BarChart } from '@/charts/BarChart';
import { useQueriesFn } from '@/utils/common/queryUtils';
import {
  DASHBOARD_QUERY,
  DashboardServices,
} from '@/integrations/Services/dashboardService';
import Loader from '@/utils/common/components/loader';
import { GetSessionCookie } from '@/utils/common/cookieHandler';

export interface DashboardRequestCount {
  requestorValue: number;
  approvedValue: number;
  rejectedValue: number;
  pendingValue: number;
  inprogressValue: number;
}

const RequestDashboard = () => {
  const {
    data: response,
    isLoading,
    isError,
  } = useQueriesFn([
    {
      api: DashboardServices.getRequestCount,
      queryKey: DASHBOARD_QUERY.GET_DASHBOARD_DATA as string,
      id: { reqKey: `userId=${GetSessionCookie()?.userId}` },
    },
    {
      api: DashboardServices.getApproverCount,
      queryKey: DASHBOARD_QUERY.GET_APPROVER_COUNT as string,
      id: { approverKey: GetSessionCookie()?.userId },
    },
    {
      api: DashboardServices.getRequestAmount,
      queryKey: DASHBOARD_QUERY.GET_REQUEST_AMOUNT as string,
      id: { reqKey: `userId=${GetSessionCookie()?.userId}` },
    },
  ]);

  const [pie, bar, amount] = response;

  function onTabChange(value: string) {
    console.log(value);
  }

  function onFilterChange() {
    console.log('Filter Change');
  }

  if (isLoading) return <Loader />;

  if (isError) {
    toast.error('Error fetching dashboard data');
    return (
      <div className="flex space-y-6 p-6 flex-1 justify-center items-center">
        <h2 className="text-lg font-semibold mb-4">
          Error fetching dashboard data
        </h2>
      </div>
    );
  }

  if (pie.data?.length === 0 && bar.data?.length === 0) {
    return (
      <div className="space-y-6 p-6 ">
        <Header
          onTabChange={onTabChange}
          onFilterChange={onFilterChange}
          tabs={[
            { label: 'Requests', value: 'requests' },
            { label: 'Approvals', value: 'approvals' },
          ]}
          filterFields={[
            { id: 'status', label: 'Status', placeholder: 'Enter status' },
            {
              id: 'approver',
              label: 'Approver',
              placeholder: 'Enter approver',
            },
          ]}
          filterButtonLabel="Apply"
          tooltipText="Open filters"
        />

        <div className="flex justify-center items-center space-x-4">
          <h2 className="text-lg font-semibold mb-4">No requests found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[58.5dvh] mt-6">
      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-6 mt-4">
        <ValueCard
          title="Request Summary"
          values={[
            {
              label: 'Total Request Amount:',
              value: `$${amount.requestorValue.toLocaleString()}`,
            },
            {
              label: 'Approved Amount:',
              value: `$${amount.approvedValue.toLocaleString()}`,
              colorClass: 'text-green-600',
            },
            {
              label: 'Rejected Amount:',
              value: `$${amount.rejectedValue.toLocaleString()}`,
              colorClass: 'text-red-600',
            },
          ]}
          heightClass="h-[55dvh]"
          widthClass="w-[65dvh]"
        />
        <div className="h-[50dvh] w-[80dvh] ml-8">
          <PieChart
            requestData={pie}
            groupBy={(d) => d[0]}
            aggregateFn={(values) => values[0][1]}
            totalLabel="Requests"
            title="Total Requests"
            outerRadius={90}
            innerRadius={50}
            legendPosition="left"
            titleClass="font-semibold"
          />
        </div>
        {/* <ApprovalList
                    requestData={bar.data.flatRequests}
                    labelMap={{
                        requestId: "Request ID",
                        taxableValue: "Amount",
                        approverName: "Approver",
                    }}
                    style={{ maxHeight: 230, overflowY: "auto" }}
                /> */}

        <div className="h-[50dvh] w-[50dvh] ml-5">
          <BarChart
            requestData={bar.approverCounts}
            barLabel="Requests"
            title="Requests by Approver"
            xAxisLabel="Requests"
            yAxisLabel="Approvers"
            groupBy="approverName"
            aggregateFn={(items) => d3.sum(items, (d) => d.count)}
            orientation="horizontal"
          />
        </div>
      </div>

      {/* Row 3 */}
      {/* <div className="grid grid-cols-2 gap-6">
                <div style={{ width: "300px", height: "300px" }}>
                    <BarChart
                        requestData={bar.data.approverCounts}
                        barLabel='Requests'
                        title='Requests by Approver'
                        xAxisLabel='Requests'
                        yAxisLabel='Approvers'
                        groupBy="approverName"
                        aggregateFn={(items) => d3.sum(items, (d) => d.count)}
                        orientation="horizontal"
                    />
                </div>
                <div className="h-32 border-dashed border-2 border-gray-300 rounded-md flex items-center justify-center text-gray-500">
                    Future content goes here...
                </div>
            </div> */}
    </div>
  );
};

export default RequestDashboard;
