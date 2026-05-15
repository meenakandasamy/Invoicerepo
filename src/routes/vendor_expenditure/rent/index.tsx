import { createFileRoute, redirect, useRouteContext, useSearch } from '@tanstack/react-router'
import { vendorRentSearchSchema } from '@/utils/Validators/schema/SearchSchemas';
import { getAccessPermissions } from '@/utils/common/permissions';
import VendorRentPage from '@/components/expenditure/Rent';

export const Route = createFileRoute('/vendor_expenditure/rent/')({
    validateSearch: (search) => vendorRentSearchSchema.parse(search),
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
        from: '/vendor_expenditure/rent/',
    });
    const search = useSearch({ from: '/vendor_expenditure/rent/' });
    return (
        <VendorRentPage
            hasCreateAccess={hasCreateAccess}
            hasUpdateAccess={hasUpdateAccess}
            session={session}
            search={search}
        />
    );
}