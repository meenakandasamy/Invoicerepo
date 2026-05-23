import { useQuery } from '@tanstack/react-query';
import { useUserList } from './useUserList';
import { TicketconfigQueries, TicketconfigServices } from '@/integrations/Services/TicketconfigServices';


export const useTicketconfig = (session: Session) => {
  const { data: userList } = useUserList(session);
console.log(session);

//   const allDependenciesLoaded =
//     !!userList 
  return useQuery({
    queryKey: [TicketconfigQueries.GET_TICKET_CONFIG_USERID],
    queryFn: async () => {
    //   if (!allDependenciesLoaded) {
    //     throw new Error('Dependent data not loaded yet');
    //   }

      let response: Array<any> | undefined = [];
      response = await TicketconfigServices.fetchgetallTicketconfig(session.userId);
      return response?.map((item: any) => {
        return {
          ...item,
          vendorType: Array.isArray(item.vendorType)
            ? item.vendorType
            : [item.vendorType],
            priority:item.priority===1?"Low":item.priority===2?"Medium":"High"
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
