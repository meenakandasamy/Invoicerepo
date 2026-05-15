import React from 'react';
import {
  createFileRoute,
  redirect,
  useRouteContext,
} from '@tanstack/react-router';
import type { RequestData } from '@/types/requestor';
import type { QueryConfig } from '@/utils/common/queryUtils';
import type { HeadCell } from '@/types/table';
import { getAccessPermissions } from '@/utils/common/permissions';
import ApprovalDashboard from '@/components/approvalDashboard/ApprovalDashboard';
import { GetSessionCookie } from '@/utils/common/cookieHandler';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import {
  ApprovalQuery,
  ApprovalServices,
} from '@/integrations/Services/approvalService';

export const Route = createFileRoute('/po/approvalDashboard/$Id')({
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

// Your component can now use the dynamic ID
function RouteComponent() {
  const { Id } = Route.useParams();
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/po/approvalDashboard/$Id',
  });

  // States:
  const [allRequests, setAllRequests] = React.useState<Array<RequestData>>([]);

  // API calls:
  const queryies: Array<QueryConfig> = [
    {
      api: ApprovalServices.fetchApprovalsByUserId,
      queryKey: ApprovalQuery.GET_APPROVAL_BY_USER_ID,
      setState: setAllRequests,
      id: session.userId,
    },
  ];

  useQueriesFn(queryies);

  const approveMutation = useMutationFn(
    ApprovalServices.approvePoRequest,
    ApprovalQuery.GET_APPROVAL_BY_USER_ID,
  );
  const rejectMutation = useMutationFn(
    ApprovalServices.rejectPoRequest,
    ApprovalQuery.GET_APPROVAL_BY_USER_ID,
  );

  function handleApproveMutation(
    type: string,
    comments: string,
    reqId: string,
  ) {
    (type === 'APPROVE' ? approveMutation : rejectMutation).mutate({
      comment: comments,
      id: reqId,
    });
  }
  const headCells: Array<HeadCell> = [
    { id: 'employeeName', label: 'Employee Name', view: true, sortable: 1 },
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'costing', label: 'Costing', view: true, sortable: 3 },
    { id: 'description', label: 'Description', view: true, sortable: 4 },
    { id: 'hubName', label: 'Hub Name' },
    { id: 'siteId', label: 'Site Name', view: true, sortable: 2 },
    { id: 'siteLocation', label: 'Site Location' },
    { id: 'approverStatusId', label: 'Status' },
  ];

  return (
    <ApprovalDashboard
      isAdvance={false}
      Id={Id}
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      headCells={headCells}
      allRequests={allRequests}
      handleRequest={handleApproveMutation}
    />
  );
}
