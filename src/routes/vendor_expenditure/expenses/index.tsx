import {
  createFileRoute,
  redirect,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import ExpensePage from '@/components/expenditure/Expense';
import { getAccessPermissions } from '@/utils/common/permissions';
import { ExpenseSearchSchema } from '@/utils/Validators/schema/SearchSchemas';

export const Route = createFileRoute('/vendor_expenditure/expenses/')({
  validateSearch: (search) => ExpenseSearchSchema.parse(search),
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

    return { hasCreateAccess, hasUpdateAccess, session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/vendor_expenditure/expenses/',
  });
  const search = useSearch({ from: '/vendor_expenditure/expenses/' });
  return (
    <ExpensePage
      hasCreateAccess={hasCreateAccess}
      hasUpdateAccess={hasUpdateAccess}
      session={session}
      search={search}
    />
  );
}
