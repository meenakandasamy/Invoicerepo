import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BasePoloaSchema = z.object({
  sopName: z.string(),
  ticketType: z.string(),
  ticketCategory: z.number(),
  ticketTypeId: z.number(),
  ticketCategoryId: z.number(),
  status: z.number(),
  lastUpdatedBy: z.number(),
  companyId: z.number(),
  customerId: z.number().optional(),
});

export const PoloaSaveSchema = BasePoloaSchema;

export const PoloaUpdateSchema = BasePoloaSchema.partial();

// ✅ Types
export type PoloaDTOType = z.infer<typeof PoloaSaveSchema>;
export type PoloaUpdateDTOType = z.infer<typeof PoloaUpdateSchema>;
