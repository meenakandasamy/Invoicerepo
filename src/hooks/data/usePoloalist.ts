import { useQuery } from '@tanstack/react-query';
import { useApproverStatus } from './useApproverStatus';
import { useUserList } from './useUserList';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useSites } from './useSite';
import { useApproverDetails } from './useApproverDetails';

import {
  PoloaQueries,
  PoloaServices,
} from '@/integrations/Services/PoloaService';
import { useVendorDropdown } from './useVendor';

export const usePoloalist = (session: Session, method: 'GET_ALL') => {
  const { data: status } = useApproverStatus();
  const { data: userList } = useUserList(session);
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: sites } = useSites(session);
  const { data: vendor } = useVendorDropdown();
  const { data: approverDetails } = useApproverDetails(session.userId);
  console.log(vendor);

  const allDependenciesLoaded =
    !!status &&
    !!userList &&
    !!costCenters &&
    !!costHeaders &&
    !!sites &&
    !!vendor &&
    !!approverDetails;

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
          vendorName: vendor.find(
            (ven: any) => Number(ven.vendorId) === Number(item.vendorId),
          )?.vendorName,
           vendorCode: vendor.find(
            (ven: any) => Number(ven.vendorId) === Number(item.vendorId),
          )?.vendorCode,
          castCenter: costCenters.find(
            (user: any) => user.costCentreId === item.costCentreid,
          )?.costCentreName,
      castHeader: costHeaders.find(
  (user: any) => Number(user.costHeaderId) === Number(item.costHeaderid),
)?.costHeaderName,

          lastUpdatedByName: userList.find(
            (user: any) => user.userId === item.lastUpdatedBy,
          )?.firstName,
        };
      });
    },
  });
};
