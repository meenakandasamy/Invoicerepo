import { useQuery } from '@tanstack/react-query';
import { useUserList } from './useUserList';
import { useSoplist } from './useSoplist';
import { useSiteList } from './useSiteList';
import {
  TicketSopmappingQueries,
  TicketSopmappingServices,
} from '@/integrations/Services/ticketSopmappingServices';


export const useTemplatemappinglist = (session: Session) => {
    const { data: SopList } = useSoplist(session);
    const { data: SiteList } = useSiteList(session);
         


console.log(SopList);
  const allDependenciesLoaded =
//     !!userList 
    !!SopList && !!SiteList;
   
console.log(SopList);

  return useQuery({
    queryKey: [TicketSopmappingQueries.GET_TICKET_SOPMAPPING],
    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }

      let response: Array<any> | undefined = [];
      response = await TicketSopmappingServices.fetchgetallTicketSopmappig(session.companyId);
      return response?.map((item: any) => {
        return {
          ...item,
           sopName: SopList
          .filter((sop: any) => item.sopIds.includes(sop.sopId))
          .map((sop: any) => sop.sopName),
          statusName: item.status === 1 ? 'Active' : 'Inactive',
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
