import { useQuery } from '@tanstack/react-query';
import type { Templatemappingdropdownlist } from '@/types/common';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

export const useTemplatedropdownList = (session: Session) => {
  const Id = session.companyId;

  return useQuery<Array<Templatemappingdropdownlist>, Error>({
    queryKey: [EIRASAAS_API_QUERIES.GET_SOP_TEMPLATE_DROPDOWN],
    queryFn: async () => {
      const response =
        await EirasaasAPIs.FetchAllSopTemplatesdropdown(Id);

      console.log(response, 'responseTest');
      return response;
    },
    enabled: !!Id,
    retry: 1,
    meta: {
      successMessage: 'Sop templates loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load sop templates',
    },
  });
};