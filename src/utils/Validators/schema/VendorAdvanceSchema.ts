import { z } from 'zod';

/**
 * Vendor Advance Base Schema
 */
export const VendorAdvanceSchema = z.object({
  // --- Existing Identity Fields ---
  vendorAdvanceId: z.number(),
  vendorAdvanceCode: z.string(),
  createdDate: z.string(),
  createdBy: z.number(),
  createdByName: z.string().optional().nullable(),

  // --- Vendor Details (Added Missing Fields) ---
  vendorId: z.number(),
  vendorName: z.string(),
  vendorPocName: z.string().nullable(), // New
  vendorCode: z.string().nullable(), // New
  vendorEmail: z.string().nullable(), // New
  gstStatus: z.string().nullable(), // New
  vendorEmailId: z.string().nullable(),

  // --- Category ---
  categoryId: z.number(),
  categoryName: z.string(),

  // --- Financials ---
  description: z.string(),
  totalAmountNoGst: z.number(),
  gstPercentage: z.number().nullable(),
  gstAmount: z.number().nullable(),
  totalAmountInGst: z.number(), // Serves as Advance Amount (Incl GST)
  tdsPercentage: z.number().nullable(),
  tdsAmount: z.number().nullable(),
  totalAmount: z.number(),

  // --- Payment & Consumption (Added Missing Fields) ---
  amountApproved: z.number(),
  amountPayable: z.number().nullable(),
  amountPaid: z.number(),
  dateOfPayment: z.string().nullable(), // Changed to nullable as payment might not be done
  transferReference: z.string().nullable(), // New (IMPS/NEFT Ref)
  advanceLeft: z.number().nullable(), // New (Not Consumed)
  advanceConsumed: z.number().nullable(), // New

  // --- Status & Workflow ---
  approverStatusId: z.number(),
  approverStatusName: z.string(),
  levelId: z.number(),
  isPaid: z.boolean(),
  hostBooks: z.string(),

  // --- Metadata ---
  lastUpdatedBy: z.number().nullable(),
  lastUpdatedByName: z.string().nullable(),
  lastUpdatedDate: z.string(), // ISO datetime
  remarks: z.string().optional().nullable(),

  // --- Cost/Site Allocations ---
  costCentreNames: z.array(z.string()).nullable(),
  costHeaderNames: z.array(z.string()).nullable(),
  siteNames: z.array(z.string()).nullable(),
  costCentreIds: z.array(z.number()).nullable(),
  costHeaderIds: z.array(z.number()).nullable(),
  siteIds: z.array(z.number()).nullable(),

  // --- Files ---
  poLoiFilepath: z.string().nullable(),
  invoiceFilepath: z.string().nullable(),
  signedConfirmationFilepath: z.string().nullable(),
  poLoiFileType: z.string().nullable(),
  invoiceFileType: z.string().nullable(),
  signedConfirmFileType: z.string().nullable(),

  // Organization schema
  organizationId: z.string().nullable(),
});

/**
 * Vendor Advance Approval Schema
 */
export const VendorAdvanceApprovalSchema = z.object({
  vendorAdvanceId: z.number(),
  approvedBy: z.number(),
  isAccounts: z.boolean(),
  amountApproved: z.number(),
  remarks: z.string(),
});

/**
 * Vendor Advance Rejection Schema
 */
export const VendorAdvanceRejectionSchema = z.object({
  vendorAdvanceId: z.number(),
  rejectedBy: z.number(),
  remarks: z.string(),
  levelId: z.number(),
});

/**
 * Unified Action Schema (approve or reject)
 */
export const VendorAdvanceActionSchema = z.union([
  VendorAdvanceApprovalSchema,
  VendorAdvanceRejectionSchema,
]);

/**
 * Vendor Advance Log Schema
 */
export const VendorAdvanceLogSchema = z.object({
  vendorAdvanceLogId: z.number(),
  action: z.enum([
    'CREATE',
    'UPDATE',
    'APPROVE',
    'REJECT',
    'DELETE',
    'PAYMENT',
  ]),
  changes: z.string(),
  occuredOn: z.string(), // ISO datetime
  vendorAdvanceId: z.number(),
  updatedBy: z.number(),
});

/**
 * Vendor Advance With Action + Logs
 */
export const VendorAdvanceWithActionSchema = VendorAdvanceSchema.extend({
  action: VendorAdvanceActionSchema.optional(),
  logs: z.array(VendorAdvanceLogSchema).optional(),
});

/**
 * TypeScript types
 */
export type VendorAdvanceType = z.infer<typeof VendorAdvanceSchema>;
export type VendorAdvanceApprovalType = z.infer<
  typeof VendorAdvanceApprovalSchema
>;
export type VendorAdvanceRejectionType = z.infer<
  typeof VendorAdvanceRejectionSchema
>;
export type VendorAdvanceActionType = z.infer<typeof VendorAdvanceActionSchema>;
export type VendorAdvanceLogType = z.infer<typeof VendorAdvanceLogSchema>;
export type VendorAdvanceUpdateType = Partial<VendorAdvanceType>;
export type VendorAdvanceWithActionType = z.infer<
  typeof VendorAdvanceWithActionSchema
>;
