import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import {Sopmapping} from '@/components/Sop/Sopmapping';
import { getAccessPermissions } from '@/utils/common/permissions';
import { ticketSearchSchema } from '@/utils/Validators/schema/SearchSchemas';


export const Route = createFileRoute('/ticket/sopMapping')({
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
    from: '/ticket/sopMapping',
  });
  // const search = useSearch({ from: '/po/loa' });

  return (
    <Sopmapping
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      // search={search}
    />
  );
}
