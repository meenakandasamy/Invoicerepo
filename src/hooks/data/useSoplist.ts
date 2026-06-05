import { useQuery } from '@tanstack/react-query';
import { useUserList } from './useUserList';


import {
  TicketSopQueries,
  TicketSopServices,
} from '@/integrations/Services/ticketSopServices';


export const useSoplist = (session: Session) => {




  return useQuery({
    queryKey: [TicketSopQueries.GET_TICKET_SOP],
    queryFn: async () => {
    

      let response: Array<any> | undefined = [];

      response = await TicketSopServices.fetchgetallTicketSop(session.companyId);

      console.log(response, 'responseTest');

      return response?.map((item: any) => {
        console.log(item);


        
        return {
          ...item,
          vendorType: Array.isArray(item.vendorType)
            ? item.vendorType
            : [item.vendorType],
        
        };
      });
    },
  });
};
