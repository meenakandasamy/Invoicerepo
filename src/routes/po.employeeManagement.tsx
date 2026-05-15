// import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/po/employeeManagement')({
//   component: RouteComponent,
// })

// function RouteComponent() {
//   return <div>Hello "/po/employeeManagement"!</div>
// }
import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import {EmployeeManagement} from '@/components/employee/employeeManagement';
import { getAccessPermissions } from '@/utils/common/permissions';
import { vendorSearchSchema } from '@/utils/Validators/schema/SearchSchemas';


export const Route = createFileRoute('/po/employeeManagement')({
  validateSearch: (search) => vendorSearchSchema.parse(search),
  beforeLoad(ctx) {
    const {
      context: { session },
    } = ctx;
    const {
      view: hasAccess,
      create: hasCreateAccess,
      edit: hasUpdateAccess,
    } = getAccessPermissions(session, 'poloa');

    if (!hasAccess) {
      throw redirect({ to: '/login' });
    }

    return { hasCreateAccess, hasUpdateAccess, session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/po/employeeManagement',
  });
  // const search = useSearch({ from: '/po/loa' });

  return (
    <EmployeeManagement
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      // search={search}
    />
  );
}
