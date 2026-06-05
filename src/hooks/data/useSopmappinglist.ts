import { useQuery } from '@tanstack/react-query';
import { useUserList } from './useUserList';
import { useSoplist } from './useSoplist';
import {
  TicketSopmappingQueries,
  TicketSopmappingServices,
} from '@/integrations/Services/ticketSopmappingServices';





export const useSopmappinglist = (session: Session) => {
    const { data: SopList } = useSoplist(session);
      const { data: userList } = useUserList(session);
         


console.log(SopList);
  const allDependenciesLoaded =
//     !!userList 
    !!SopList
   
console.log(SopList);

  return useQuery({
    queryKey: [TicketSopmappingQueries.GET_TICKET_SOPMAPPING],
    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }

      let response: Array<any> | undefined = [];

      response = await TicketSopmappingServices.fetchgetallTicketSopmappig(session.companyId);

      console.log(response, 'responseTest');

      return response?.map((item: any) => {
        console.log(item);


        
        return {
          ...item,
          vendorType: Array.isArray(item.vendorType)
            ? item.vendorType
            : [item.vendorType],
        //   createdByName: userList.find(
        //     (user: any) => user.userId === item.createdBy,
        //   )?.firstName,
        //   lastUpdatedByName: userList.find(
        //     (user: any) => user.userId === item.lastUpdatedBy,
        //   )?.firstName,
        };
      });
    },
  });
};
