import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import { ConsultantSalary } from '@/components/employee/ConsultantSalary';
import { getAccessPermissions } from '@/utils/common/permissions';
import { consultantSalarySearchSchema } from '@/utils/Validators/schema/SearchSchemas';

export const Route = createFileRoute('/employee/consultantSalary')({
  validateSearch: (search) => consultantSalarySearchSchema.parse(search),
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
    from: '/employee/consultantSalary',
  });
  const search = useSearch({ from: '/employee/consultantSalary' });
  return (
    <div>
      <ConsultantSalary
        hasCreateAccess={hasCreateAccess}
        hasUpdateAccess={hasUpdateAccess}
        session={session}
        search={search}
      />
    </div>
  );
}
