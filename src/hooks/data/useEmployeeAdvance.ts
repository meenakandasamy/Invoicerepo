import { useQuery } from '@tanstack/react-query';
import { useApproverStatus } from './useApproverStatus';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useSites } from './useSite';
import { useUserList } from './useUserList';
import {
  EmployeeQueries,
  EmployeeServices,
} from '@/integrations/Services/employeeServices';

export const useEmployeeAdvance = (
  session: Session,
  advanceId?: string | number,
) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: sites } = useSites(session);
  const { data: userList } = useUserList(session);
  const { data: status } = useApproverStatus();

  const allDependenciesLoaded =
    !!costCenters && !!costHeaders && !!sites && !!userList && !!status;

  const mapSingleItem = (item: any) => {
    const safeCostCentreIds = item.costCentreIds ?? [];
    const safeCostHeaderIds = item.costHeaderIds ?? [];
    const safeSiteIds = item.siteIds ?? [];
    if (!allDependenciesLoaded) return null;
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
    queryKey: advanceId
      ? [EmployeeQueries.GET_EMPLOYEE_ADVANCE_BY_ID, advanceId]
      : [EmployeeQueries.GET_ALL_EMPLOYEE_ADVANCE],
    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }

      if (advanceId) {
        const item = await EmployeeServices.fetchEmployeeAdvanceById(advanceId);
        return mapSingleItem(item);
      }
      const response = await EmployeeServices.fetchAllEmployeeAdvance();
      return response;
    },
    enabled: allDependenciesLoaded,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    meta: {
      successMessage: 'Employee Advance loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load employee advance',
    },
  });
};
