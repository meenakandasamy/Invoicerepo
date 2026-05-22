
import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import {Ticketconfig} from '@/components/Ticket/ticketConfig';
import { getAccessPermissions } from '@/utils/common/permissions';
import { ticketSearchSchema } from '@/utils/Validators/schema/SearchSchemas';


export const Route = createFileRoute('/ticket/config')({
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
    from: '/ticket/config',
  });
  // const search = useSearch({ from: '/po/loa' });

  return (
    <Ticketconfig
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      // search={search}
    />
  );
}
