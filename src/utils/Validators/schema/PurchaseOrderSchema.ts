import { z } from 'zod';

const BasePurchaseOrderSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  poId: z.number().optional(),
  siteName: z.string(),
  siteId: z.number(),
  povalueExcludeGst: z.number(),
  gstPercentage: z.number(),
  gstValue: z.number(),
  tdsPercent: z.number(),
  tdsValue: z.number(),
  totalInvoiceValue: z.number(),
  balancePayable: z.number(),
  amountPaid: z.number(),
  poDate: z.string(),
  lastPaymentDate: z.string().optional(),
  poNumber: z.string(),
  vendorId: z.number(),
  vendorCode: z.string().optional(),
  vendorName: z.string().optional(),
  paymentTermsId: z.number(),
  paymentTermsName: z.string().optional(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  status: z.number(),
  requestorId: z.number(),
  purchaseId: z.array(z.number()).optional(),
  category: z.string(),
});
const BasePurchasePaymentSchema = z.object({
  poId: z.number().optional(),
  poInstallmentId: z.number(),
  siteName: z.string(),
  povalueExcludeGst: z.number(),
  gstPercentage: z.number(),
  gstValue: z.number(),
  tdsPercent: z.number(),
  tdsValue: z.number(),
  totalInvoiceValue: z.number(),
  balancePayable: z.number(),
  amountPaid: z.number(),
  poDate: z.string().transform((val) => val.split('T')[0]),
  poNumber: z.string(),
  vendorId: z.number(),
  vendorCode: z.string().optional(),
  vendorName: z.string().optional(),
  paymentTermsId: z.number(),
  paymentTermsName: z.string().optional(),
  installment1: z.number(),
  payReference1: z.string(),
  category: z.string(),
  lastPaymentDate: z.string(),
  paymentDate1: z.string().transform((val) => val.split('T')[0]),
});
export const PurchaseOrderSaveSchema = BasePurchaseOrderSchema;
export const PurchaseOrderUpdateSchema = BasePurchaseOrderSchema.partial();
export const PurchaseOrderPaymentSchema = BasePurchasePaymentSchema.partial();
export type PurchaseOrderDTOType = z.infer<typeof PurchaseOrderSaveSchema>;
export type PurchaseOrderUpdateDTOType = z.infer<
  typeof PurchaseOrderUpdateSchema
>;
export type PurchaseOrderPaymentDTOType = z.infer<
  typeof PurchaseOrderPaymentSchema
>;
