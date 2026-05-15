import { createFileRoute, redirect } from '@tanstack/react-router';
import { getAccessPermissions } from '@/utils/common/permissions';
import HomeDashboard from '@/components/dashboard/HomeDashboard';
import { GetSessionCookie } from '@/utils/common/cookieHandler';
import { EirasaasAPIs } from '@/integrations/Services/commonServices';
import { GetRoleById } from '@/integrations/Services/roleService';

export const Route = createFileRoute('/')({
  beforeLoad: async function () {
    const context: Session | null = await GetSessionCookie();

    if (!context || !context.accesstoken) {
      throw redirect({ to: '/po/loa' });
    }

    // const { view: hasAccess } = getAccessPermissions(context, 'poloa');
    // console.log(hasAccess);
    

    // if (!hasAccess) {
    //   throw redirect({ to: '/login' });
    // }
    // const userDetails = await EirasaasAPIs.FetchUsersDetailsByCompanyId(
    //   `${context.companyId}`,
    // );
    // const filteredUserDetails = userDetails.find(
    //   (user: any) => user.userId === context.userId,
    // );
    // console.log(filteredUserDetails);
    

    // if (!filteredUserDetails) {
    //   throw redirect({ to: '/login' });
    // }

//     const roleDetials = await GetRoleById({
//       roleId: filteredUserDetails.poRoleId,
//     });
// console.log(roleDetials);

    // if (!roleDetials) {
    //   throw redirect({ to: '/login' });
    // }
    // sessionStorage.setItem('poRoleName', roleDetials.roleName);

    // throw redirect({ to: '/po/loa' });
  },
  component: App,
});

function App() {
  return <HomeDashboard />;
}
