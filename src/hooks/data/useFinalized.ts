import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useVendorDropdown } from './useVendor';
import { useApproverCategory } from './useApproverCategory';
import { useApproverStatus } from './useApproverStatus';
import { useSites } from './useSite';
import { useApproverDetails } from './useApproverDetails';
import type { finalizedPayment } from '@/models/finalizedPaymentDTO';
import {
  FinalizedPaymentQuery,
  FinalizedPaymentServices,
} from '@/integrations/Services/finalizedPayment';
import { VendorAdvanceServices } from '@/integrations/Services/vendorAdvanceService';

export const useFinalized = (
  session: Session,
  method: 'GET_ALL' | 'GET_BY_ORG_ID',
) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: vendors } = useVendorDropdown();
  const { data: categories } = useApproverCategory();
  const { data: status } = useApproverStatus();
  const { data: sites } = useSites(session);
  const { data: approverDetails } = useApproverDetails(session.userId);

  return useQuery<Array<finalizedPayment>, Error>({
    queryKey: [FinalizedPaymentQuery.GET_ALL_FINALIZED_PAYMENT],
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
      console.log(status);

      if (!sites) {
        throw new Error('Sites not loaded yet');
      }

      if (!approverDetails) {
        throw new Error('Approver details not loaded yet');
      }

      enum METHOD {
        GET_ALL = 'GET_ALL',
        GET_BY_ORG_ID = 'GET_BY_ORG_ID',
      }

      let finalized: any = [];
      if (method === METHOD.GET_ALL) {
        finalized = await FinalizedPaymentServices.FetchAllFinalizedPayments();
      } else if (method === METHOD.GET_BY_ORG_ID) {
        finalized = await FinalizedPaymentServices.FetchFinalizedPaymentByOrgId(
          approverDetails.organizationId ?? 1,
        );
      }

      return finalized.map((payment: finalizedPayment) => {
        const safeCostCentreIds = payment.costCentreIds ?? [];
        const safeCostHeaderIds = payment.costHeaderIds ?? [];

        const safeSiteIds = payment.siteIds ?? [];

        return {
          ...payment,
          gstStatus:
            payment.gstStatus == 1 || payment.gstStatus === 'Registered'
              ? 'Registered'
              : 'Unregistered',
          costCentreNames: safeCostCentreIds.map(
            (id) =>
              costCenters.find((c) => c.costCentreId === id)?.costCentreName ??
              null,
          ),

          // vendorId → vendorName
          // vendorName:payment.payeeName,

          // vendorId → vendorEmail
          vendorEmail:
            vendors.find((v) => v.vendorId === payment.vendorId)?.emailId ??
            null,
          vendorCode:
            vendors.find((v) => v.vendorId === payment.vendorId)?.vendorCode ??
            null,

          // costHeaderIds → costHeaderNames
          costHeaderNames: safeCostHeaderIds.map(
            (id) =>
              costHeaders.find((h) => h.costHeaderId === id)?.costHeaderName ??
              null,
          ),

          // approverStatusId → approverStatusName
          // approverStatusId → approverStatusName
          approverStatusName:
            status.find((s) => s.approverStatusId === payment.approverStatusId)
              ?.approveStatusName ?? null,

          // siteIds → siteNames
          siteNames: safeSiteIds.map(
            (id) => sites.find((s) => s.siteId === id)?.siteName ?? null,
          ),
          // split mappings (fully null-safe)
        } as finalizedPayment;
      }) as Array<finalizedPayment>;
    },
    enabled:
      !!costCenters &&
      !!costHeaders &&
      !!vendors &&
      !!categories &&
      !!status &&
      !!sites,
    retry: 1,

    gcTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      successMessage: 'Finalized payments loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load finalized payments.',
    },
  });
};
