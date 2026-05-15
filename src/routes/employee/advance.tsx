import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import { EmployeeAdvance } from '@/components/employee/EmployeeAdvance';
import { getAccessPermissions } from '@/utils/common/permissions';
import { reimbursementSearchSchema } from '@/utils/Validators/schema/SearchSchemas';
export const Route = createFileRoute('/employee/advance')({
  validateSearch: (search) => reimbursementSearchSchema.parse(search),
  beforeLoad(ctx) {
    const {
      context: { session },
    } = ctx;
    const {
      view: hasAccess,
      create: hasCreateAccess,
      edit: hasUpdateAccess,
    } = getAccessPermissions(session, 'vendors');

    if (!hasAccess) {
      throw redirect({ to: '/login' });
    }

    return { hasCreateAccess, hasUpdateAccess, session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/employee/advance',
  });
  const search = useSearch({ from: '/employee/advance' });

  return (
    <EmployeeAdvance
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      search={search}
    />
  );
}
