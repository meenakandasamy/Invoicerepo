import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BasePoloaSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
 poId:z.string().optional(),
 vendorId:z.number(),
  costCentreid: z.number(),
   costHeaderid: z.number(),
  createdby: z.string().optional(),
 poNumber: z.string(),
 uploadType:z.string()

});

export const PoloaSaveSchema = BasePoloaSchema;

export const PoloaUpdateSchema = BasePoloaSchema.partial();

// ✅ Types
export type PoloaDTOType = z.infer<typeof PoloaSaveSchema>;
export type PoloaUpdateDTOType = z.infer<typeof PoloaUpdateSchema>;
