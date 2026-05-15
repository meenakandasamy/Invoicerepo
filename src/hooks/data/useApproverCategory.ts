import { useQuery } from '@tanstack/react-query';
import {
  ApproverCategoryQueries,
  ApproverCategoryServices,
} from '@/integrations/Services/approverCategory';

export const useApproverCategory = () => {
  return useQuery<Array<approverCategoryDropdownTypes>, Error>({
    queryKey: [ApproverCategoryQueries.GET_APPROVER_CATEGORY_DROPDOWN],
    queryFn: async () => {
      try {
        return await ApproverCategoryServices.fetchApproverCategoryDropdown();
      } catch (err: any) {
        throw new Error(
          err?.message || 'Error fetching approver category dropdown',
        );
      }
    },
    retry: 1,
    meta: {
      successMessage: 'Approver category loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load approver category dropdown',
    },
  });
};
