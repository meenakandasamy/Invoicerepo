import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useVendorDropdown } from './useVendor';
import { useApproverCategory } from './useApproverCategory';
import { useApproverStatus } from './useApproverStatus';
import { useSites } from './useSite';
import { useApproverDetails } from './useApproverDetails';
import type { VendorAdvanceType } from '@/utils/Validators/schema/VendorAdvanceSchema';
import {
  VendorAdvanceQueries,
  VendorAdvanceServices,
} from '@/integrations/Services/vendorAdvanceService';
import { useUserList } from './useUserList';

export const useVendorAdvances = (
  session: Session,
  Method: 'COST_IDS' | 'LEVEL_ID' | 'ALL' | 'COST_IDS_ADMIN' | 'ORG_ID',
) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: vendors } = useVendorDropdown();
  const { data: categories } = useApproverCategory();
  const { data: status } = useApproverStatus();
  const { data: sites } = useSites(session);
  const { data: approverDetails } = useApproverDetails(session.userId);
  const { data: userList } = useUserList(session);

  enum METHOED {
    COST_IDS = 'COST_IDS',
    COST_IDS_ADMIN = 'COST_IDS_ADMIN',
    LEVEl_ID = 'LEVEL_ID',
    ALL = 'ALL',
    ORG_ID = 'ORG_ID',
  }

  return useQuery<Array<VendorAdvanceType>, Error>({
    queryKey: [VendorAdvanceQueries.GET_ALL],
    queryFn: async () => {
      if (
        !costCenters ||
        !costHeaders ||
        !vendors ||
        !categories ||
        !status ||
        !sites ||
        !userList
      ) {
        throw new Error('Dependent data not loaded yet');
      }
      let advances;

      if (Method === METHOED.COST_IDS) {
        advances = await VendorAdvanceServices.fetchVendorAdvanceByCostIds(
          approverDetails?.costCentreIds ?? [],
          approverDetails?.costHeaderIds ?? [],
          approverDetails?.userId ?? undefined,
        );
      } else if (Method === METHOED.ALL) {
        advances = await VendorAdvanceServices.fetchAllVendorAdvances();
      } else if (Method === METHOED.COST_IDS_ADMIN) {
        advances = await VendorAdvanceServices.fetchExpensesByCostIdsForAdmin(
          approverDetails?.costCentreIds ?? [],
          approverDetails?.costHeaderIds ?? [],
          approverDetails?.userId ?? undefined,
        );
      } else if (Method === METHOED.ORG_ID) {
        advances = await VendorAdvanceServices.fetchVendorAdvanceByOrgd(
          approverDetails?.organizationId ?? 1,
        );
      }

      return advances.map((advance: any) => {
        const safeCostCentreIds = advance.costCentreIds ?? [];
        const safeCostHeaderIds = advance.costHeaderIds ?? [];
        const safeSiteIds = advance.siteIds ?? [];
        const currVendor = vendors.find((v) => v.vendorId === advance.vendorId);

        const val = advance.fpTotalAmount ?? advance.amountApproved;
        const amountApproved =
          typeof val === 'number' && !isNaN(val) ? Number(val.toFixed(2)) : 0;

        return {
          ...advance,
          // // vendor details
          // vendorName: currVendor?.vendorName ?? null,
          // vendorEmail: currVendor?.emailId ?? null,
          // // vendorPocName: currVendor?.vendorPocName ?? null,
          // vendorCode: currVendor?.vendorCode ?? null,
          gstStatus: currVendor?.gstNo ? 'Registered' : 'Unregistered',
          isPaid: advance.fpTmountPaid ? true : false,
          // Map IDs → names
          costCentreNames: safeCostCentreIds.map(
            (id: number) =>
              costCenters.find((c) => c.costCentreId === id)?.costCentreName ??
              null,
          )[0],
          costHeaderNames: safeCostHeaderIds.map(
            (id: number) =>
              costHeaders.find((h) => h.costHeaderId === id)?.costHeaderName ??
              null,
          )[0],
          siteNames: safeSiteIds.map(
            (id: number) =>
              sites.find((s) => s.siteId === id)?.siteName ?? null,
          ),
          categoryName:
            categories.find((c) => c.categoryId === advance.categoryId)
              ?.categoryName ?? null,
          approverStatusName:
            status.find((s) => s.approverStatusId === advance.approverStatusId)
              ?.approveStatusName ?? null,

          createdBy:
            userList.find((user: any) => user.userId === advance.createdBy)
              ?.userName || null,

          lastUpdatedBy:
            userList.find((user: any) => user.userId === advance.lastUpdatedBy)
              ?.userName || null,

          // Format dates safely
          createdDate: advance.createdDate,
          lastUpdatedDate: advance.lastUpdatedDate,
          dateOfPayment: advance.dateOfPayment
            ? format(new Date(advance.dateOfPayment), 'yyyy-MM-dd')
            : null,
          amountPayable: Number(
            (
              +amountApproved +
              +((amountApproved * (advance.gstPercentage || 0)) / 100)
            ).toFixed(2),
          ),
          hostBooks:
            advance.hostBooks == false || advance.hostBooks == undefined
              ? 'No'
              : 'Yes',
          advanceConsumed:
            +amountApproved === 0 ? 0 : amountApproved - advance.amountApproved,
          advanceLeft: advance.amountApproved,
          transferReference: advance.fpNftReference,
          vendorPocName: advance.vendorPoc,
          visualLevelId: advance.levelId - 1,
          nextApproverName:
            userList.find((user: any) => user.userId === advance.userId)
              ?.firstName ?? null,
          visualAmountApproved: amountApproved,
        } as VendorAdvanceType;
      }) as Array<VendorAdvanceType>;
    },
    enabled:
      !!costCenters &&
      !!costHeaders &&
      !!vendors &&
      !!categories &&
      !!status &&
      !!sites,
    retry: 1,

    meta: {
      successMessage: 'Vendor advances loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load vendor advances',
    },
  });
};
