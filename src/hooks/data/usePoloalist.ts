import { useQuery } from '@tanstack/react-query';
import { useUserList } from './useUserList';


import {
  PoloaQueries,
  PoloaServices,
} from '@/integrations/Services/PoloaService';


export const usePoloalist = (session: Session, method: 'GET_ALL') => {
  const { data: userList } = useUserList(session);

;

  const allDependenciesLoaded =
    !!userList 
   

  return useQuery({
    queryKey: [PoloaQueries.GET_ALL],
    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }

      let response: Array<any> | undefined = [];

      response = await PoloaServices.fetchgetallpoloa();

      console.log(response, 'responseTest');

      return response?.map((item: any) => {
        console.log(item);
const getDocumentName = (url: string | null) => {
  if (!url) return '-';

  const splitKey = 'amazonaws.com/Vendor%20registration/';
  return url.includes(splitKey) ? url.split(splitKey)[1] : url;
};

        
        return {
          ...item,
          vendorType: Array.isArray(item.vendorType)
            ? item.vendorType
            : [item.vendorType],
          createdByName: userList.find(
            (user: any) => user.userId === item.createdBy,
          )?.firstName,
           documentName: getDocumentName(item.document),
         

          lastUpdatedByName: userList.find(
            (user: any) => user.userId === item.lastUpdatedBy,
          )?.firstName,
        };
      });
    },
  });
};
