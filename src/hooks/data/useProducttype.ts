import { useQuery } from '@tanstack/react-query';
import type { productDropdownType } from '@/types/requestor';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

export const useProductDropdown = () => {
  return useQuery<Array<productDropdownType>, Error>({
    queryKey: [EIRASAAS_API_QUERIES.GET_ALL_PRODUCT_ALL],
    queryFn: async () => {
      try {
        return await EirasaasAPIs.GetproductType();
        // return await VendorServices.FetchAllApprovedVendors();
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching vendors dropdown');
      }
    },
    retry: 1,
    meta: {
      successMessage: 'Vendors Dropdown loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load vendors dropdown',
    },
  });
};
