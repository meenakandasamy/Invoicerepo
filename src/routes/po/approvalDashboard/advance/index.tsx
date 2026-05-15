import React from 'react';
import {
  createFileRoute,
  redirect,
  useRouteContext,
} from '@tanstack/react-router';
import type { RequestData } from '@/types/requestor';
import type { QueryConfig } from '@/utils/common/queryUtils';
import type { HeadCell } from '@/types/table';
import { GetSessionCookie } from '@/utils/common/cookieHandler';
import { getAccessPermissions } from '@/utils/common/permissions';
import {
  useDependentQueriesWithId,
  useMutationFn,
  useQueriesFn,
} from '@/utils/common/queryUtils';
import ApprovalDashboard from '@/components/approvalDashboard/ApprovalDashboard';
import Loader from '@/utils/common/components/loader';
import {
  advanceApprovalQueries,
  advanceApprovalServices,
} from '@/integrations/Services/advanceApprovalServices';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

export const Route = createFileRoute('/po/approvalDashboard/advance/')({
  beforeLoad: async function (ctx) {
    const { location } = ctx;
    const context: Session | null = await GetSessionCookie();
    if (!context) {
      const fullPath = location.pathname;
      throw redirect({
        to: '/login',
        search: { to: fullPath },
      });
    }

    const {
      view: hasAccess,
      create: hasCreateAccess,
      edit: hasUpdateAccess,
    } = getAccessPermissions(context, 'approvalDashboard');

    if (!hasAccess) {
      const fullPath = location.pathname;
      throw redirect({
        to: '/login',
        search: { to: fullPath },
      });
    }

    return { hasCreateAccess, hasUpdateAccess, session: context };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/po/approvalDashboard/advance/',
  });

  // States:
  const [allRequests, setAllRequests] = React.useState<Array<RequestData>>([]);

  // API calls:

  const isOEM = session.userTypeName === 'OEM';
  const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } =
    EIRASAAS_API_QUERIES;
  const { GetSiteListDropdownByCompany, GetSiteListDropdownByCustomer } =
    EirasaasAPIs;
  const siteQueries: Array<QueryConfig> = [
    {
      queryKey: isOEM ? GET_SITELIST_BY_COMPANY : GET_SITELIST_BY_CUSTOMER,
      api: isOEM
        ? GetSiteListDropdownByCompany
        : GetSiteListDropdownByCustomer,
      setState: () => { },
      id: isOEM ? session.companyId : session.customerId,
    },
  ];

  const {
    status,
    data: [response],
  } = useQueriesFn(siteQueries);

  const dependentLogic = (response1: any, response2: any) => {
    const result = response1.map((item: any) => {
      const sites = response2.find((site: any) => site.siteId === item.siteId);
      return { ...item, siteName: sites?.siteName };
    });
    return result;
  };
  const requestQuery = [
    {
      api: advanceApprovalServices.fetchAdvanceRequestByUserId,
      queryKey: advanceApprovalQueries.getAdvanceRequestByUserId,
      setState: setAllRequests,
      id: session.userId,
    },
  ];
  const { isLoading } = useDependentQueriesWithId(
    status,
    response,
    dependentLogic,
    requestQuery,
  );

  const approveMutation = useMutationFn(
    advanceApprovalServices.approveAdvanceRequest,
    advanceApprovalQueries.getAdvanceRequestByUserId,
  );
  const rejectMutation = useMutationFn(
    advanceApprovalServices.rejectAdvanceRequest,
    advanceApprovalQueries.getAdvanceRequestByUserId,
  );
  const headCells: Array<HeadCell> = [
    { id: 'employeeName', label: 'Employee Name', view: true, sortable: 1 },
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'costing', label: 'Costing', view: true, sortable: 3 },
    { id: 'description', label: 'Description', view: true, sortable: 4 },
    { id: 'hubName', label: 'Hub Name' },
    { id: 'siteName', label: 'Site Name', view: true, sortable: 2 },
    { id: 'siteLocation', label: 'Site Location' },
    { id: 'approverStatusId', label: 'Status' },
  ];

  function handleApproveMutation(
    type: string,
    comments: string,
    advApprovalId: string,
  ) {
    console.log(type, comments, advApprovalId, 'handleApproveMutation');
    (type === 'APPROVE' ? approveMutation : rejectMutation).mutate({
      comment: comments,
      id: advApprovalId,
    });
  }

  return (
    isLoading ? (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    ) : (
      <ApprovalDashboard
        isAdvance={true}
        key={'approvalDashboard/advance'}
        hasCreateAccess={hasCreateAccess}
        hasUpdateAccess={hasUpdateAccess}
        session={session}
        headCells={headCells}
        allRequests={allRequests}
        handleRequest={handleApproveMutation}
      />
    )
  );
}
