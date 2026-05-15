import { z } from 'zod';

/*
 * Base schema (for reuse, not exported directly)
 */
export const BaseExpenseSplit = z.object({
  expenseId: z.number(),
  totalAmmountNogst: z.number().nullable(),
  totalAmountWithGst: z.number().nullable(),
  gstPercentage: z.number().nullable(),
  gstAmount: z.number().nullable(),
  amount: z.number().nullable(),
  amountApproved: z.number().nullable(),
  advanceConsumed: z.number().nullable(),
  costCentreId: z.number().nullable(),
  costCentreName: z.string().nullable(),
  costHeaderId: z.number().nullable(),
  costHeaderName: z.string().nullable(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  approverStatusId: z.number().nullable(),
  approverStatusName: z.string().nullable(),
  splitPercent: z.number().nullable(),
  expenseSplitId: z.number().optional(),
  toBeInvoiced: z.string().nullable().optional(),
  unitPrice : z.number().nullable(),
  quantity: z.number().nullable(),
  itemdetails: z.string().nullable(),
});

export const BaseExpenseSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),

  expenseId: z.number().optional(),
  expenseReqCode: z.string(),

  // New: Audit Names (to map to 'Created By' / 'Updated By' columns)
  createdByName: z.string().nullable().optional(),
  updatedByName: z.string().nullable().optional(),

  vendorId: z.number(),
  vendorName: z.string().optional(),
  vendorEmail: z.string().optional(),

  // New: Vendor Details
  vendorPocName: z.string().nullable().optional(),
  vendorCode: z.string().nullable().optional(),
  gstStatus: z.string().nullable().optional(),

  categoryId: z.number(),
  categoryName: z.string().optional(),

  remarks: z.string().optional(),
  // New: Description
  description: z.string().nullable().optional(),

  totalAmmountNoGst: z.number(),
  gstPercentage: z.number().nullable(),
  gstAmount: z.number().nullable(),
  totalValue: z.number(),
  advancePaid: z.number(),

  costCentreIds: z.array(z.number()).nullable(),
  costCentreNames: z.array(z.string()).nullable().optional(),

  costHeaderIds: z.array(z.number()).nullable(),
  costHeaderNames: z.array(z.string()).nullable().optional(),

  siteIds: z.array(z.number()),
  siteNames: z.array(z.string()).optional(),

  invoiceFilePath: z.string().nullable(),
  poLoiFilePath: z.string().nullable(),
  wcrFilePath: z.string().nullable(),
  ticketReportFilePath: z.string().nullable(),

  approverStatusId: z.number(),
  approverStatusName: z.string().nullable(),

  createdBy: z.number(),
  lastUpdatedBy: z.number().nullable(),

  poNumber: z.string(),
  invoiceNo: z.string(),
  invoiceDate: z.string(),

  // New: Invoice Status
  toBeInvoiced: z.string().nullable().optional(),

  tdsPercentage: z.number().nullable(),
  tdsAmount: z.number().nullable(),
  amountWithTds: z.number().nullable(),

  advanceId: z.number().nullable(),
  advanceConsumed: z.number().nullable(),
  sourceAdvance: z.number().nullable(),
  advanceCode: z.string().nullable(),

  amountApproved: z.number(),
  amountPayable: z.number(),

  // New: Payment Details
  amountPaid: z.number().nullable().optional(),
  paymentDate: z.string().nullable().optional(),
  transactionRef: z.string().nullable().optional(), // IMPS / NEFT

  invoice_fileType: z.string().nullable(),
  po_loi_fileType: z.string().nullable(),
  wcr_fileType: z.string().nullable(),
  ticket_report_fileType: z.string().nullable(),

  invoiceFileType: z.string().nullable(),
  poLoiFileType: z.string().nullable(),
  wcrFileType: z.string().nullable(),
  ticketReportFileType: z.string().nullable(),

  finalAmount: z.number().nullable(),

  expenseSplits: z.array(BaseExpenseSplit).optional(),

  levelId: z.number().nullable(),
  visualLevelId: z.number().nullable(),
  isPaid: z.boolean().nullable(),
  isHostBooks: z.string().nullable(),
  fpNftReference: z.string().nullable(),
  hostBooks: z.string().nullable(),
  selectedVendorName: z.string().optional(),
  companyId: z.number().nullable(),
  customerId: z.number().nullable(),
  organizationId: z.number().nullable(),
});

export const ApprovedSplitExpenditureSchema = z.object({
  expenseSplitId: z.number(),
  amountApproved: z.number(),
  approverStatusId: z.number(),
});

export const BaseExpenseApprovalSchema = z.object({
  expenseId: z.number(),
  approvedBy: z.number(),
  amountApproved: z.number(),
  remarks: z.string(),
  isAccounts: z.boolean(),
  advanceConsumed: z.number().optional(), // optional if not always present
  approvedSplitExpenditureDTO: z
    .array(ApprovedSplitExpenditureSchema)
    .optional(),
});

export const BaseExpenseRejectionSchema = z.object({
  expenseId: z.number(),
  rejectedBy: z.number(),
  levelId: z.number().optional(), // optional if not always present
  remarks: z.string(),
  isAccounts: z.boolean().optional(),
  advanceConsumed: z.number().optional(),
  approvedSplitExpenditureDTO: z
    .array(ApprovedSplitExpenditureSchema)
    .optional(),
});

/*
 * Exported schemas for creation and update
 */
export const ExpenseSaveSchema = BaseExpenseSchema;
export const ExpenseUpdateSchema = BaseExpenseSchema.partial();

export const ExpenseSplitSaveSchema = BaseExpenseSplit;
export const ExpenseSplitUpdateSchema = BaseExpenseSplit.partial();

export const ExpenseApprovalSchema = BaseExpenseApprovalSchema;
export const ExpenseRejectionSchema = BaseExpenseRejectionSchema;

/*
 * Exported types of the schemas
 */
export type ExpenseDTOType = z.infer<typeof BaseExpenseSchema>;
export type ExpenseUpdateDTOType = z.infer<typeof ExpenseUpdateSchema>;

export type ExpenseSplitType = z.infer<typeof BaseExpenseSplit>;

export type ExpenseSplitSaveType = z.infer<typeof ExpenseSplitSaveSchema>;
export type ExpenseSplitUpdateType = z.infer<typeof ExpenseSplitUpdateSchema>;

export type ExpenseApprovalType = z.infer<typeof ExpenseApprovalSchema>;
export type ExpenseRejectionType = z.infer<typeof ExpenseRejectionSchema>;