import { useQuery } from '@tanstack/react-query';
import type { vendorDropdownType } from '@/types/requestor';
import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';

export const useVendorDropdown = () => {
  return useQuery<Array<vendorDropdownType>, Error>({
    queryKey: [VendorQuery.GET_ALL_APPROVED_VENDORS],
    queryFn: async () => {
      try {
        return await VendorServices.FetchAllVendorsDropdown();
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

