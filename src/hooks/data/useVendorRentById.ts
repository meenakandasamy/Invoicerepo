import { useQuery } from '@tanstack/react-query';
import { useApproverCategory } from './useApproverCategory';
import { useApproverStatus } from './useApproverStatus';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useSites } from './useSite';
import { useUserList } from './useUserList';
import { useVendorDropdown } from './useVendor';
import { RentQueries, RentServices } from '@/integrations/Services/rentService';

export const useVendorRentById = (
  session: Session,
  vendorRentId: string | number,
) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: vendors } = useVendorDropdown();
  const { data: categories } = useApproverCategory();
  const { data: status } = useApproverStatus();
  const { data: sites } = useSites(session);
  const { data: userList } = useUserList(session);

  const mapSingleItem = (item: any) => {
    const safeCostCentreIds = item.costCentreIds ?? [];
    const safeCostHeaderIds = item.costHeaderIds ?? [];
    const safeSiteIds = item.siteIds ?? [];

    return {
      ...item,
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

      siteName: sites
        .filter((site: any) => safeSiteIds.includes(site.siteId))
        .map((site: any) => site.siteName)
        .join(', '),

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

      createdByName:
        userList.find((user: any) => user.userId === item.createdBy)
          ?.userName || null,

      lastUpdatedByName:
        userList.find((user: any) => user.userId === item.lastUpdatedBy)
          ?.userName || null,

      approverStatusName:
        status.find((s) => s.approverStatusId === item.approverStatusId)
          ?.approveStatusName ?? null,
    };
  };
  return useQuery({
    queryKey: [RentQueries.GET_RENT_BY_ID],
    queryFn: async () => {
      if (!costCenters || !costHeaders) {
        throw new Error('Cost centers or cost headers not loaded yet');
      }
      if (!vendors) {
        throw new Error('Vendors not loaded yet');
      }

      if (!categories) {
        throw new Error('Categories not loaded yet');
      }

      if (!status) {
        throw new Error('Status not loaded yet');
      }

      if (!sites) {
        throw new Error('Sites not loaded yet');
      }

      if (!userList) {
        throw new Error('User list not loaded yet');
      }

      const response = await RentServices.fetchRentById(vendorRentId);
      return mapSingleItem(response);
    },
    enabled:
      !!costCenters &&
      !!costHeaders &&
      !!vendors &&
      !!categories &&
      !!status &&
      !!sites &&
      !!session.userId &&
      !!vendorRentId,
    retry: 1,
    meta: {
      successMessage: 'Vendor rent successfully fetched',
      errorMessage: 'Failed to fetch vendor rent',
      toastSuccess: false,
    },
  });
};
