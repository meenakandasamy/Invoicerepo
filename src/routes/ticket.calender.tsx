import {
  createFileRoute,
  redirect,
  useRouteContext
} from '@tanstack/react-router';
import { getAccessPermissions } from '@/utils/common/permissions';
import { ticketSearchSchema } from '@/utils/Validators/schema/SearchSchemas';
import { Ticketcalender } from '@/components/TicketCalender/ticketCalender';

export const Route = createFileRoute('/ticket/calender')({
  validateSearch: (search) => ticketSearchSchema.parse(search),
  beforeLoad(ctx) {
    const {
      context: { session },
    } = ctx;
    const {
      view: hasAccess,
      create: hasCreateAccess,
      edit: hasUpdateAccess,
    } = getAccessPermissions(session, 'ticketApproval');

    if (!hasAccess) {
      throw redirect({ to: '/login' });
    }

    return { hasCreateAccess, hasUpdateAccess, session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/ticket/calender',
  });
  return (
    <Ticketcalender
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      // search={search}
    />
  );
}
