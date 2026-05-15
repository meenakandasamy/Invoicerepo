import { useQuery } from '@tanstack/react-query';
import { useApproverStatus } from './useApproverStatus';
import { useUserList } from './useUserList';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useSites } from './useSite';
import { useApproverDetails } from './useApproverDetails';
import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';

export const useVendors = (
  session: Session,
  method:
    | 'GET_ALL'
    | 'GET_BY_ID'
    | 'GET_BY_COMPANY_ID'
    | 'GET_BY_CUSTOMER_ID'
    | 'GET_BY_ORG_ID',
) => {
  const { data: status } = useApproverStatus();
  const { data: userList } = useUserList(session);
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: sites } = useSites(session);
  const { data: approverDetails } = useApproverDetails(session.userId);

  const allDependenciesLoaded =
    !!status &&
    !!userList &&
    !!costCenters &&
    !!costHeaders &&
    !!sites &&
    !!approverDetails;

  return useQuery({
    queryKey: [VendorQuery.GET_ALL_VENDORS],
    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }

      enum METHOD {
        GET_ALL = 'GET_ALL',
        GET_BY_ID = 'GET_BY_ID',
        GET_BY_COMPANY_ID = 'GET_BY_COMPANY_ID',
        GET_BY_CUSTOMER_ID = 'GET_BY_CUSTOMER_ID',
        GET_BY_ORG_ID = 'GET_BY_ORG_ID',
      }

      let response: Array<any> | undefined = [];

      if (method === METHOD.GET_ALL) {
        response = await VendorServices.FetchAllVendors();
      } else if (method === METHOD.GET_BY_COMPANY_ID) {
        response = await VendorServices.FetchVendorByCompanyId(
          session.companyId,
        );
      } else if (method === METHOD.GET_BY_CUSTOMER_ID) {
        response = await VendorServices.FetchVendorByCustomerId(
          session.customerId,
        );
      } else if (method === METHOD.GET_BY_ORG_ID) {
        response = await VendorServices.FetchVendorByOrgId(
          approverDetails.organizationId ?? 1,
        );
      }
      // console.log(response, 'responseTest');

      return response?.map((item: any) => {
        const safeCostCentreIds = !Array.isArray(item.costCentreIds)
          ? [item.costCentreIds]
          : (item.costCentreIds ?? []);
        const safeCostHeaderIds = !Array.isArray(item.costHeaderIds)
          ? [item.costHeaderIds]
          : (item.costHeaderIds ?? []);
        const safeSiteIds = !Array.isArray(item.siteIds)
          ? [item.siteIds]
          : (item.siteIds ?? []);
        return {
          ...item,
          vendorType: Array.isArray(item.vendorType)
            ? item.vendorType
            : [item.vendorType],
          createdByName: userList.find(
            (user: any) => user.userId === item.createdBy,
          )?.firstName,
          lastUpdatedByName: userList.find(
            (user: any) => user.userId === item.lastUpdatedBy,
          )?.firstName,
          visualLevelId: item.levelId ? +item.levelId - 1 : null,
          approverStatusName:
            status.find(
              (s: any) => s.approverStatusId === item.approverStatusId,
            )?.approveStatusName ?? null,
          costCentreName: costCenters
            .filter((centre: any) =>
              safeCostCentreIds.includes(centre.costCentreId),
            )
            .map((centre: any) => centre.costCentreName)
            .join(', '),
          costHeaderName: costHeaders
            .filter((header: any) =>
              safeCostHeaderIds.includes(header.costHeaderId),
            )
            .map((header: any) => header.costHeaderName)
            .join(', '),
          siteName: sites
            .filter((site: any) => safeSiteIds.includes(site.siteId))
            .map((site: any) => site.siteName)
            .join(', '),
          costCentreNames: safeCostCentreIds.map(
            (id: number) =>
              costCenters.find((centre: any) => centre.costCentreId === id)
                ?.costCentreName ?? null,
          ),
          costHeaderNames: safeCostHeaderIds.map(
            (id: number) =>
              costHeaders.find((header: any) => header.costHeaderId === id)
                ?.costHeaderName ?? null,
          ),
          siteNames: safeSiteIds.map(
            (id: number) =>
              sites.find((site: any) => site.siteId === id)?.siteName ?? null,
          ),
          nextApproverName: userList.find(
            (user: any) => user.userId === item.userId,
          )?.firstName,
          gstStatus: item.gstStatus === 1 ? 'Registered' : 'Unregistered',
          view: {
            gstFileName: item.gstNoFilepath?.split('/').pop(),
            panFileName: item.panNoFilepath?.split('/').pop(),
            msmeFileName: item.msmeRegistrationFilepath?.split('/').pop(),
            bankFileName: item.accountNoFilpath?.split('/').pop(),
          },
        };
      });
    },
    enabled: allDependenciesLoaded,
    retry: 1,

    gcTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      successMessage: 'Vendors loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load vendors',
    },
  });
};
