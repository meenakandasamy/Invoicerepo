import { useQuery } from '@tanstack/react-query';
import type { ApproverStatus } from '@/types/common';
import {
  DropDownServices,
  dropDownApiQueries,
} from '@/integrations/Services/dropDown_services';

export const useApproverStatus = () => {
  return useQuery<Array<ApproverStatus>, Error>({
    queryKey: [dropDownApiQueries.GET_APPROVER_STATUS_DROPDOWN],
    queryFn: async () => {
      try {
        return await DropDownServices.FetchApproverStatusDropdown();
      } catch (err: any) {
        throw new Error(
          err?.message || 'Error fetching approver status dropdown',
        );
      }
    },
    retry: 1,
    meta: {
      successMessage: 'Approver status loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load approver status dropdown',
    },
  });
};
