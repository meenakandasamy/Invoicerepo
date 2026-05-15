import { z } from 'zod';

// Base Product Schema (for reuse)
const BaseCostHeaderSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  costHeaderId: z.number().optional(),
  costHeaderName: z.string(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
});

// Exported schemas for creation and update
export const CostHeaderSaveSchema = BaseCostHeaderSchema;
export const CostHeaderUpdateSchema = BaseCostHeaderSchema.partial();

// ✅ Types
export type CostHeaderDTOType = z.infer<typeof CostHeaderSaveSchema>;
export type CostHeaderUpdateDTOType = z.infer<typeof CostHeaderUpdateSchema>;
