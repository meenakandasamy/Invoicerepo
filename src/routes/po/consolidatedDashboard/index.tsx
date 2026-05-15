import { createFileRoute, redirect, useRouteContext, } from '@tanstack/react-router';
import { getAccessPermissions } from '@/utils/common/permissions';
import ConsolidatedDashboardPage from '@/components/consolidated/consolidatedDashboard';

export const Route = createFileRoute('/po/consolidatedDashboard/')({
    beforeLoad(ctx) {
        const { context: { session }, } = ctx;
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
    const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({ from: '/po/consolidatedDashboard/', });
    return (
        <ConsolidatedDashboardPage
            hasCreateAccess={hasCreateAccess}
            hasUpdateAccess={hasUpdateAccess}
            session={session} />);
}