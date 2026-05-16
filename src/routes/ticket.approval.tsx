// import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/ticket/approval')({
//   component: RouteComponent,
// })

// function RouteComponent() {
//   return <div>Hello "/ticket/approval"!</div>
// }

import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import {TicketApproval} from '@/components/Ticket/ticketApproval';
import { getAccessPermissions } from '@/utils/common/permissions';
import { ticketSearchSchema } from '@/utils/Validators/schema/SearchSchemas';


export const Route = createFileRoute('/ticket/approval')({
  validateSearch: (search) => ticketSearchSchema.parse(search),
  beforeLoad(ctx) {
    const {
      context: { session },
    } = ctx;
    const {
      view: hasAccess,
      create: hasCreateAccess,
      edit: hasUpdateAccess,
    } = getAccessPermissions(session, 'ticketConfiguration');

    if (!hasAccess) {
      throw redirect({ to: '/login' });
    }

    return { hasCreateAccess, hasUpdateAccess, session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/ticket/approval',
  });
  // const search = useSearch({ from: '/po/loa' });

  return (
    <TicketApproval
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      // search={search}
    />
  );
}
