import { useQuery } from '@tanstack/react-query';
import { poQueries, poServices } from '@/integrations/Services/poServices';

export const usePoDocByPoId = (poId: string | number | null) => {
  return useQuery({
    queryKey: [poQueries.FETCH_PO_DOC_BY_PO_ID, poId],
    queryFn: async () => {
      try {
        return await poServices.fetchPoDocByPoId(poId!);
      } catch (error: any) {
        throw new Error(error || 'Error fetching PO document');
      }
    },
    enabled: !!poId,
    retry: 1,
    meta: {
      successMessage: 'PO document loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load PO document',
    },
  });
};
