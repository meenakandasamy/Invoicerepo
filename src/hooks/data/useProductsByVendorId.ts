import { useQuery } from '@tanstack/react-query';
import {
  ProductQuery,
  ProductServices,
} from '@/integrations/Services/productService';

export const useProductsByVendorId = (vendorId: number) => {
  return useQuery({
    queryKey: [ProductQuery.GET_PRODUCT_DROPDOWN_BY_VENDOR_ID, vendorId],
    queryFn: async () => {
      try {
        const response =
          await ProductServices.FetchProductDropdownByVendorId(vendorId);
        return response;
      } catch (error: any) {
        throw new Error(error?.message || 'Error fetching PO dropdown');
      }
    },
    enabled: !!vendorId,
    retry: 1,
    meta: {
      successMessage: 'PO Dropdown loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load PO dropdown',
    },
  });
};
