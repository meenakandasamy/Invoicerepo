import { useQuery } from '@tanstack/react-query';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useSites } from './useSite';
import { useUserList } from './useUserList';
import { useApproverStatus } from './useApproverStatus';
import { useApproverDetails } from './useApproverDetails';
import {
  EmployeeQueries,
  EmployeeServices,
} from '@/integrations/Services/employeeServices';

export const useReimbrushment = (
  session: Session,
  method: 'GET_ALL' | 'GET_BY_ORG_ID' | 'GET_BY_ID',
  reimbrusementId?: string | number,
) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: sites } = useSites(session);
  const { data: userList } = useUserList(session);
  const { data: status } = useApproverStatus();
  const { data: approverDetails } = useApproverDetails(session.userId);

  const allDependenciesLoaded =
    !!costCenters &&
    !!costHeaders &&
    !!sites &&
    !!userList &&
    !!status &&
    !!approverDetails;

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
      nextApproverName: userList.find((u) => u.userId === item.userId)
        ?.firstName,
      createdByName:
        userList.find((user: any) => user.userId === item.createdBy)
          ?.userName || null,

      lastUpdatedByName:
        userList.find((user: any) => user.userId === item.lastUpdatedBy)
          ?.userName || null,

      approverStatusName:
        status.find((s) => s.approverStatusId === item.approverStatusId)
          ?.approveStatusName ?? null,
      isPaid: item.fpAmountPaid ? true : false,
      hostBooks:
        item.hostBooks == false ||
        item.hostBooks == undefined ||
        item.hostBooks == 'No'
          ? 'No'
          : 'Yes',
      visualLevelId: item.levelId ? +item.levelId - 1 : null,
    };
  };

  return useQuery({
    queryKey: reimbrusementId
      ? [EmployeeQueries.GET_EMPLOYEE_REIMBURSEMENT_BY_ID, reimbrusementId]
      : [EmployeeQueries.GET_ALL_EMPLOYEE_REIMBURSEMENT],

    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }
      enum METHOD {
        GET_ALL = 'GET_ALL',
        GET_BY_ORG_ID = 'GET_BY_ORG_ID',
        GET_BY_ID = 'GET_BY_ID',
      }

      if (reimbrusementId && method === METHOD.GET_BY_ID) {
        const item =
          await EmployeeServices.fetchReimbursementById(reimbrusementId);
        return mapSingleItem(item);
      }

      let response = [];
      if (method === METHOD.GET_ALL) {
        await EmployeeServices.FetchAllEmployeeReimbursement();
      } else if (method === METHOD.GET_BY_ORG_ID) {
        response = await EmployeeServices.FetchReimbursementByOrgId(
          approverDetails.organizationId ?? 1,
        );
      }
      return response.map(mapSingleItem);
    },

    enabled: allDependenciesLoaded,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    meta: {
      successMessage: 'Reimbursement loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load reimbursement',
    },
  });
};
