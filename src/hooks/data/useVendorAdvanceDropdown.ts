import { useQuery } from '@tanstack/react-query';
import type { VendorAdvance } from '@/types/vendorAdvance';
import {
  VendorAdvanceQueries,
  VendorAdvanceServices,
} from '@/integrations/Services/vendorAdvanceService';

export const useVendorAdvanceDropdown = (id: string | number | null) => {
  return useQuery<Array<VendorAdvance>, Error>({
    queryKey: [VendorAdvanceQueries.GET_BY_VENDOR_ID_DROPDOWN, id],
    queryFn: async () => {
      if (!id) return [];
      try {
        return await VendorAdvanceServices.fetchVendorAdvanceDropDownByVendorId(
          id,
        );
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching vendors dropdown');
      }
    },
    enabled: !!id,
    retry: 1,
    meta: {
      successMessage: 'Vendors Dropdown loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load vendors dropdown',
    },
  });
};
