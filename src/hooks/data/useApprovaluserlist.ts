import { useQuery } from '@tanstack/react-query';
import type { Approvalist } from '@/types/common';
import {
  TicketApprovalQueries,
  TicketApprovalServices,
} from '@/integrations/Services/ticketApprovalServices';

export const useApprovaluserList = (session: Session) => {
  const Id: number = session.userId;

  return useQuery<Array<Approvalist>, Error>({
    queryKey: [TicketApprovalQueries.VITE_TICKET_APPROVAL_USERLIST],
    queryFn: async () => {
      try {
        const response = await TicketApprovalServices.fetchapprovaluserlist(Id);
        console.log(response, 'responseTest');

        return response;
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching cost centers');
      }
    },
    retry: 1,
    enabled: !!Id,
    meta: {
      successMessage: 'Users loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load users',
    },
  });
};
