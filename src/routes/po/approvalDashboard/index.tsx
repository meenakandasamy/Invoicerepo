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
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import {
  ApprovalQuery,
  ApprovalServices,
} from '@/integrations/Services/approvalService';
import ApprovalDashboard from '@/components/approvalDashboard/ApprovalDashboard';

export const Route = createFileRoute('/po/approvalDashboard/')({
  component: RouteComponent,
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
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/po/approvalDashboard/',
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

  function handleRequestMutation(
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
    { id: 'requestorName', label: 'Requestor Name', view: true, sortable: 1 },
    { id: 'description', label: 'Description', view: true, sortable: 4 },
    { id: 'deliveryAddress', label: 'Delivery Address' },
    { id: 'deliveryTime', label: 'Delivery Time' },
    { id: 'vendorName', label: 'Vendor Name', view: true, sortable: 2 },
    { id: 'paymentTermsName', label: 'Payment Terms' },
    { id: 'taxableValue', label: 'Taxable Value', view: true, sortable: 3 },
    { id: 'approveStatusId', label: 'Status' },
  ];

  return (
    <ApprovalDashboard
      isAdvance={false}
      key={'approvalDashboard'}
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      headCells={headCells}
      allRequests={allRequests}
      handleRequest={handleRequestMutation}
    />
  );
}
