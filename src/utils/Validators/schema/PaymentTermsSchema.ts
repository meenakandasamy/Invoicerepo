import { z } from 'zod';

// Base schema for Payment Terms
const BasePaymentTermsSchema = z.object({
  createdBy: z.number(),
  createdDate: z.string().optional(),
  lastUpdatedBy: z.number(),
  lastUpdatedDate: z.string().optional(),
  paymentTermsId: z.number().optional(),
  paymentTermsName: z.string(),
  description: z.string(),
  noOfInstallments: z.number(),
  status: z.number().optional(),

  // Dynamically validating installment fields
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [
      `net${i + 1}Days`,
      z.number().optional(),
    ]),
  ),
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [
      `payment${i + 1}Percentage`,
      z.number().optional(),
    ]),
  ),
});

// Exported schemas
export const PaymentTermsSaveSchema = BasePaymentTermsSchema;
export const PaymentTermsUpdateSchema = BasePaymentTermsSchema.partial();

// ✅ Types
export type PaymentTermsDTOType = z.infer<typeof PaymentTermsSaveSchema>;
export type PaymentTermsUpdateDTOType = z.infer<
  typeof PaymentTermsUpdateSchema
>;
