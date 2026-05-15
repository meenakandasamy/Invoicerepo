import { baseUrl } from './baseUrl';
import { formatObjectToPieData } from '@/utils/common/ObjectToPieDataMapper';

export enum DASHBOARD_QUERY {
  GET_DASHBOARD_DATA = 'getDashboardData',
  GET_REQUEST_COUNT = 'getRequestCountDashboard',
  GET_APPROVER_COUNT = 'getApproverCountDashboard',
  GET_REQUEST_AMOUNT = 'getRequestAmountDashboard',
  GET_ALL_BALANCE_PAYABLE = 'getAllBalancePayable',
  GET_ALL_PO_SUMMARY = 'getAllPoSummary',
}

enum dashboardServiceEndPoints {
  getRequestCount = import.meta.env.VITE_GET_REQ_COUNT,
  getApproverCount = import.meta.env.VITE_GET_APPROVER_COUNT,
  getRequestAmount = import.meta.env.VITE_GET_REQ_AMOUNT_COUNT,
  getAllBalancePayable = import.meta.env.VITE_GET_ALL_BALANCE_PAYABLE,
  getAllPoSummary = import.meta.env.VITE_GET_ALL_PO_SUMMARY,
}

const getRequestCount = async ({ reqKey }: { reqKey: string }) => {
  try {
    const response = await baseUrl.get(
      `${dashboardServiceEndPoints.getRequestCount}?${reqKey}`,
    );

    const data = formatObjectToPieData(response.data);
    console.log(data);

    return data;
  } catch (error: any) {
    console.error('Error fetching request count:', error.message);
    throw error;
  }
};

const getApproverCount = async ({ approverKey }: { approverKey: string }) => {
  try {
    const response = await baseUrl.get(
      `${dashboardServiceEndPoints.getApproverCount}/${approverKey}`,
    );
    const data = transformApproverData(response.data);
    console.log(data);

    return data[0];
  } catch (error: any) {
    console.error('Error fetching request count:', error.message);
    throw error;
  }
};

const getRequestAmount = async ({ reqKey }: { reqKey: string }) => {
  try {
    const response = await baseUrl.get(
      `${dashboardServiceEndPoints.getRequestAmount}?${reqKey}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching request count:', error.message);
    throw error;
  }
};

const getDashboardData = async (keys: {
  reqKey: string;
  approverKey: string;
}) => {
  const [requestCount, approverCount, requestAmount] = await Promise.all([
    getRequestCount(keys),
    getApproverCount(keys),
    getRequestAmount(keys),
  ]);
  return { requestCount, approverCount, requestAmount };
};

const getAllBalancePayable = async () => {
  try {
    const response = await baseUrl.get(
      `${dashboardServiceEndPoints.getAllBalancePayable}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching request count:', error.message);
    throw error;
  }
};

const getAllPoSummary = async () => {
  try {
    const response = await baseUrl.get(
      `${dashboardServiceEndPoints.getAllPoSummary}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching request count:', error.message);
    throw error;
  }
};

export const DashboardServices = {
  getRequestCount,
  getApproverCount,
  getRequestAmount,
  getDashboardData,
  getAllBalancePayable,
  getAllPoSummary,
};

// Type definitions
interface Request {
  requestId: number;
  requestorName: string;
  description: string;
  taxableValue: number;
}

interface Approver {
  approverName: string;
  requests: Array<Request>;
  count: number;
}

interface ApproverCount {
  approverName: string;
  count: number;
}

interface FlatRequest extends Request {
  approverName: string;
}

// Function with types
function transformApproverData(data: Array<Approver>):
  | Array<{
      approverCounts: Array<ApproverCount>;
      flatRequests: Array<FlatRequest>;
    }>
  | [] {
  const approverCounts: Array<ApproverCount> = [];
  const flatRequests: Array<FlatRequest> = [];

  data.forEach((approver) => {
    // Extract approverName and count
    approverCounts.push({
      approverName: approver.approverName,
      count: approver.count,
    });

    // Flatten requests and add approverName to each
    approver.requests.forEach((request) => {
      flatRequests.push({
        ...request,
        approverName: approver.approverName,
      });
    });
  });

  if (approverCounts.length === 0 && flatRequests.length === 0) {
    return [];
  }

  return [
    {
      approverCounts,
      flatRequests,
    },
  ];
}
