import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useVendorDropdown } from './useVendor';
import { useApproverCategory } from './useApproverCategory';
import { useApproverStatus } from './useApproverStatus';
import { useSites } from './useSite';
import { useApproverDetails } from './useApproverDetails';
import { useUserList } from './useUserList';
import type { Expense } from '@/types/expense';
import {
  ExpenseQueries,
  ExpenseServices,
} from '@/integrations/Services/expenseService';
import { ProductServices } from '@/integrations/Services/productService';

export const useExpenses = (
  session: Session,
  Method:
    | 'ALL'
    | 'COMPANY_ID'
    | 'CUSTOMER_ID'
    | 'ORG_ID'
    | 'COST_IDS'
    | 'LEVEL_ID'
    | 'COST_IDS_ADMIN'
    | 'EXPENSE_ID',
  expenseId?: string | number,
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
    COMPANY_ID = 'COMPANY_ID',
    CUSTOMER_ID = 'CUSTOMER_ID',
    ORG_ID = 'ORG_ID',
    COST_IDS = 'COST_IDS',
    COST_IDS_ADMIN = 'COST_IDS_ADMIN',
    LEVEl_ID = 'LEVEL_ID',
    ALL = 'ALL',
    EXPENSE_ID = 'EXPENSE_ID',
  }

  return useQuery({
    queryKey: expenseId
      ? [ExpenseQueries.GET_EXPENSE_BY_ID, expenseId]
      : [ExpenseQueries.GET_EXPENSE_BY_ORG_ID],
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
        throw new Error('Users not loaded yet');
      }

      if (!approverDetails) {
        throw new Error('Approver details not loaded yet');
      }

      const mapSingleExpense = (expense: any, productDropdown?: any) => {
        const safeCostCentreIds = expense.costCentreIds ?? [];
        const safeCostHeaderIds = expense.costHeaderIds ?? [];
        const safeSiteIds = expense.siteIds ?? [];
        const safeSplits = expense.expenseSplits ?? [];

        const currVendor = vendors.find((v) => v.vendorId === expense.vendorId);

        const toBeInvoiced = safeSplits.some((s: any) =>
          Boolean(s.toBeInvoiced),
        );

        const getSplitGst = (split: any) =>
          Number(
            split.gstAmount ??
              (split.amountApproved && split.gstPercentage
                ? (split.amountApproved * split.gstPercentage) / 100
                : 0),
          );

        const overallGstAmount = safeSplits.reduce(
          (sum: number, split: any) => sum + getSplitGst(split),
          0,
        );

        return {
          ...expense,

          // vendor details
          vendorName: currVendor?.vendorName ?? null,
          vendorEmail: currVendor?.emailId ?? null,
          vendorCode: currVendor?.vendorCode ?? null,
          gstStatus: currVendor?.gstNo ? 'Registered' : 'Unregistered',
          vendorPocName: expense.poc ?? null,
          advanceCode: expense.vendorAdvanceCode ?? null,
          transactionRef: expense.fpNftReference ?? null,

          // invoice flags
          toBeInvoiced: toBeInvoiced ? 'Yes' : 'No',

          // payment details
          isPaid: Boolean(expense.fpAmountPaid),
          amountPaid: expense.fpAmountPaid ?? 0,
          paymentDate: expense.fpPaymentDate ?? null,

          // GST
          gstAmount: overallGstAmount,

          // TDS
          amountWithTds:
            (expense.amountApproved ?? expense.totalAmmountNoGst) -
            ((expense.amountApproved ?? expense.totalAmmountNoGst) *
              (expense.tdsPercentage ?? 0)) /
              100,

          // cost centres
          costCentreNames: safeCostCentreIds.map(
            (id: number) =>
              costCenters.find((c) => c.costCentreId === id)?.costCentreName ??
              null,
          ),

          costCentreName: costCenters
            .filter((c) => safeCostCentreIds.includes(c.costCentreId))
            .map((c) => c.costCentreName)
            .join(', '),

          // cost headers
          costHeaderNames: safeCostHeaderIds.map(
            (id: number) =>
              costHeaders.find((h) => h.costHeaderId === id)?.costHeaderName ??
              null,
          ),

          costHeaderName: costHeaders
            .filter((h) => safeCostHeaderIds.includes(h.costHeaderId))
            .map((h) => h.costHeaderName)
            .join(', '),

          // sites
          siteNames: safeSiteIds.map(
            (id: number) =>
              sites.find((s) => s.siteId === id)?.siteName ?? null,
          ),

          siteName: sites
            .filter((s) => safeSiteIds.includes(s.siteId))
            .map((s) => s.siteName)
            .join(', '),

          // category
          categoryName:
            categories.find((c) => c.categoryId === expense.categoryId)
              ?.categoryName ?? null,

          // invoice date
          invoiceDate: expense.invoiceDate
            ? format(expense.invoiceDate, 'yyyy-MM-dd')
            : null,

          // approver status
          approverStatusName:
            status.find((s) => s.approverStatusId === expense.approverStatusId)
              ?.approveStatusName ?? null,

          // split mappings
          expenseSplits:
            safeSplits.length > 0
              ? safeSplits.map((split: any) => ({
                  ...split,

                  splitPercent: Number(
                    (expense.totalAmmountNoGst > 0
                      ? ((split.totalAmmountNogst || 0) /
                          expense.totalAmmountNoGst) *
                        100
                      : 0
                    ).toFixed(2),
                  ),

                  gstPercentage: split.gstPercentage?.toString() || '',

                  gstAmount:
                    getSplitGst(split).toFixed(2) ||
                    split.gstAmount?.toFixed(2) ||
                    '',

                  toBeInvoiced: split.toBeInvoiced ? 'Yes' : 'No',

                  approverStatusName:
                    status.find(
                      (s) => s.approverStatusId === split.approverStatusId,
                    )?.approveStatusName ?? null,

                  costCentreName:
                    costCenters.find(
                      (c) => c.costCentreId === split.costCentreId,
                    )?.costCentreName ?? null,

                  costHeaderName:
                    costHeaders.find(
                      (h) => h.costHeaderId === split.costHeaderId,
                    )?.costHeaderName ?? null,
                  itemDetails: productDropdown.find(
                    (p) => p.productId === split.productId,
                  )?.productName,
                }))
              : [
                  {
                    expenseId: 0,
                    totalAmmountNogst: null,
                    gstPercentage: null,
                    amount: null,
                    costCentreId: 0,
                    costCentreName: '',
                    amountApproved: null,
                    advanceConsumed: null,
                    costHeaderId: 0,
                    costHeaderName: '',
                    approverStatusId: null,
                    approverStatusName: null,
                    createdBy: session.userId,
                    lastUpdatedBy: session.userId,
                    splitPercent: null,
                    toBeInvoiced: 'No',
                  },
                ],

          visualLevelId: expense.levelId ? +expense.levelId - 1 : null,

          createdByName: userList.find((u) => u.userId === expense.createdBy)
            ?.firstName,

          lastUpdatedByName: userList.find(
            (u) => u.userId === expense.lastUpdatedBy,
          )?.firstName,

          nextApproverName: userList.find((u) => u.userId === expense.userId)
            ?.firstName,
        };
      };

      if (expenseId && Method === METHOED.EXPENSE_ID) {
        const resposnse = await ExpenseServices.fetchExpenseById(expenseId);
        const pd = await ProductServices.FetchProductDropdownByVendorId(
          resposnse.vendorId,
        );
        return mapSingleExpense(resposnse, pd) as Expense;
      } else {
        let expenses: Array<Expense> = [];
        if (Method === METHOED.ALL) {
          expenses = await ExpenseServices.fetchExpenses();
        } else if (Method === METHOED.COMPANY_ID) {
          expenses = await ExpenseServices.fetchExpensesByCompanyId(
            approverDetails.companyId,
          );
        } else if (Method === METHOED.CUSTOMER_ID) {
          expenses = await ExpenseServices.fetchExpensesByCustomerId(
            approverDetails.customerId,
          );
        } else if (Method === METHOED.COST_IDS) {
          expenses = await ExpenseServices.fetchExpensesByCostIds(
            approverDetails?.costCentreIds ?? [],
            approverDetails?.costHeaderIds ?? [],
            approverDetails.userId,
          );
        } else if (Method === METHOED.COST_IDS_ADMIN) {
          expenses = await ExpenseServices.fetchExpensesByCostIdsForAdmin(
            approverDetails.costCentreIds ?? [],
            approverDetails.costHeaderIds ?? [],
            approverDetails.userId,
          );
        } else if (Method === METHOED.LEVEl_ID) {
          expenses = await ExpenseServices.fetchExpensesByLevel(
            approverDetails.levelId,
          );
        } else if (Method === METHOED.ORG_ID) {
          expenses = await ExpenseServices.fetchExpensesByOrgId(
            approverDetails.organizationId ?? 1,
          );
        }

        return expenses
          .sort((a: any, b: any) => b.lastUpdatedDate - a.lastUpdatedDate)
          .map((expense: any) => mapSingleExpense(expense)) as Array<Expense>;
        //  expenses.map((expense: any) => {
        //   const safeCostCentreIds = expense.costCentreIds ?? [];
        //   const safeCostHeaderIds = expense.costHeaderIds ?? [];
        //   const safeSiteIds = expense.siteIds ?? [];
        //   const safeSplits = expense.expenseSplits ?? [];
        //   const currVendor = vendors.find(
        //     (v) => v.vendorId === expense.vendorId,
        //   );
        //   const toBeInvoiced = expense.expenseSplits?.some((s: any) =>
        //     Boolean(s.toBeInvoiced),
        //   );
        //   const getSplitGst = (split: any) =>
        //     Number(
        //       split.gstAmount ??
        //         (split.amountApproved && split.gstPercentage
        //           ? (split.amountApproved * split.gstPercentage) / 100
        //           : 0),
        //     );
        //   const overallGstAmount = safeSplits.reduce(
        //     (sum: number, split: any) => sum + getSplitGst(split),
        //     0,
        //   );

        //   return {
        //     ...expense,
        //     // vendor details
        //     vendorName: currVendor?.vendorName ?? null,
        //     vendorEmail: currVendor?.emailId ?? null,
        //     // vendorPocName: currVendor?.vendorPocName ?? null,
        //     vendorCode: currVendor?.vendorCode ?? null,
        //     gstStatus: currVendor?.gstNo ? 'Registered' : 'Unregistered',
        //     vendorPocName: expense.poc ?? null,
        //     advanceCode: expense.vendorAdvanceCode ?? null,
        //     transactionRef: expense.fpNftReference ?? null,

        //     toBeInvoiced: toBeInvoiced ? 'Yes' : 'No',
        //     isPaid: expense.fpAmountPaid ? true : false,
        //     amountPaid: expense.fpAmountPaid ?? 0,
        //     paymentDate: expense.fpPaymentDate ?? null,
        //     // gst amount
        //     gstAmount: overallGstAmount,
        //     // (((expense.amountApproved
        //     //   ? expense.amountApproved
        //     //   : expense.totalAmmountNoGst) -
        //     //   (expense.advanceConsumed ?? 0)) *
        //     //   (expense.gstPercentage ?? 0)) /
        //     // 100,

        //     // tds amount
        //     amountWithTds:
        //       (expense.amountApproved
        //         ? expense.amountApproved
        //         : expense.totalAmmountNoGst) -
        //       ((expense.amountApproved
        //         ? expense.amountApproved
        //         : expense.totalAmmountNoGst) *
        //         (expense.tdsPercentage ?? 0)) /
        //         100,

        //     // costCentreIds → costCentreNames
        //     costCentreNames: safeCostCentreIds.map(
        //       (id: number) =>
        //         costCenters.find((c) => c.costCentreId === id)
        //           ?.costCentreName ?? null,
        //     ),

        //     // Safely format invoiceDate (if null, return null)
        //     invoiceDate: expense.invoiceDate
        //       ? format(expense.invoiceDate, 'yyyy-MM-dd')
        //       : null,

        //     // categoryId → categoryName
        //     categoryName:
        //       categories.find((c) => c.categoryId === expense.categoryId)
        //         ?.categoryName ?? null,

        //     // costHeaderIds → costHeaderNames
        //     costHeaderNames: safeCostHeaderIds.map(
        //       (id: number) =>
        //         costHeaders.find((h) => h.costHeaderId === id)
        //           ?.costHeaderName ?? null,
        //     ),

        //     // approverStatusId → approverStatusName
        //     approverStatusName:
        //       status.find(
        //         (s) => s.approverStatusId === expense.approverStatusId,
        //       )?.approveStatusName ?? null,

        //     // siteIds → siteNames
        //     siteNames: safeSiteIds.map(
        //       (id: number) =>
        //         sites.find((s) => s.siteId === id)?.siteName ?? null,
        //     ),
        //     // split mappings (fully null-safe)
        //     expenseSplits: safeSplits.map((split: any) => ({
        //       ...split,
        //       splitPercent: Number(
        //         (expense.totalAmmountNoGst > 0
        //           ? ((split.totalAmmountNogst || 0) /
        //               expense.totalAmmountNoGst) *
        //             100
        //           : 0
        //         ).toFixed(2),
        //       ),
        //       gstPercentage: split.gstPercentage?.toString() || '',
        //       gstAmount:
        //         getSplitGst(split).toFixed(2) ||
        //         split.gstAmount?.toFixed(2) ||
        //         '',

        //       toBeInvoiced: split.toBeInvoiced ? 'Yes' : 'No',

        //       approverStatusName:
        //         status.find(
        //           (s) => s.approverStatusId === split.approverStatusId,
        //         )?.approveStatusName ?? null,

        //       costCentreName:
        //         costCenters.find((c) => c.costCentreId === split.costCentreId)
        //           ?.costCentreName ?? null,

        //       costHeaderName:
        //         costHeaders.find((h) => h.costHeaderId === split.costHeaderId)
        //           ?.costHeaderName ?? null,
        //     })),
        //     visualLevelId: expense.levelId ? +expense.levelId - 1 : null,
        //     createdByName: userList.find((u) => u.userId === expense.createdBy)
        //       ?.firstName,
        //     lastUpdatedByName: userList.find(
        //       (u) => u.userId === expense.lastUpdatedBy,
        //     )?.firstName,
        //     nextApproverName: userList.find((u) => u.userId === expense.userId)
        //       ?.firstName,
        //   } as Expense;
        // });
      }
    },
    enabled:
      !!costCenters &&
      !!costHeaders &&
      !!vendors &&
      !!categories &&
      !!status &&
      !!approverDetails &&
      !!sites &&
      !!session.userId &&
      (Method !== METHOED.EXPENSE_ID || !!expenseId),
    retry: 1,

    meta: {
      successMessage: 'Expenses loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load expenses',
    },
  });
};
