import { z } from 'zod';

// Base Product Schema (for reuse)
const BaseCostCentreSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  costCentreId: z.number().optional(),
  costCentreName: z.string().optional(),
  siteIds: z.array(z.number()).optional(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
});

// Exported schemas for creation and update
export const CostCentreSaveSchema = BaseCostCentreSchema;
export const CostCentreUpdateSchema = BaseCostCentreSchema.partial();

// ✅ Types
export type CostCentreDTOType = z.infer<typeof CostCentreSaveSchema>;
export type CostCentreUpdateDTOType = z.infer<typeof CostCentreUpdateSchema>;
