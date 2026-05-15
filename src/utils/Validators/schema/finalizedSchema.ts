import { z } from 'zod';

const BaseFinalizedPaymentSchema = z.object({
  nftReference: z.string(),
  paymentDate: z.string(),
  approverStatusId: z.number(),
  amountPaid: z.number(),
  remarks: z.string(),
  finalizedPaymentId: z.number(),
  approveStatusName: z.string().optional(),
  actionRemarks: z.string().optional(),
  totalAmount: z.number().optional(),
  organizationId: z.string().nullable(),
});
const FinalizedPaymentSchema = z.object({
  amountPending: z.number(),
  nftReference: z.string(),
  bankAccountNo: z.string(),
  paymentDate: z.string(),
  approverStatusId: z.number(),
  amountPaid: z.number(),
  actionRemarks: z.string(),
  approverStatusName: z.string(),
  approveStatusName: z.string(),
  bankIfscCode: z.string(),
  contactNo: z.string(),
  paymentCode: z.string(),
  createdDate: z.string(),
  vendorId: z.number(),
  vendorName: z.any(),
  sourceType: z.string(),
  finalizedPaymentId: z.number(),
  costCentreNames: z.any(),
  costHeaderNames: z.any(),
  //   costCentreNames: string[],
  // costHeaderNames: string[],
});

export const FinalizedPaymentsSchema = z.object({
  createdDate: z.string(), // "2025-11-25T05:13:16.206+00:00"
  lastUpdatedDate: z.string(), // "2025-11-27T04:53:12.555+00:00"
  finalizedPaymentId: z.number(), // 1
  paymentCode: z.string(), // "PAY-2025-001"
  vendorId: z.number(), // 4
  employeeId: z.number().nullable(), // null
  payeeName: z.string(), // "Inspire Clean Energy"
  totalAmount: z.number(), // 50000
  amountPaid: z.number(), // 15000
  amountPending: z.number(), // 35000
  contactNo: z.number(), // 9876543210
  bankAccountNo: z.number(), // 922030000000023
  bankIfscCode: z.string(), // "HDFC"
  paymentDate: z.string(), // "2025-11-18T18:30:00"
  nftReference: z.string(), // "NFT1234567"
  approverStatusId: z.number(), // 5
  actionRemarks: z.string().nullable(), // null
  gstStatus: z.string().nullable,

  costCentreIds: z.array(z.number()).nullable(), // [1]
  costHeaderIds: z.array(z.number()).nullable(), // [2]
  siteIds: z.array(z.number()).nullable(), // [44]

  sourceReference: z.string(), // "VEN20251125004"
  sourceType: z.string(), // "VENDOR_REGISTRATION"
});

export type FinalizedPaymentsDTOType = z.infer<typeof FinalizedPaymentsSchema>;
export const FinalizedPaymentSaveSchema = BaseFinalizedPaymentSchema;
export const FinalizedPaymentUpdateSchema =
  BaseFinalizedPaymentSchema.partial();
export type FinalizedPaymentSaveDTOType = z.infer<
  typeof FinalizedPaymentSaveSchema
>;
export type FinalizedPaymentUpdateDTOType = z.infer<
  typeof FinalizedPaymentUpdateSchema
>;
export type FinalizedPaymentDTOType = z.infer<typeof FinalizedPaymentSchema>;
