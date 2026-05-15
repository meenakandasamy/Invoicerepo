import { useQuery } from '@tanstack/react-query';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useVendorDropdown } from './useVendor';
import { useApproverCategory } from './useApproverCategory';
import { useApproverStatus } from './useApproverStatus';
import { useSites } from './useSite';
import { useApproverDetails } from './useApproverDetails';
import { useUserList } from './useUserList';
import type { VendorRentDTOType } from '@/utils/Validators/schema/RentSchema';
import { RentQueries, RentServices } from '@/integrations/Services/rentService';

export const useVendorRents = (
  session: Session,
  Method: 'COST_IDS' | 'LEVEL_ID' | 'ALL' | 'COST_IDS_ADMIN',
  vendorRentId?: string | number,
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
  }

  return useQuery<Array<VendorRentDTOType>, Error>({
    queryKey: [RentQueries.GET_RENT],
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

      let expenses: Array<VendorRentDTOType> = [];
      if (vendorRentId) {
        expenses = await RentServices.fetchRentById(vendorRentId);
      } else {
        if (Method === METHOED.COST_IDS) {
          expenses = await RentServices.fetchRentsByCostIds(
            approverDetails?.costCentreIds ?? [],
            approverDetails?.costHeaderIds ?? [],
            approverDetails?.userId ?? undefined,
          );
        } else if (Method === METHOED.ALL) {
          expenses = await RentServices.fetchRents();
        } else if (Method === METHOED.COST_IDS_ADMIN) {
          expenses = await RentServices.fetchRentsByCostIdsForAdmin(
            approverDetails?.costCentreIds ?? [],
            approverDetails?.costHeaderIds ?? [],
            approverDetails?.userId ?? undefined,
          );
        } else {
          expenses = await RentServices.fetchRentsByLevel(
            approverDetails?.levelId ?? 0,
          );
        }
      }

      return expenses.map((expense: VendorRentDTOType) => {
        const safeCostCentreIds = expense.costCentreIds ?? [];
        const safeCostHeaderIds = expense.costHeaderIds ?? [];
        const currVendor = vendors.find((v) => v.vendorId === expense.vendorId);

        return {
          ...expense,
          // vendor details
          vendorName: currVendor?.vendorName ?? null,
          vendorEmail: currVendor?.emailId ?? null,
          isPaid: expense.fpAmountPaid ? true : false,
          hostBooks:
            expense.hostBooks == false ||
            expense.hostBooks == undefined ||
            expense.hostBooks == 'No'
              ? 'No'
              : 'Yes',

          createdByName:
            userList.find((u) => u.userId === expense.createdBy)?.firstName ??
            null,
          lastUpdatedByName:
            userList.find((u) => u.userId === expense.lastUpdatedBy)
              ?.firstName ?? null,
          // vendorPocName: currVendor?.vendorPocName ?? null,
          vendorCode: currVendor?.vendorCode ?? null,
          gstStatus: currVendor?.gstNo ? 'Registered' : 'Unregistered',

          // costCentreIds → costCentreNames
          costCentreNames: safeCostCentreIds.map(
            (id) =>
              costCenters.find((c) => c.costCentreId === id)?.costCentreName ??
              null,
          ),

          // costHeaderIds → costHeaderNames
          costHeaderNames: safeCostHeaderIds.map(
            (id) =>
              costHeaders.find((h) => h.costHeaderId === id)?.costHeaderName ??
              null,
          ),

          // approverStatusId → approverStatusName
          approverStatusName:
            status.find((s) => s.approverStatusId === expense.approverStatusId)
              ?.approveStatusName ?? null,

          // Approver Deposit Status ID & Name
          approverDepositStatusId:
            expense.approverDepositStatusId === 3
              ? 3
              : (expense.vendorRentRecurrsion?.find(
                  (rec) => rec.paymentFor === 'Security Deposit',
                )?.approverStatusId ?? null),

          approverDepositStatusName:
            expense.approverDepositStatusId === 3
              ? (status.find((s) => s.approverStatusId === 3)
                  ?.approveStatusName ?? null)
              : (status.find(
                  (s) =>
                    s.approverStatusId ===
                    expense.vendorRentRecurrsion?.find(
                      (rec) => rec.paymentFor === 'Security Deposit',
                    )?.approverStatusId,
                )?.approveStatusName ?? null),

          // Approver Rent Status ID & Name
          approverRentStatusId:
            expense.approverRentStatusId === 3
              ? 3
              : expense.vendorRentRecurrsion?.find(
                    (rec) => rec.paymentFor !== 'Security Deposit',
                  )
                ? expense.vendorRentRecurrsion.find(
                    (rec) => rec.paymentFor !== 'Security Deposit',
                  )?.approverStatusId
                : expense.approverRentStatusId,

          approverRentStatusName:
            expense.approverRentStatusId === 3
              ? (status.find((s) => s.approverStatusId === 3)
                  ?.approveStatusName ?? null)
              : expense.vendorRentRecurrsion?.find(
                    (rec) => rec.paymentFor !== 'Security Deposit',
                  )
                ? status.find(
                    (s) =>
                      s.approverStatusId ===
                      expense.vendorRentRecurrsion?.find(
                        (rec) => rec.paymentFor !== 'Security Deposit',
                      )?.approverStatusId,
                  )?.approveStatusName
                : (status.find(
                    (s) => s.approverStatusId === expense.approverRentStatusId,
                  )?.approveStatusName ?? null),

          vendorRentRecurrsion:
            expense.vendorRentRecurrsion &&
            expense.vendorRentRecurrsion.map((rec) => ({
              ...rec,
              costCentreIds: expense.costCentreIds,
              costHeaderIds: expense.costHeaderIds,
              approverStatusName:
                status.find((s) => s.approverStatusId === rec.approverStatusId)
                  ?.approveStatusName ?? null,
            })),
        } as VendorRentDTOType;
      });
    },
    enabled:
      !!costCenters &&
      !!costHeaders &&
      !!vendors &&
      !!categories &&
      !!status &&
      !!approverDetails &&
      !!sites &&
      !!session.userId,
    retry: 1,

    meta: {
      successMessage: 'Rents loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load rents',
    },
  });
};
