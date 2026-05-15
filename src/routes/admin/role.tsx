import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import Role from '@/components/Role/role';
import { getAccessPermissions } from '@/utils/common/permissions';

export const Route = createFileRoute('/admin/role')({
    beforeLoad(ctx) {
        const { context: { session } } = ctx;
        const { view: hasAccess, create: hasCreateAccess, edit: hasUpdateAccess } = getAccessPermissions(session, 'purchaseOrder');

        if (!hasAccess) {
            // throw redirect({ to: '/login' });
        }

        return { hasCreateAccess, hasUpdateAccess, session };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
        from: '/admin/role',
    });

    return (
        <Role
            hasCreateAccess={hasCreateAccess}
            hasUpdateAccess={hasUpdateAccess}
            session={session}
        />
    );
}