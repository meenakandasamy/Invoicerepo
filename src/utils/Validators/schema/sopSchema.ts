import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseSopaSchema = z.object({
  sopName: z.string(),
  ticketType: z.string(),
  ticketCategory: z.string(),
  ticketTypeId: z.number(),
  ticketCategoryId: z.number(),
  status: z.number(),
  lastUpdatedBy: z.number(),
  companyId: z.number(),
  customerId: z.number().optional(),
  sopId: z.number().optional(),
});

export const SopSaveSchema = BaseSopaSchema;

export const SopUpdateSchema = BaseSopaSchema.partial();

// ✅ Types
export type SopDTOType = z.infer<typeof SopSaveSchema>;
export type SopUpdateDTOType = z.infer<typeof SopUpdateSchema>;
