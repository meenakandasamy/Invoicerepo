import { useQuery } from '@tanstack/react-query';
import { useApproverDetails } from './useApproverDetails';
import { useApproverCategory } from './useApproverCategory';
import { useApproverStatus } from './useApproverStatus';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useSites } from './useSite';
import { useVendorDropdown } from './useVendor';
import type { ConsolidatedData } from '@/integrations/Services/consolidatedService';
import {
  ConsolidatedDashboardQuery,
  consolidatedDashboardService,
} from '@/integrations/Services/consolidatedService';

export const useConslidatedDashboard = (session: Session) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: vendors } = useVendorDropdown();
  const { data: categories } = useApproverCategory();
  const { data: status } = useApproverStatus();
  const { data: sites } = useSites(session);
  const { data: approverDetails } = useApproverDetails(session.userId);

  return useQuery<Array<ConsolidatedData>, Error>({
    queryKey: [ConsolidatedDashboardQuery.GET_CONSOLIDATED_DASHBOARD],
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

      try {
        const data =
          await consolidatedDashboardService.getConsolidatedDashboard({
            costCentreIds: approverDetails!.costCentreIds!,
            costHeaderIds: approverDetails!.costHeaderIds!,
            levelId: approverDetails!.levelId + 1,
            userId: session.userId,
          });

        const formattedData = Array.from(
          new Map(
            data
              .filter(
                (d) =>
                  d.approverStatusId !=
                  status.find((s) => s.approveStatusName === 'Approved')
                    ?.approverStatusId,
              )
              .map((item) => [item.code, item]), // key = code
          ).values(),
        ).map((item) => {
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
            vendorName:
              item.module == 'EmployeeReimbursement'
                ? item.employeeName
                : item.module == 'ConsultantSalary'
                  ? item.consultantName
                  : (vendors.find(
                      (vendor: any) => vendor.vendorId === item.vendorId,
                    )?.vendorName ?? null),
            totalAmount: item.amountPayable ?? item.totalAmount ?? null,
          };
        });

        return formattedData;
      } catch (err: any) {
        throw new Error(err?.message || 'Error fetching vendors dropdown');
      }
    },
    enabled:
      !!costCenters &&
      !!costHeaders &&
      !!vendors &&
      !!categories &&
      !!status &&
      !!approverDetails &&
      !!sites,
    retry: 1,
    meta: {
      successMessage: 'Vendors Dropdown loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load vendors dropdown',
    },
  });
};
