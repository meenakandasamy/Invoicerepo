import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import { getAccessPermissions } from '@/utils/common/permissions';
import { vendorSearchSchema } from '@/utils/Validators/schema/SearchSchemas';
import { UserConfig } from '@/components/User/UserConfig';

export const Route = createFileRoute('/po/user')({
    validateSearch: (search) => vendorSearchSchema.parse(search),
      beforeLoad(ctx) {
        const {
          context: { session },
        } = ctx;
        const {
          view: hasAccess,
          create: hasCreateAccess,
          edit: hasUpdateAccess,
        } = getAccessPermissions(session, 'userconfig');
    
        if (!hasAccess) {
          throw redirect({ to: '/login' });
        }
    
        return { hasCreateAccess, hasUpdateAccess, session };
      },
  component: RouteComponent,
});

function RouteComponent() {
    const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
        from: '/po/user',
      });
  return (
<UserConfig
        hasCreateAccess={hasCreateAccess}
        hasUpdateAccess={hasUpdateAccess}
        session={session}
        // search={search}
      />
  )
}
