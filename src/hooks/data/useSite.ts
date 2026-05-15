import { useQuery } from '@tanstack/react-query';
import type { siteDropdownType } from '@/types/common';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

export const useSites = (session: Session) => {
  const isOEM: boolean = session.userTypeName === 'OEM';

  return useQuery<Array<siteDropdownType>, Error>({
    queryKey: [
      isOEM
        ? EIRASAAS_API_QUERIES.GET_SITELIST_BY_COMPANY
        : EIRASAAS_API_QUERIES.GET_SITELIST_BY_CUSTOMER,
    ],
    queryFn: async () => {
      try {
        const api = isOEM
          ? EirasaasAPIs.GetSiteListDropdownByCompany
          : EirasaasAPIs.GetSiteListDropdownByCustomer;
        return await api(
          isOEM ? `${session.companyId}` : `${session.customerId}`,
        );
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching cost centers');
      }
    },
    retry: 1,
    meta: {
      successMessage: 'Cost centers loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load cost centers',
    },
  });
};
