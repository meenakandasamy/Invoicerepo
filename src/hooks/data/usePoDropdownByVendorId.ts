import { useQuery } from '@tanstack/react-query';
import { poQueries, poServices } from '@/integrations/Services/poServices';

export const usePoDropdownByVendorId = (id: string | number | null) => {
  return useQuery({
    queryKey: [poQueries.FETCH_PO_DROPDOWN_BY_VENDOR, id],
    queryFn: async () => {
      try {
        const response = await poServices.fetchPoDropdownByVendorId(id!);
        return response;
      } catch (error: any) {
        throw new Error(error?.message || 'Error fetching PO dropdown');
      }
    },
    enabled: !!id,
    retry: 1,
    meta: {
      successMessage: 'PO Dropdown loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load PO dropdown',
    },
  });
};
