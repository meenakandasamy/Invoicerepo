import { createFileRoute } from '@tanstack/react-router'
import ExpenseForm from '@/components/expenseForm/expenseForm';
import { decodeURIComponentSafe } from '@/utils/decode';
import { VendorServices } from '@/integrations/Services/vendorServices';

export const Route = createFileRoute('/vendor_expenditure/expenseForm')({
    beforeLoad: async ({ search }: { search: { id?: string; ec?: string } }) => {
        const userId = search.id || '';
        const hashingKey = search.ec ? decodeURIComponentSafe(search.ec) : '';

        let data;
        try {
            data = await VendorServices.ValidateVendorFormToken({
                userId: Number(userId),
                hashingKey: hashingKey,
            });
        }
        catch (error) {
            console.error('Error validating form token:', error);
            return {
                userId,
                hashingKey,
                result: true,
            };
        }


        return {
            userId,
            hashingKey,
            result: !data.isCompletedFlag,
        };
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { userId, hashingKey, result } = Route.useRouteContext();
    return (
        <div>
            <ExpenseForm userId={userId} hashingKey={hashingKey} isValidForm={result} />
        </div>
    );
}
