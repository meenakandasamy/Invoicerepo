import { useQuery } from '@tanstack/react-query';
import type { costCentreDropdownType } from '@/types/common';
import {
  CostCentreQueries,
  CostCentreServices,
} from '@/integrations/Services/costCentreServices';

export const useCostCenters = () => {
  return useQuery<Array<costCentreDropdownType>, Error>({
    queryKey: [CostCentreQueries.GET_COST_CENTRE_DROPDOWN],
    queryFn: async () => {
      try {
        return await CostCentreServices.fetchCostCentreDropdown();
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
