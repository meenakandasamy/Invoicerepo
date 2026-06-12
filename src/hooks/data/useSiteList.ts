import { useQuery } from '@tanstack/react-query';
import type { Sitelist } from '@/types/common';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

export const useSiteList = (session: Session) => {
  const userId = session.userId;

  return useQuery<Array<Sitelist>, Error>({
    queryKey: [EIRASAAS_API_QUERIES.GET_SITELIST_BY_USER],
    queryFn: async () => {
      const response =
        await EirasaasAPIs.GetSiteListDropdownByUser(userId);

      console.log(response, 'responseTest');
      return response;
    },
    enabled: !!userId,
    retry: 1,
    meta: {
      successMessage: 'Site list loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load site list',
    },
  });
};