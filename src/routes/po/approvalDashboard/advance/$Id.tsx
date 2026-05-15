import React from 'react';
import {
  createFileRoute,
  redirect,
  useRouteContext,
} from '@tanstack/react-router';
import type { HeadCell } from '@/types/table';
import type { QueryConfig } from '@/utils/common/queryUtils';
import { GetSessionCookie } from '@/utils/common/cookieHandler';
import { getAccessPermissions } from '@/utils/common/permissions';
import ApprovalDashboard from '@/components/approvalDashboard/ApprovalDashboard';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import {
  advanceApprovalQueries,
  advanceApprovalServices,
} from '@/integrations/Services/advanceApprovalServices';

export const Route = createFileRoute('/po/approvalDashboard/advance/$Id')({
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
  const { Id } = Route.useParams();
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/po/approvalDashboard/advance/$Id',
  });

  // States:
  const [allRequests, setAllRequests] = React.useState<
    Array<AdvanceRequestFields>
  >([]);

  // API calls:
  const queryies: Array<QueryConfig> = [
    {
      api: advanceApprovalServices.fetchAdvanceRequestByUserId,
      queryKey: advanceApprovalQueries.getAdvanceRequestByUserId,
      setState: setAllRequests,
      id: session.userId,
    },
  ];

  useQueriesFn(queryies);

  const approveMutation = useMutationFn(
    advanceApprovalServices.approveAdvanceRequest,
    advanceApprovalQueries.getAdvanceRequestByUserId,
  );
  const rejectMutation = useMutationFn(
    advanceApprovalServices.rejectAdvanceRequest,
    advanceApprovalQueries.getAdvanceRequestByUserId,
  );

  function handleApproveMutation(
    type: string,
    comments: string,
    advApprovalId: string,
  ) {
    (type === 'APPROVE' ? approveMutation : rejectMutation).mutate({
      comment: comments,
      id: advApprovalId,
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
    <div>
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
    </div>
  );
}
