import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import {Sop} from '@/components/Sop/Sop';
import { getAccessPermissions } from '@/utils/common/permissions';
import { ticketSearchSchema } from '@/utils/Validators/schema/SearchSchemas';
import { Templatemapping } from '@/components/Template/templateMapping';


export const Route = createFileRoute('/ticket/templatemapping')({
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
    from: '/ticket/templatemapping',
  });
  // const search = useSearch({ from: '/po/loa' });

  return (
    <Templatemapping
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      // search={search}
    />
  );
}
