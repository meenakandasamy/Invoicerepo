import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import VendorPage from '@/components/vendor/vendor';
import { getAccessPermissions } from '@/utils/common/permissions';
import { vendorSearchSchema } from '@/utils/Validators/schema/SearchSchemas';

export const Route = createFileRoute('/po/vendor')({
  validateSearch: (search) => vendorSearchSchema.parse(search),
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
    from: '/po/vendor',
  });
  const search = useSearch({ from: '/po/vendor' });

  return (
    <VendorPage
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      search={search}
    />
  );
}
