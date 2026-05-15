import { useQuery } from '@tanstack/react-query';
import { useApproverDetails } from './useApproverDetails';
import type { costHeaderDropdownType } from '@/types/common';
import {
  CostHeaderQueries,
  CostHeaderServices,
} from '@/integrations/Services/costHeaderServices';

export const useCostHeadersByLevelAndVendor = (
  session: Session,
  vendorID: number,
) => {
  const { data: approverDetails } = useApproverDetails(session.userId);

  return useQuery<Array<costHeaderDropdownType>, Error>({
    queryKey: [CostHeaderQueries.GET_COST_HEADERS_BY_LEVEL_AND_VENDOR],
    queryFn: async () => {
      try {
        return await CostHeaderServices.fetchCostHeadersByLevelAndVendor(
          approverDetails!.approverLevelId,
          vendorID,
        );
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching cost headers');
      }
    },
    enabled: !!vendorID && !!approverDetails,
    retry: 1,
    meta: {
      successMessage: 'Cost headers loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load cost headers',
    },
  });
};
