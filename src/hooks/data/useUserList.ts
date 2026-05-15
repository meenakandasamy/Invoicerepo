import { useQuery } from '@tanstack/react-query';
import type { userDropdownType } from '@/types/common';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

export const useUserList = (session: Session) => {
  const isOEM: boolean = session.userTypeName === 'OEM';

  return useQuery<Array<userDropdownType>, Error>({
    queryKey: [
      isOEM
        ? EIRASAAS_API_QUERIES.GET_USERS_BY_COMPANY_ID
        : EIRASAAS_API_QUERIES.GET_USERS_BY_CUSTOMER_ID,
    ],
    queryFn: async () => {
      try {
        const api = isOEM
          ? EirasaasAPIs.FetchUsersByCompanyId
          : EirasaasAPIs.FetchUsersByCustomerId;
        return await api(
          isOEM ? `${session.companyId}` : `${session.customerId}`,
        );
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching cost centers');
      }
    },
    retry: 1,
    meta: {
      successMessage: 'Users loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load users',
    },
  });
};
