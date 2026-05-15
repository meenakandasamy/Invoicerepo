import { useQuery } from '@tanstack/react-query';
import type { userDropdownType } from '@/types/common';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

export const useUserList = (session: Session) => {
  const Id: number = session.organizationId;

  return useQuery<Array<userDropdownType>, Error>({
    queryKey: [EIRASAAS_API_QUERIES.GET_USERS_BY_COMPANY_ID],
    queryFn: async () => {
      try {
        const response = await EirasaasAPIs.FetchUsersByOrganizationId(Id);
        console.log(response, 'responseTest');

        return response;
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching cost centers');
      }
    },
    retry: 1,
    enabled: !!Id,
    meta: {
      successMessage: 'Users loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load users',
    },
  });
};
