import { createFileRoute, redirect, useRouteContext, useSearch } from '@tanstack/react-router'
import VendorAdvancePage from '@/components/expenditure/Advance';
import { getAccessPermissions } from '@/utils/common/permissions';
import { VendorAdvanceSearchSchema } from '@/utils/Validators/schema/SearchSchemas';

export const Route = createFileRoute('/vendor_expenditure/advance/')({
  validateSearch: (search) => VendorAdvanceSearchSchema.parse(search),
  beforeLoad(ctx) {
    const {
      context: { session },
    } = ctx;
    const {
      view: hasAccess,
      create: hasCreateAccess,
      edit: hasUpdateAccess,
    } = getAccessPermissions(session, 'approvalDashboard');

    if (!hasAccess) {
      throw redirect({ to: '/login' });
    }

    return { hasCreateAccess, hasUpdateAccess, session };
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/vendor_expenditure/advance/',
  });
  const search = useSearch({ from: '/vendor_expenditure/advance/' });
  return (
    <VendorAdvancePage
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      search={search}
    />
  );
}
