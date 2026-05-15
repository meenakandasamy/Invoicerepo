import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import {Poloa} from '@/components/poloa/poloa';
import { getAccessPermissions } from '@/utils/common/permissions';
import { vendorSearchSchema } from '@/utils/Validators/schema/SearchSchemas';


export const Route = createFileRoute('/po/loa')({
  validateSearch: (search) => vendorSearchSchema.parse(search),
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
    from: '/po/loa',
  });
  // const search = useSearch({ from: '/po/loa' });

  return (
    <Poloa
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      // search={search}
    />
  );
}
