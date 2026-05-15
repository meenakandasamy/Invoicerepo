import { useQuery } from '@tanstack/react-query';
import type { costHeaderDropdownType } from '@/types/common';
import {
  CostHeaderQueries,
  CostHeaderServices,
} from '@/integrations/Services/costHeaderServices';

export const useCostHeaders = () => {
  return useQuery<Array<costHeaderDropdownType>, Error>({
    queryKey: [CostHeaderQueries.GET_COST_HEADER_DROPDOWN],
    queryFn: async () => {
      try {
        return await CostHeaderServices.fetchCostHeaderDropdown();
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching cost headers');
      }
    },
    retry: 1,
    meta: {
      successMessage: 'Cost headers loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load cost headers',
    },
  });
};
