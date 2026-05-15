import {
  createFileRoute,
  redirect,
  useRouteContext,
} from '@tanstack/react-router';
import PoPage from '@/components/order/purchaseOrder';
import { getAccessPermissions } from '@/utils/common/permissions';

export const Route = createFileRoute('/po/purchaseOrder')({
  beforeLoad(ctx) {
    const {
      context: { session },
    } = ctx;
    const {
      view: hasAccess,
      create: hasCreateAccess,
      edit: hasUpdateAccess,
    } = getAccessPermissions(session, 'purchaseOrder');

    if (!hasAccess) {
      throw redirect({ to: '/login' });
    }

    return { hasCreateAccess, hasUpdateAccess };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/po/purchaseOrder',
  });

  return (
    <PoPage
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
    />
  );
}
