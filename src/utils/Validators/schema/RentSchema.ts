import { z } from 'zod';

export const rentRecurrsionSchema = z.object({
  rentRecurrsionId: z.number(),
  rentRequestCode: z.string(),
  vendorRentId: z.number(),
  paymentFor: z.string(),
  amountPaid: z.number().nullable(),
  approverStatusId: z.number(),
  levelId: z.number(),
  paymentId: z.number().nullable(),
  amountToPay: z.number(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  approvedAmount: z.number().nullable(),
  approverStatusName: z.string().nullable(),
  createdDate: z.string(),
  lastUpdatedDate: z.string(),
});

/*
 * Base Vendor Rent Schema (main schema)
 */
export const BaseVendorRentSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),

  vendorRentId: z.number().optional(),
  vendorRentCode: z.string(),

  // ---------- Audit Names ----------
  createdBy: z.number(),
  createdByName: z.string().nullable().optional(),

  lastUpdatedBy: z.number(),
  updatedByName: z.string().nullable().optional(),

  // ---------- Vendor Details ----------
  vendorId: z.number(),
  vendorName: z.string().optional(),
  vendorEmail: z.string().nullable().optional(),
  vendorCode: z.string().nullable().optional(),
  vendorPocName: z.string().nullable().optional(),

  // ---------- Property / Rent Info ----------
  propertyType: z.string(), // ID-like value
  propertyTypeName: z.string().optional(), // corresponding name
  address: z.string(),

  tenure: z.number(), // months

  // ---------- Amount / GST / TDS ----------
  securityDepositAmount: z.number(),
  rentAmount: z.number(),

  gstSlab: z.number(),
  gstAmount: z.number(),
  totalAmountWithGST: z.number(),

  tdsPercentage: z.number(),
  tdsAmount: z.number(),

  totalAmount: z.number(), // final payable without splitting

  // ---------- Costing ----------
  costHeaderIds: z.array(z.number()).nullable().optional(),
  costHeaderNames: z.array(z.string()).nullable().optional(),

  costCentreIds: z.array(z.number()).nullable().optional(),
  costCentreNames: z.array(z.string()).nullable().optional(),

  providedProducts: z.any().nullable().optional(),

  // ---------- Approval Status ----------
  approverStatusId: z.number(),
  approverStatusName: z.string().nullable().optional(),

  approverRentStatusId: z.number(),
  approverRentStatusName: z.string().nullable().optional(),

  approverDepositStatusId: z.number(),
  approverDepositStatusName: z.string().nullable().optional(),

  // ---------- Payment ----------
  paymentDueDate: z.string(),
  dateOfOccupancy: z.string(),

  // Optional extended payment fields (uncomment if needed)
  // amountPaid: z.number().nullable().optional(),
  // paymentDate: z.string().nullable().optional(),
  // transactionRef: z.string().nullable().optional(),

  // ---------- File Meta (Optional – uncomment if applicable) ----------
  // agreementFilePath: z.string().nullable().optional(),
  // agreementFileType: z.string().nullable().optional(),

  // ---------- Flags ----------
  rentFlagCount: z.number().nullable().optional(),

  // ---------- Additional Visual Levels (if required) ----------
  levelId: z.number().nullable().optional(),
  visualLevelId: z.number().nullable().optional(),

  vendorRentRecurrsion: z.array(rentRecurrsionSchema).nullable().optional(),
  fpAmountPaid: z.number().nullable().optional(),
  isPaid: z.boolean(),
  hostBooks: z.any(),
  organizationId: z.string().nullable().optional(),
});

export const BaseVendorRentApprovalSchema = z.object({
  rentRecurrsionId: z.number(),
  approvedBy: z.number(),
  isAccounts: z.boolean(),
  amountApproved: z.number(),
  remarks: z.string(),
});

export const BaseVendorRentRejectionSchema = z.object({
  rentRecurrsionId: z.number(),
  rejectedBy: z.number(),
  remarks: z.string(),
  levelId: z.number(),
});

/*
 * Exported schemas for creation and update
 */
export const VendorRentSaveSchema = BaseVendorRentSchema;
export const VendorRentUpdateSchema = BaseVendorRentSchema.partial();

export const VendorRentApprovalSchema = BaseVendorRentApprovalSchema;
export const VendorRentRejectionSchema = BaseVendorRentRejectionSchema;

/*
 * Exported types
 */
export type VendorRentDTOType = z.infer<typeof BaseVendorRentSchema>;
export type RentRecurrsionType = z.infer<typeof rentRecurrsionSchema>;
export type VendorRentUpdateDTOType = z.infer<typeof VendorRentUpdateSchema>;
export type VendorRentApprovalDTOType = z.infer<
  typeof VendorRentApprovalSchema
>;
export type VendorRentRejectionDTOType = z.infer<
  typeof VendorRentRejectionSchema
>;
